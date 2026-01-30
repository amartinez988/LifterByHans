import { redirect } from "next/navigation";
import { Check, Crown, Zap, Building2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getCurrentMembership } from "@/lib/team";
import { PLANS } from "@/lib/stripe";
import { getSubscriptionInfo, checkPlanLimits } from "@/lib/subscription";

import { BillingActions } from "./billing-actions";

export default async function BillingPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  // Only owners can manage billing
  if (membership.role !== "OWNER") {
    redirect("/app/settings");
  }

  const [subscriptionInfo, planLimits] = await Promise.all([
    getSubscriptionInfo(membership.companyId),
    checkPlanLimits(membership.companyId),
  ]);

  const company = await db.company.findUnique({
    where: { id: membership.companyId },
    include: { subscription: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Settings</p>
        <h2 className="font-display text-3xl text-ink">Billing & Subscription</h2>
        <p className="text-sm text-ink/70">Manage your subscription and billing details.</p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription status and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscriptionInfo ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">
                      {PLANS[subscriptionInfo.plan]?.name || subscriptionInfo.plan}
                    </h3>
                    {subscriptionInfo.isTester && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                        Tester Account
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {subscriptionInfo.isTrialing && subscriptionInfo.trialDaysRemaining !== null && (
                      <span className="text-amber-600">
                        Trial ends in {subscriptionInfo.trialDaysRemaining} days
                      </span>
                    )}
                    {subscriptionInfo.isActive && (
                      <span className="text-green-600">Active subscription</span>
                    )}
                    {subscriptionInfo.status === "PAST_DUE" && (
                      <span className="text-red-600">Payment past due</span>
                    )}
                    {subscriptionInfo.status === "CANCELED" && (
                      <span className="text-gray-600">Subscription canceled</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    ${(PLANS[subscriptionInfo.plan]?.price || 0) / 100}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">
                    {planLimits.currentUsers}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{planLimits.maxUsers || "∞"}
                    </span>
                  </p>
                  {planLimits.usersExceeded && (
                    <p className="text-xs text-red-600 mt-1">Limit exceeded</p>
                  )}
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Units</p>
                  <p className="text-2xl font-bold">
                    {planLimits.currentUnits}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{planLimits.maxUnits || "∞"}
                    </span>
                  </p>
                  {planLimits.unitsExceeded && (
                    <p className="text-xs text-red-600 mt-1">Limit exceeded</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <BillingActions 
                hasStripeCustomer={!!company?.subscription?.stripeCustomerId}
                isTrialing={subscriptionInfo.isTrialing}
                isTester={subscriptionInfo.isTester}
                currentPlan={subscriptionInfo.plan}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No subscription found</p>
              <BillingActions 
                hasStripeCustomer={false}
                isTrialing={false}
                isTester={false}
                currentPlan={null}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrentPlan = subscriptionInfo?.plan === key;
              const Icon = key === "STARTER" ? Zap : key === "PROFESSIONAL" ? Building2 : Crown;
              
              return (
                <div
                  key={key}
                  className={`relative p-6 rounded-xl border-2 flex flex-col ${
                    isCurrentPlan 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  {isCurrentPlan && (
                    <span className="absolute -top-3 left-4 px-2 py-1 text-xs bg-primary text-white rounded-full">
                      Current Plan
                    </span>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">{plan.name}</h3>
                  </div>
                  
                  <p className="text-3xl font-bold mb-2">
                    ${plan.price / 100}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && !subscriptionInfo?.isTester && (
                    <BillingActions
                      hasStripeCustomer={!!company?.subscription?.stripeCustomerId}
                      isTrialing={subscriptionInfo?.isTrialing || false}
                      isTester={false}
                      currentPlan={subscriptionInfo?.plan || null}
                      targetPlan={key as "STARTER" | "PROFESSIONAL" | "BUSINESS"}
                      compact
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
