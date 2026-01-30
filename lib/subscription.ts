import { db } from "@/lib/db";
import { PLANS, TRIAL_PERIOD_DAYS, PlanType } from "@/lib/stripe";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";

export type SubscriptionInfo = {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  isActive: boolean;
  isTester: boolean;
  isTrialing: boolean;
  trialEndsAt: Date | null;
  trialDaysRemaining: number | null;
  currentPeriodEnd: Date | null;
  canAccessApp: boolean;
  limits: {
    maxUsers: number | null;
    maxUnits: number | null;
  };
};

// Get subscription info for a company
export async function getSubscriptionInfo(companyId: string): Promise<SubscriptionInfo | null> {
  const subscription = await db.subscription.findUnique({
    where: { companyId },
  });

  if (!subscription) {
    return null;
  }

  const now = new Date();
  const isTrialing = subscription.status === "TRIALING";
  const trialEndsAt = subscription.trialEndsAt;
  
  let trialDaysRemaining: number | null = null;
  if (isTrialing && trialEndsAt) {
    const diffMs = trialEndsAt.getTime() - now.getTime();
    trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Determine if user can access the app
  const canAccessApp = 
    subscription.isTester || // Testers always have access
    subscription.status === "ACTIVE" ||
    (subscription.status === "TRIALING" && trialEndsAt && trialEndsAt > now) ||
    subscription.status === "PAST_DUE"; // Give grace period for past due

  // Get limits from plan config or subscription overrides
  const planConfig = PLANS[subscription.plan];
  const limits = {
    maxUsers: subscription.maxUsers ?? planConfig?.limits.maxUsers ?? null,
    maxUnits: subscription.maxUnits ?? planConfig?.limits.maxUnits ?? null,
  };

  return {
    status: subscription.status,
    plan: subscription.plan,
    isActive: subscription.status === "ACTIVE",
    isTester: subscription.isTester,
    isTrialing,
    trialEndsAt,
    trialDaysRemaining,
    currentPeriodEnd: subscription.currentPeriodEnd,
    canAccessApp,
    limits,
  };
}

// Create initial subscription for new company (starts trial)
export async function createTrialSubscription(companyId: string): Promise<void> {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_PERIOD_DAYS);

  await db.subscription.create({
    data: {
      companyId,
      status: "TRIALING",
      plan: "STARTER",
      trialEndsAt,
    },
  });
}

// Check if company has exceeded plan limits
export async function checkPlanLimits(companyId: string): Promise<{
  usersExceeded: boolean;
  unitsExceeded: boolean;
  currentUsers: number;
  currentUnits: number;
  maxUsers: number | null;
  maxUnits: number | null;
}> {
  const [subscription, userCount, unitCount] = await Promise.all([
    db.subscription.findUnique({ where: { companyId } }),
    db.companyMember.count({ where: { companyId } }),
    db.unit.count({ where: { companyId, archivedAt: null, isActive: true } }),
  ]);

  if (!subscription) {
    return {
      usersExceeded: false,
      unitsExceeded: false,
      currentUsers: userCount,
      currentUnits: unitCount,
      maxUsers: null,
      maxUnits: null,
    };
  }

  const planConfig = PLANS[subscription.plan];
  const maxUsers = subscription.maxUsers ?? planConfig?.limits.maxUsers ?? null;
  const maxUnits = subscription.maxUnits ?? planConfig?.limits.maxUnits ?? null;

  return {
    usersExceeded: maxUsers !== null && userCount > maxUsers,
    unitsExceeded: maxUnits !== null && unitCount > maxUnits,
    currentUsers: userCount,
    currentUnits: unitCount,
    maxUsers,
    maxUnits,
  };
}

// Update subscription from Stripe webhook
export async function updateSubscriptionFromStripe(
  companyId: string,
  data: {
    status: SubscriptionStatus;
    plan?: SubscriptionPlan;
    stripeSubscriptionId: string;
    stripePriceId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    canceledAt?: Date | null;
  }
): Promise<void> {
  await db.subscription.update({
    where: { companyId },
    data: {
      status: data.status,
      plan: data.plan,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      canceledAt: data.canceledAt,
      // Clear trial info when subscription becomes active
      ...(data.status === "ACTIVE" && { trialEndsAt: null }),
    },
  });
}

// Mark company as tester (admin function)
export async function setTesterStatus(
  companyId: string,
  isTester: boolean
): Promise<void> {
  await db.subscription.update({
    where: { companyId },
    data: { isTester },
  });
}

// Extend trial period (admin function)
export async function extendTrial(
  companyId: string,
  additionalDays: number
): Promise<Date> {
  const subscription = await db.subscription.findUnique({
    where: { companyId },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const baseDate = subscription.trialEndsAt || new Date();
  const newTrialEndsAt = new Date(baseDate);
  newTrialEndsAt.setDate(newTrialEndsAt.getDate() + additionalDays);

  await db.subscription.update({
    where: { companyId },
    data: {
      trialEndsAt: newTrialEndsAt,
      trialExtendedAt: new Date(),
      trialExtendedDays: (subscription.trialExtendedDays || 0) + additionalDays,
      status: "TRIALING", // Ensure status is trialing
    },
  });

  return newTrialEndsAt;
}
