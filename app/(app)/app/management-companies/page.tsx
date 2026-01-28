import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArchiveFilter } from "@/components/ui/archive-filter";
import { getArchiveWhereClause } from "@/lib/archive";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function ManagementCompaniesPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const archiveFilter = getArchiveWhereClause(params.filter);

  const companies = await db.managementCompany.findMany({
    where: {
      companyId: membership.companyId,
      ...archiveFilter
    },
    orderBy: { createdAt: "desc" }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Management companies
          </p>
          <h2 className="font-display text-3xl text-ink">Property partners</h2>
          <p className="text-sm text-ink/70">
            Track the management firms tied to your serviced assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/app/management-companies/new">Add management company</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {companies.length === 0 ? (
          <Card className="text-sm text-ink/70">
            No management companies found.
          </Card>
        ) : (
          companies.map((company) => (
            <Link
              key={company.id}
              href={`/app/management-companies/${company.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {company.name}
                    {company.archivedAt && (
                      <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                        Archived
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/60">
                    {company.accountNumber ? `Account ${company.accountNumber}` : "No account"}
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
