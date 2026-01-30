import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link 
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors" 
          href="/login"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
      
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-slate-900">Reset your password</h1>
        <p className="text-slate-600">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>
      
      <ForgotPasswordForm />
    </div>
  );
}
