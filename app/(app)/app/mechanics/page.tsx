import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

export default async function MechanicsPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const mechanics = await db.mechanic.findMany({
    where: { companyId: membership.companyId },
    include: { mechanicLevel: true },
    orderBy: { createdAt: "desc" }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Mechanics</p>
          <h2 className="font-display text-3xl text-ink">Field technicians</h2>
          <p className="text-sm text-ink/70">Manage active service mechanics.</p>
        </div>
        {canEdit ? (
          <Button asChild size="sm">
            <Link href="/app/mechanics/new">Add mechanic</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4">
        {mechanics.length === 0 ? (
          <Card className="text-sm text-ink/70">No mechanics yet.</Card>
        ) : (
          mechanics.map((mechanic) => (
            <Link
              key={mechanic.id}
              href={`/app/mechanics/${mechanic.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {mechanic.firstName} {mechanic.lastName}
                  </p>
                  <p className="text-xs text-ink/60">
                    {mechanic.email || "No email"} - {mechanic.phone || "No phone"}
                  </p>
                  <p className="text-xs text-ink/60">
                    {mechanic.mechanicLevel?.name || "Level unset"}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
                  {mechanic.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
