import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ArchiveFilter } from "@/components/ui/archive-filter";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { getActiveWhereClause } from "@/lib/archive";
import { getSearchFilter } from "@/lib/search";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ filter?: string; q?: string }>;
};

export default async function MechanicsPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const activeFilter = getActiveWhereClause(params.filter);
  const searchFilter = getSearchFilter(params.q, ["firstName", "lastName", "email", "phone"]);

  const mechanics = await db.mechanic.findMany({
    where: {
      companyId: membership.companyId,
      ...activeFilter,
      ...searchFilter
    },
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
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <SearchInput placeholder="Search mechanics..." />
          </Suspense>
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/app/mechanics/new">Add mechanic</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {mechanics.length === 0 ? (
          <EmptyState type="mechanics" searchTerm={params.q} showAction={canEdit} />
        ) : (
          mechanics.map((mechanic) => (
            <Link
              key={mechanic.id}
              href={`/app/mechanics/${mechanic.id}`}
              className="block rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
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
