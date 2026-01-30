import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { db } from "@/lib/db";
import { checkSubscriptionAccess } from "@/lib/check-subscription";

import { signOutAction } from "./actions";
import { SubscriptionBanner } from "./subscription-banner";

// Paths that don't require subscription check
const EXEMPT_PATHS = ["/subscribe", "/onboarding", "/app/settings/billing"];

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const membership = await db.companyMember.findFirst({
    where: { userId: session.user.id },
    include: { company: true }
  });
  const company = membership?.company ?? null;

  // Check subscription access
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isExemptPath = EXEMPT_PATHS.some(p => pathname.startsWith(p));

  let subscriptionCheck = null;
  if (company && !isExemptPath) {
    subscriptionCheck = await checkSubscriptionAccess(company.id);
    
    // Redirect to subscribe page if no access
    if (!subscriptionCheck.hasAccess) {
      redirect("/subscribe");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Logo/Company Header */}
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/icon.svg" alt="Uplio" width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-slate-900 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">UPLIO</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Workspace
              </p>
              <h1 className="font-semibold text-slate-900 truncate mt-0.5">
                {company?.name ?? "Setup in progress"}
              </h1>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {membership?.role ?? "Prospect"} • {session.user.name}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <SidebarNav />
          </div>

          {/* Footer with Onboarding & Logout */}
          <div className="border-t border-slate-100 p-3 space-y-2">
            {!company && (
              <Link
                href="/onboarding"
                className="flex w-full items-center justify-center rounded-xl bg-brand-50 border border-brand-200 px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Complete Setup
              </Link>
            )}
            <form action={signOutAction} className="w-full">
              <Button type="submit" variant="ghost" size="sm" className="w-full text-slate-600">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Subscription Warning Banners */}
        {subscriptionCheck && (
          <SubscriptionBanner 
            status={subscriptionCheck.subscription?.status}
            daysRemaining={subscriptionCheck.daysRemaining}
            reason={subscriptionCheck.reason}
          />
        )}
        
        <div className="p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
