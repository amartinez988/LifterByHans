import { redirect } from "next/navigation";
import { Check, Zap, Building2, Crown } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentMembership } from "@/lib/team";
import { PLANS } from "@/lib/stripe";
import { checkSubscriptionAccess } from "@/lib/check-subscription";

import { SubscribeActions } from "./subscribe-actions";

export default async function SubscribePage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const accessCheck = await checkSubscriptionAccess(membership.companyId);

  // If they have access, redirect to app
  if (accessCheck.hasAccess) {
    redirect("/app");
  }

  const reason = accessCheck.reason;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {reason === "trial_expired" && "Your Trial Has Ended"}
            {reason === "canceled" && "Your Subscription Was Canceled"}
            {reason === "no_subscription" && "Choose Your Plan"}
            {!reason && "Subscribe to Continue"}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {reason === "trial_expired" && 
              "We hope you enjoyed exploring Uplio! Choose a plan below to continue using all features."}
            {reason === "canceled" && 
              "We'd love to have you back! Resubscribe to regain access to your data and features."}
            {reason === "no_subscription" && 
              "Select the plan that best fits your elevator service business."}
            {!reason && 
              "Subscribe to access your Uplio workspace."}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {Object.entries(PLANS).map(([key, plan]) => {
            const Icon = key === "STARTER" ? Zap : key === "PROFESSIONAL" ? Building2 : Crown;
            const isPopular = key === "PROFESSIONAL";
            
            return (
              <Card 
                key={key} 
                className={`relative ${isPopular ? "border-2 border-brand-500 shadow-lg" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-100 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price / 100}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-success-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <SubscribeActions 
                    plan={key as "STARTER" | "PROFESSIONAL" | "BUSINESS"}
                    isPopular={isPopular}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ/Trust section */}
        <div className="text-center text-slate-500 text-sm">
          <p className="mb-2">✓ Cancel anytime &nbsp; ✓ 14-day money back guarantee &nbsp; ✓ Secure payment via Stripe</p>
          <p>
            Questions? Contact us at{" "}
            <a href="mailto:support@uplio.app" className="text-indigo-600 hover:underline">
              support@uplio.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
