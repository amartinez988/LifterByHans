"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  plan: "STARTER" | "PROFESSIONAL" | "BUSINESS";
  isPopular?: boolean;
};

export function SubscribeActions({ plan, isPopular }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
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
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className={`w-full ${isPopular ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
      variant={isPopular ? "default" : "outline"}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting...
        </>
      ) : (
        `Get ${plan.charAt(0) + plan.slice(1).toLowerCase()}`
      )}
    </Button>
  );
}
