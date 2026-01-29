import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArchiveFilter } from "@/components/ui/archive-filter";
import { SearchInput } from "@/components/ui/search-input";
import { getArchiveWhereClause } from "@/lib/archive";
import { getSearchFilter } from "@/lib/search";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ filter?: string; q?: string }>;
};

export default async function InspectionsPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const archiveFilter = getArchiveWhereClause(params.filter);
  const searchFilter = getSearchFilter(params.q, ["inspectionCode", "notes"]);

  const inspections = await db.inspection.findMany({
    where: {
      companyId: membership.companyId,
      ...archiveFilter,
      ...searchFilter
    },
    include: {
      managementCompany: true,
      building: true,
      unit: true,
      inspectionStatus: true,
      inspectionResult: true
    },
    orderBy: { createdAt: "desc" }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Inspections</p>
          <h2 className="font-display text-3xl text-ink">Inspection records</h2>
          <p className="text-sm text-ink/70">Track regulatory inspections by unit.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <SearchInput placeholder="Search inspections..." />
          </Suspense>
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/app/inspections/new">Add inspection</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {inspections.length === 0 ? (
          <Card className="text-sm text-ink/70">
            {params.q ? `No inspections matching "${params.q}"` : "No inspections found."}
          </Card>
        ) : (
          inspections.map((inspection) => (
            <Link
              key={inspection.id}
              href={`/app/inspections/${inspection.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {inspection.inspectionCode}
                    {inspection.archivedAt && (
                      <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                        Archived
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/60">
                    {inspection.managementCompany.name} - {inspection.building.name} -{" "}
                    {inspection.unit.identifier}
                  </p>
                  <p className="text-xs text-ink/60">
                    {inspection.inspectionStatus.name}
                    {inspection.inspectionResult
                      ? ` - ${inspection.inspectionResult.name}`
                      : ""}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-ink/40">View</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
