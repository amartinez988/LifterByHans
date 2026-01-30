import Stripe from "stripe";

// Initialize Stripe with API key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

// Plan configuration
export const PLANS = {
  STARTER: {
    name: "Starter",
    description: "For small elevator companies",
    price: 4900, // $49.00 in cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      "Up to 3 users",
      "Up to 100 units",
      "Basic reporting",
      "Email support",
    ],
    limits: {
      maxUsers: 3,
      maxUnits: 100,
    },
  },
  PROFESSIONAL: {
    name: "Professional",
    description: "For growing companies",
    price: 14900, // $149.00 in cents
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    features: [
      "Up to 10 users",
      "Unlimited units",
      "Analytics dashboard",
      "Customer portal",
      "Priority support",
    ],
    limits: {
      maxUsers: 10,
      maxUnits: null, // unlimited
    },
  },
  BUSINESS: {
    name: "Business",
    description: "For established companies",
    price: 29900, // $299.00 in cents
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    features: [
      "Unlimited users",
      "Unlimited units",
      "Advanced analytics",
      "API access",
      "White-label options",
      "Dedicated support",
    ],
    limits: {
      maxUsers: null, // unlimited
      maxUnits: null, // unlimited
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

// Default trial period in days
export const TRIAL_PERIOD_DAYS = 14;

// Helper to get plan by price ID
export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.priceId === priceId) {
      return plan as PlanType;
    }
  }
  return null;
}

// Create or get Stripe customer for a company
export async function getOrCreateStripeCustomer(
  companyId: string,
  companyName: string,
  ownerEmail: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email: ownerEmail,
    name: companyName,
    metadata: {
      companyId,
    },
  });

  return customer.id;
}

// Create checkout session for new subscription
export async function createCheckoutSession({
  customerId,
  priceId,
  companyId,
  successUrl,
  cancelUrl,
  trialDays,
}: {
  customerId: string;
  priceId: string;
  companyId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}): Promise<Stripe.Checkout.Session> {
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      companyId,
    },
    subscription_data: {
      metadata: {
        companyId,
      },
    },
  };

  // Add trial if specified
  if (trialDays && trialDays > 0) {
    sessionConfig.subscription_data!.trial_period_days = trialDays;
  }

  return stripe.checkout.sessions.create(sessionConfig);
}

// Create billing portal session for managing subscription
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
  return stripe.subscriptions.cancel(subscriptionId);
}

// Resume canceled subscription
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// Update subscription plan
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: "create_prorations",
  });
}
