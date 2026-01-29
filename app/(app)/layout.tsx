import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white/80 px-6 py-4 shadow-soft">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Workspace
          </p>
          <h1 className="font-display text-2xl text-ink">
            {company?.name ?? "Setup in progress"}
          </h1>
          <p className="text-sm text-ink/60">
            {membership?.role ?? "Prospect"} - {session.user.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app">
            App
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/compliance">
            Compliance
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/alerts">
            Alerts
          </Link>
          <Link
            className="text-sm text-ink/70 hover:text-ink"
            href="/app/management-companies"
          >
            Companies
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/contacts">
            Contacts
          </Link>
          <Link
            className="text-sm text-ink/70 hover:text-ink"
            href="/app/contact-categories"
          >
            Categories
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/mechanics">
            Mechanics
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/maintenance">
            Maintenance
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/jobs">
            Jobs
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/inspectors">
            Inspectors
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/inspections">
            Inspections
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/emergency-calls">
            Emergency
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/app/team">
            Team
          </Link>
          <Link className="text-sm text-ink/70 hover:text-ink" href="/onboarding">
            Onboarding
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}
