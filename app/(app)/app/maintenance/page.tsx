import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { ArchiveFilter } from "@/components/ui/archive-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { getArchiveWhereClause } from "@/lib/archive";
import { getSearchFilter } from "@/lib/search";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ filter?: string; q?: string }>;
};

export default async function MaintenancePage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const archiveFilter = getArchiveWhereClause(params.filter);
  const searchFilter = getSearchFilter(params.q, ["maintenanceCode", "notes"]);

  const maintenances = await db.maintenance.findMany({
    where: {
      companyId: membership.companyId,
      ...archiveFilter,
      ...searchFilter
    },
    include: {
      managementCompany: true,
      building: true,
      unit: true,
      mechanic: true
    },
    orderBy: { createdAt: "desc" }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Maintenance</p>
          <h2 className="font-display text-3xl text-ink">Service events</h2>
          <p className="text-sm text-ink/70">Track maintenance work across units.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <SearchInput placeholder="Search maintenance..." />
          </Suspense>
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/app/maintenance/new">Add maintenance</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {maintenances.length === 0 ? (
          <EmptyState type="maintenance" searchTerm={params.q} showAction={canEdit} />
        ) : (
          maintenances.map((record) => (
            <Link
              key={record.id}
              href={`/app/maintenance/${record.id}`}
              className="block rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {record.maintenanceCode}
                    {record.archivedAt && (
                      <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                        Archived
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/60">
                    {record.managementCompany.name} - {record.building.name} -{" "}
                    {record.unit.identifier}
                  </p>
                  <p className="text-xs text-ink/60">
                    {record.mechanic
                      ? `${record.mechanic.firstName} ${record.mechanic.lastName}`
                      : "Unassigned"}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
                  {record.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
