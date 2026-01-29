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

export default async function EmergencyCallsPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const archiveFilter = getArchiveWhereClause(params.filter);
  const searchFilter = getSearchFilter(params.q, ["emergencyCode", "ticketNumber", "issueDescription", "notes"]);

  const calls = await db.emergencyCall.findMany({
    where: {
      companyId: membership.companyId,
      ...archiveFilter,
      ...searchFilter
    },
    include: {
      managementCompany: true,
      building: true,
      unit: true,
      mechanic: true,
      emergencyCallStatus: true
    },
    orderBy: { createdAt: "desc" }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Emergency calls
          </p>
          <h2 className="font-display text-3xl text-ink">Emergency events</h2>
          <p className="text-sm text-ink/70">Track urgent service calls.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <SearchInput placeholder="Search emergency calls..." />
          </Suspense>
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/app/emergency-calls/new">Add emergency call</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {calls.length === 0 ? (
          <EmptyState type="emergency-calls" searchTerm={params.q} showAction={canEdit} />
        ) : (
          calls.map((call) => (
            <Link
              key={call.id}
              href={`/app/emergency-calls/${call.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {call.emergencyCode}
                    {call.archivedAt && (
                      <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                        Archived
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/60">
                    {call.managementCompany.name} - {call.building.name} -{" "}
                    {call.unit.identifier}
                  </p>
                  <p className="text-xs text-ink/60">
                    {call.emergencyCallStatus.name}{" "}
                    {call.mechanic
                      ? `- ${call.mechanic.firstName} ${call.mechanic.lastName}`
                      : "- Unassigned"}
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
