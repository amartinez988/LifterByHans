import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { QuickActions } from "@/components/ui/quick-actions";
import { db } from "@/lib/db";
import { getInspectionComplianceStatus } from "@/lib/derived";

export default async function AppHomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const membership = await db.companyMember.findFirst({
    where: { userId: session.user.id },
    include: { company: true }
  });

  if (!membership) {
    redirect("/onboarding");
  }

  const [units, openMaintenance, openEmergency] = await Promise.all([
    db.unit.findMany({
      where: { companyId: membership.companyId, isActive: true },
      include: {
        inspections: { orderBy: { inspectionDate: "desc" }, take: 1 }
      }
    }),
    db.maintenance.count({
      where: { companyId: membership.companyId, status: "OPEN" }
    }),
    db.emergencyCall.count({
      where: { companyId: membership.companyId, completedAt: null }
    })
  ]);

  let expiringSoon = 0;
  let overdue = 0;
  let missing = 0;

  for (const unit of units) {
    const latest = unit.inspections[0];
    const status = getInspectionComplianceStatus(
      latest?.expirationDate,
      Boolean(latest)
    );
    if (status === "EXPIRING_SOON") expiringSoon += 1;
    if (status === "OVERDUE") overdue += 1;
    if (status === "MISSING") missing += 1;
  }

  const unitsAtRisk = overdue + missing;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Dashboard</p>
        <h2 className="font-display text-3xl text-ink">{membership.company.name}</h2>
        <p className="text-sm text-ink/70">Operational intelligence and compliance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/app/compliance"
          className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft transition hover:border-ink/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Inspection overview
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-lg font-semibold text-ink">{expiringSoon} expiring soon</p>
            <p className="text-sm text-ember">{overdue} overdue</p>
          </div>
        </Link>
        <Link
          href="/app/emergency-calls"
          className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft transition hover:border-ink/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Emergency calls</p>
          <p className="mt-3 text-lg font-semibold text-ink">{openEmergency} open</p>
          <p className="text-sm text-ink/60">Requires attention.</p>
        </Link>
        <Link
          href="/app/maintenance"
          className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft transition hover:border-ink/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Maintenance</p>
          <p className="mt-3 text-lg font-semibold text-ink">{openMaintenance} open</p>
          <p className="text-sm text-ink/60">Active maintenance events.</p>
        </Link>
        <Link
          href="/app/alerts"
          className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft transition hover:border-ink/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Units at risk</p>
          <p className="mt-3 text-lg font-semibold text-ember">{unitsAtRisk}</p>
          <p className="text-sm text-ink/60">Overdue or missing inspections.</p>
        </Link>
      </div>

      <QuickActions />
    </div>
  );
}
