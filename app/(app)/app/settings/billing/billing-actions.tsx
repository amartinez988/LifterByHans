"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

type BillingActionsProps = {
  hasStripeCustomer: boolean;
  isTrialing: boolean;
  isTester: boolean;
  currentPlan: "STARTER" | "PROFESSIONAL" | "BUSINESS" | null;
  targetPlan?: "STARTER" | "PROFESSIONAL" | "BUSINESS";
  compact?: boolean;
};

export function BillingActions({
  hasStripeCustomer,
  isTrialing,
  isTester,
  currentPlan,
  targetPlan,
  compact = false,
}: BillingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: "STARTER" | "PROFESSIONAL" | "BUSINESS") => {
    setLoading(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to open billing portal");
    } finally {
      setLoading(null);
    }
  };

  // Compact mode for plan cards
  if (compact && targetPlan) {
    const isUpgrade = 
      (currentPlan === "STARTER" && (targetPlan === "PROFESSIONAL" || targetPlan === "BUSINESS")) ||
      (currentPlan === "PROFESSIONAL" && targetPlan === "BUSINESS");
    
    const isDowngrade = 
      (currentPlan === "BUSINESS" && (targetPlan === "PROFESSIONAL" || targetPlan === "STARTER")) ||
      (currentPlan === "PROFESSIONAL" && targetPlan === "STARTER");

    return (
      <Button
        className="w-full"
        variant={isUpgrade ? "default" : "outline"}
        onClick={() => handleCheckout(targetPlan)}
        disabled={loading !== null}
      >
        {loading === targetPlan ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Select Plan"}
      </Button>
    );
  }

  // Tester account - no billing actions needed
  if (isTester) {
    return (
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-purple-800 text-sm">
          🎉 You have a tester account with full access. No payment required.
        </p>
      </div>
    );
  }

  // Has active Stripe customer - show portal button
  if (hasStripeCustomer) {
    return (
      <div className="flex gap-3">
        <Button onClick={handlePortal} disabled={loading !== null}>
          {loading === "portal" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          Manage Subscription
        </Button>
        <Button variant="outline" onClick={handlePortal} disabled={loading !== null}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Update Payment Method
        </Button>
      </div>
    );
  }

  // Trialing - show upgrade buttons
  if (isTrialing) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-amber-600">
          Your trial will end soon. Choose a plan to continue using Uplio.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => handleCheckout("STARTER")} disabled={loading !== null}>
            {loading === "STARTER" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Start with Starter ($49/mo)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleCheckout("PROFESSIONAL")} 
            disabled={loading !== null}
          >
            {loading === "PROFESSIONAL" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Go Professional ($149/mo)
          </Button>
        </div>
      </div>
    );
  }

  // No subscription at all
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Start your subscription to access all features.
      </p>
      <Button onClick={() => handleCheckout("STARTER")} disabled={loading !== null}>
        {loading === "STARTER" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Subscribe Now
      </Button>
    </div>
  );
}
