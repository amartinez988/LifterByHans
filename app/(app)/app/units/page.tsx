import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ArchiveFilter } from "@/components/ui/archive-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { getArchiveWhereClause } from "@/lib/archive";
import { getSearchFilter } from "@/lib/search";
import { db } from "@/lib/db";
import { getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ filter?: string; q?: string }>;
};

export default async function UnitsPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const archiveFilter = getArchiveWhereClause(params.filter);
  const searchFilter = getSearchFilter(params.q, ["identifier", "description", "serialNumber", "notes"]);

  const units = await db.unit.findMany({
    where: {
      companyId: membership.companyId,
      ...archiveFilter,
      ...searchFilter
    },
    include: {
      building: {
        include: {
          managementCompany: true
        }
      },
      unitCategory: true,
      unitStatus: true,
      brand: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Units
          </p>
          <h2 className="font-display text-3xl text-ink">All units</h2>
          <p className="text-sm text-ink/70">
            View all elevator and escalator units across your buildings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <SearchInput placeholder="Search units..." />
          </Suspense>
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-4">
        {units.length === 0 ? (
          <EmptyState
            type="units"
            searchTerm={params.q}
            showAction={false}
            customDescription="Add units through building detail pages."
          />
        ) : (
          units.map((unit) => (
            <Link
              key={unit.id}
              href={`/app/units/${unit.id}`}
              className="block rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {unit.identifier}
                    {unit.archivedAt && (
                      <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                        Archived
                      </span>
                    )}
                    {!unit.isActive && !unit.archivedAt && (
                      <span className="ml-2 rounded-full bg-warning-100 px-2 py-0.5 text-xs font-normal text-warning-700">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/60">
                    {unit.building.name} • {unit.building.address}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {unit.unitCategory && (
                      <span className="rounded-full bg-pine/10 px-2 py-0.5 text-xs text-pine">
                        {unit.unitCategory.name}
                      </span>
                    )}
                    {unit.unitStatus && (
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/60">
                        {unit.unitStatus.name}
                      </span>
                    )}
                    {unit.brand && (
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/60">
                        {unit.brand.name}
                      </span>
                    )}
                    {unit.underContract && (
                      <span className="rounded-full bg-ember/10 px-2 py-0.5 text-xs text-ember">
                        Under Contract
                      </span>
                    )}
                  </div>
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
