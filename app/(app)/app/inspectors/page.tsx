import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { getSearchFilter } from "@/lib/search";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function InspectorsPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const searchFilter = getSearchFilter(params.q, ["firstName", "lastName", "companyName", "email", "phone"]);

  const inspectors = await db.inspector.findMany({
    where: {
      companyId: membership.companyId,
      ...searchFilter
    },
    orderBy: { createdAt: "desc" }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Inspectors</p>
          <h2 className="font-display text-3xl text-ink">External inspectors</h2>
          <p className="text-sm text-ink/70">Track inspectors and their contact info.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <SearchInput placeholder="Search inspectors..." />
          </Suspense>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/app/inspectors/new">Add inspector</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {inspectors.length === 0 ? (
          <Card className="text-sm text-ink/70">
            {params.q ? `No inspectors matching "${params.q}"` : "No inspectors yet."}
          </Card>
        ) : (
          inspectors.map((inspector) => (
            <Link
              key={inspector.id}
              href={`/app/inspectors/${inspector.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {inspector.firstName} {inspector.lastName}
                  </p>
                  <p className="text-xs text-ink/60">
                    {inspector.companyName || "No company"} -{" "}
                    {inspector.email || "No email"}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
                  {inspector.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
