import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { db } from "@/lib/db";

import ResetPasswordForm from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/forgot-password");
  }

  // Verify token exists and is not expired
  const resetToken = await db.passwordResetToken.findUnique({
    where: { token }
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return (
      <div className="space-y-8">
        <div>
          <Link 
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors" 
            href="/forgot-password"
          >
            <ArrowLeft className="h-4 w-4" />
            Try again
          </Link>
        </div>
        
        <div className="rounded-2xl border border-danger-200 bg-danger-50 p-6">
          <h2 className="font-semibold text-danger-900">Link expired</h2>
          <p className="mt-1 text-sm text-danger-700">
            This password reset link has expired or is invalid. Please request a new one.
          </p>
        </div>
      </div>
    );
  }

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
        <h1 className="font-display text-3xl font-bold text-slate-900">Create new password</h1>
        <p className="text-slate-600">
          Enter your new password below.
        </p>
      </div>
      
      <ResetPasswordForm token={token} />
    </div>
  );
}
