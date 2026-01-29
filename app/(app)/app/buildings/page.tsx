import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import { ArchiveFilter } from "@/components/ui/archive-filter";
import { getArchiveWhereClause } from "@/lib/archive";
import { db } from "@/lib/db";
import { getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function BuildingsPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const archiveFilter = getArchiveWhereClause(params.filter);

  const buildings = await db.building.findMany({
    where: {
      companyId: membership.companyId,
      ...archiveFilter
    },
    include: {
      managementCompany: true,
      _count: {
        select: { units: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Buildings
          </p>
          <h2 className="font-display text-3xl text-ink">All buildings</h2>
          <p className="text-sm text-ink/70">
            View all buildings across your management companies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-4">
        {buildings.length === 0 ? (
          <Card className="text-sm text-ink/70">
            No buildings found. Add buildings through management companies.
          </Card>
        ) : (
          buildings.map((building) => (
            <Link
              key={building.id}
              href={`/app/buildings/${building.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {building.name}
                    {building.archivedAt && (
                      <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                        Archived
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/60">
                    {building.address}
                  </p>
                  <p className="text-xs text-ink/40 mt-1">
                    {building.managementCompany.name} • {building._count.units} unit{building._count.units !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
                  View
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
