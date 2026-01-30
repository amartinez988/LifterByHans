import { db } from "@/lib/db";
import { getSubscriptionInfo } from "@/lib/subscription";

export type SubscriptionCheckResult = {
  hasAccess: boolean;
  reason?: "no_subscription" | "trial_expired" | "canceled" | "past_due";
  subscription?: Awaited<ReturnType<typeof getSubscriptionInfo>>;
  daysRemaining?: number;
};

/**
 * Check if a company has access to the app based on their subscription.
 * Returns access status and reason if blocked.
 */
export async function checkSubscriptionAccess(
  companyId: string
): Promise<SubscriptionCheckResult> {
  const subscriptionInfo = await getSubscriptionInfo(companyId);

  // No subscription at all
  if (!subscriptionInfo) {
    return {
      hasAccess: false,
      reason: "no_subscription",
    };
  }

  // Testers always have access
  if (subscriptionInfo.isTester) {
    return {
      hasAccess: true,
      subscription: subscriptionInfo,
    };
  }

  // Active subscription - full access
  if (subscriptionInfo.status === "ACTIVE") {
    return {
      hasAccess: true,
      subscription: subscriptionInfo,
    };
  }

  // Trialing - check if still valid
  if (subscriptionInfo.status === "TRIALING") {
    if (subscriptionInfo.trialEndsAt && subscriptionInfo.trialEndsAt > new Date()) {
      return {
        hasAccess: true,
        subscription: subscriptionInfo,
        daysRemaining: subscriptionInfo.trialDaysRemaining ?? undefined,
      };
    } else {
      return {
        hasAccess: false,
        reason: "trial_expired",
        subscription: subscriptionInfo,
      };
    }
  }

  // Past due - give a grace period (still allow access but show warning)
  if (subscriptionInfo.status === "PAST_DUE") {
    return {
      hasAccess: true, // Allow access but should show warning
      reason: "past_due",
      subscription: subscriptionInfo,
    };
  }

  // Canceled or other status
  if (subscriptionInfo.status === "CANCELED") {
    return {
      hasAccess: false,
      reason: "canceled",
      subscription: subscriptionInfo,
    };
  }

  // Default: no access
  return {
    hasAccess: false,
    subscription: subscriptionInfo,
  };
}
