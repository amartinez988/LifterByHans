"use client";

import Link from "next/link";
import { AlertTriangle, Clock, CreditCard } from "lucide-react";

type Props = {
  status?: string;
  daysRemaining?: number;
  reason?: string;
};

export function SubscriptionBanner({ status, daysRemaining, reason }: Props) {
  // No banner needed for active subscriptions or testers
  if (status === "ACTIVE" || !status) {
    return null;
  }

  // Trial ending soon (7 days or less)
  if (status === "TRIALING" && daysRemaining !== undefined && daysRemaining <= 7) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800 font-medium">
              Your trial ends in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
            </span>
          </div>
          <Link
            href="/app/settings/billing"
            className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
          >
            Upgrade now →
          </Link>
        </div>
      </div>
    );
  }

  // Past due payment
  if (status === "PAST_DUE" || reason === "past_due") {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">
              Payment failed. Please update your payment method to avoid service interruption.
            </span>
          </div>
          <Link
            href="/app/settings/billing"
            className="text-sm font-medium bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700"
          >
            <CreditCard className="h-4 w-4 inline mr-1" />
            Update Payment
          </Link>
        </div>
      </div>
    );
  }

  // Trialing with more than 7 days - show subtle reminder
  if (status === "TRIALING" && daysRemaining !== undefined && daysRemaining > 7) {
    return (
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <span className="text-indigo-700 text-sm">
            🎉 Trial: {daysRemaining} days remaining
          </span>
          <Link
            href="/app/settings/billing"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            View plans
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
