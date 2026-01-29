import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import SignupForm from "./signup-form";

const benefits = [
  "Track all units in one place",
  "Never miss an inspection deadline",
  "Manage your team efficiently",
  "Access from anywhere"
];

export default function SignupPage({
  searchParams
}: {
  searchParams?: { callbackUrl?: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <Link 
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors" 
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="text-slate-600">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
        <p className="text-sm font-medium text-brand-900 mb-2">What&apos;s included:</p>
        <ul className="space-y-1.5">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-brand-700">
              <CheckCircle2 className="h-4 w-4 text-brand-500" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
      
      <SignupForm callbackUrl={searchParams?.callbackUrl} />
      
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link 
          href={searchParams?.callbackUrl ? `/login?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}` : "/login"}
          className="font-medium text-brand-600 hover:text-brand-500 transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
