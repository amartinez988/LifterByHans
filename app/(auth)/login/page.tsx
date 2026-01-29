import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import LoginForm from "./login-form";

export default function LoginPage({
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
        <h1 className="font-display text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-600">
          Log in to continue managing your LIFTER workspace.
        </p>
      </div>
      
      <LoginForm callbackUrl={searchParams?.callbackUrl} />
      
      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link 
          href={searchParams?.callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}` : "/signup"}
          className="font-medium text-brand-600 hover:text-brand-500 transition-colors"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
