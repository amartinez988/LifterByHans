import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { db } from "@/lib/db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Map Stripe status to our status
function mapStripeStatus(stripeStatus: string): "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" {
  switch (stripeStatus) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    case "unpaid":
      return "UNPAID";
    default:
      return "ACTIVE";
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const companyId = session.metadata?.companyId;
  if (!companyId) {
    console.error("No companyId in checkout session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Update subscription with Stripe IDs
  await db.subscription.update({
    where: { companyId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    },
  });

  console.log(`Checkout completed for company ${companyId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const companyId = subscription.metadata?.companyId;
  if (!companyId) {
    // Try to find by Stripe subscription ID
    const existing = await db.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!existing) {
      console.error("Cannot find company for subscription:", subscription.id);
      return;
    }
    await updateSubscriptionRecord(existing.companyId, subscription);
  } else {
    await updateSubscriptionRecord(companyId, subscription);
  }
}

async function updateSubscriptionRecord(
  companyId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = priceId ? getPlanByPriceId(priceId) : null;

  // Access period timestamps from the raw subscription object
  const subData = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
  };

  const updateData: Record<string, unknown> = {
    status: mapStripeStatus(subscription.status),
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId || undefined,
    currentPeriodStart: subData.current_period_start 
      ? new Date(subData.current_period_start * 1000) 
      : null,
    currentPeriodEnd: subData.current_period_end 
      ? new Date(subData.current_period_end * 1000) 
      : null,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
  };

  if (plan) {
    updateData.plan = plan;
  }

  // Clear trial when subscription becomes active
  if (subscription.status === "active") {
    updateData.trialEndsAt = null;
  }

  await db.subscription.update({
    where: { companyId },
    data: updateData,
  });

  console.log(`Subscription updated for company ${companyId}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existing = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (existing) {
    await db.subscription.update({
      where: { companyId: existing.companyId },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    });

    console.log(`Subscription canceled for company ${existing.companyId}`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const invoiceData = invoice as unknown as { subscription?: string };
  const subscriptionId = invoiceData.subscription;
  if (!subscriptionId) return;

  const existing = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (existing) {
    await db.subscription.update({
      where: { companyId: existing.companyId },
      data: {
        status: "ACTIVE",
      },
    });

    console.log(`Payment succeeded for company ${existing.companyId}`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceData = invoice as unknown as { subscription?: string };
  const subscriptionId = invoiceData.subscription;
  if (!subscriptionId) return;

  const existing = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (existing) {
    await db.subscription.update({
      where: { companyId: existing.companyId },
      data: {
        status: "PAST_DUE",
      },
    });

    console.log(`Payment failed for company ${existing.companyId}`);
  }
}
