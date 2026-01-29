import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (session?.user) {
    const membership = await db.companyMember.findFirst({
      where: { userId: session.user.id }
    });
    if (membership) {
      redirect("/app");
    }
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-brand-600 to-brand-800 p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">LIFTER</span>
        </div>
        
        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-2xl font-medium text-white/90">
              &ldquo;LIFTER transformed how we manage our service operations. 
              We&apos;ve cut compliance issues by 90% and our team loves it.&rdquo;
            </p>
            <footer className="text-white/70">
              <cite className="font-semibold not-italic">Michael Torres</cite>
              <span className="mx-2">—</span>
              <span>Operations Director, Metro Elevator Co.</span>
            </footer>
          </blockquote>
        </div>
        
        <p className="text-sm text-white/50">
          © {new Date().getFullYear()} LIFTER. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Auth form */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">LIFTER</span>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
