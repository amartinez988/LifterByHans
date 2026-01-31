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
      <div className="bg-warning-50 border-b border-warning-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning-600" />
            <span className="text-warning-800 font-medium">
              Your trial ends in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
            </span>
          </div>
          <Link
            href="/app/settings/billing"
            className="text-sm font-medium text-warning-700 hover:text-warning-900 underline"
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
      <div className="bg-danger-50 border-b border-danger-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger-600" />
            <span className="text-danger-800 font-medium">
              Payment failed. Please update your payment method to avoid service interruption.
            </span>
          </div>
          <Link
            href="/app/settings/billing"
            className="text-sm font-medium bg-danger-600 text-white px-4 py-1.5 rounded-lg hover:bg-danger-700"
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
      <div className="bg-brand-50 border-b border-brand-100 px-4 py-2">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <span className="text-brand-700 text-sm">
            🎉 Trial: {daysRemaining} days remaining
          </span>
          <Link
            href="/app/settings/billing"
            className="text-xs font-medium text-brand-600 hover:text-brand-800"
          >
            View plans
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
