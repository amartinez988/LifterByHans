import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { 
  stripe, 
  PLANS, 
  createCheckoutSession, 
  getOrCreateStripeCustomer 
} from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: "STARTER" | "PROFESSIONAL" | "BUSINESS" };

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = PLANS[plan].priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Plan not configured in Stripe" },
        { status: 500 }
      );
    }

    // Get user's company
    const membership = await db.companyMember.findFirst({
      where: { userId: session.user.id },
      include: { 
        company: { 
          include: { 
            owner: true,
            subscription: true 
          } 
        } 
      },
    });

    if (!membership?.company) {
      return NextResponse.json({ error: "No company found" }, { status: 400 });
    }

    const company = membership.company;
    const subscription = company.subscription;

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      company.id,
      company.name,
      company.owner.email,
      subscription?.stripeCustomerId
    );

    // Update subscription with customer ID if needed
    if (subscription && !subscription.stripeCustomerId) {
      await db.subscription.update({
        where: { companyId: company.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      companyId: company.id,
      successUrl: `${baseUrl}/app/settings/billing?success=true`,
      cancelUrl: `${baseUrl}/app/settings/billing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
