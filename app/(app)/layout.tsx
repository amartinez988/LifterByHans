import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { db } from "@/lib/db";

import { signOutAction } from "./actions";

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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-ink/10 bg-white/80 backdrop-blur-sm">
        <div className="flex h-full flex-col">
          {/* Logo/Company Header */}
          <div className="border-b border-ink/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
              Workspace
            </p>
            <h1 className="font-display text-lg text-ink truncate">
              {company?.name ?? "Setup in progress"}
            </h1>
            <p className="text-xs text-ink/60 truncate">
              {membership?.role ?? "Prospect"} • {session.user.name}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2">
            <SidebarNav />
          </div>

          {/* Footer with Onboarding & Logout */}
          <div className="border-t border-ink/10 p-3 space-y-2">
            {!company && (
              <Link
                href="/onboarding"
                className="flex w-full items-center justify-center rounded-lg bg-ember/10 px-3 py-2 text-sm font-medium text-ember hover:bg-ember/20 transition-colors"
              >
                Complete Setup
              </Link>
            )}
            <form action={signOutAction} className="w-full">
              <Button type="submit" variant="outline" size="sm" className="w-full">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
