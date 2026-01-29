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
  searchParams: Promise<{ filter?: string; status?: string; mechanic?: string; q?: string }>;
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  EN_ROUTE: "bg-yellow-100 text-yellow-800",
  ON_SITE: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-500"
};

const priorityColors: Record<string, string> = {
  LOW: "text-ink/40",
  NORMAL: "text-ink/60",
  HIGH: "text-orange-600",
  URGENT: "text-red-600 font-semibold"
};

export default async function JobsPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const archiveFilter = getArchiveWhereClause(params.filter);
  const searchFilter = getSearchFilter(params.q, ["jobCode", "title", "description", "notes"]);

  const whereClause: Record<string, unknown> = {
    companyId: membership.companyId,
    ...archiveFilter,
    ...searchFilter
  };

  if (params.status) {
    whereClause.status = params.status;
  }

  if (params.mechanic) {
    whereClause.mechanicId = params.mechanic;
  }

  const [jobs, mechanics] = await Promise.all([
    db.scheduledJob.findMany({
      where: whereClause,
      include: {
        managementCompany: true,
        building: true,
        unit: true,
        mechanic: true
      },
      orderBy: [{ scheduledDate: "asc" }, { scheduledStartTime: "asc" }]
    }),
    db.mechanic.findMany({
      where: { companyId: membership.companyId, isActive: true },
      orderBy: { firstName: "asc" }
    })
  ]);

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Jobs</p>
          <h2 className="font-display text-3xl text-ink">Scheduled work</h2>
          <p className="text-sm text-ink/70">Plan and track service assignments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <SearchInput placeholder="Search jobs..." />
          </Suspense>
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/app/jobs/new">Add job</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/jobs"
          className={`rounded-full px-3 py-1 text-xs transition ${
            !params.status ? "bg-ink text-white" : "bg-ink/10 text-ink hover:bg-ink/20"
          }`}
        >
          All
        </Link>
        {["SCHEDULED", "EN_ROUTE", "ON_SITE", "COMPLETED", "CANCELLED"].map((status) => (
          <Link
            key={status}
            href={`/app/jobs?status=${status}${params.mechanic ? `&mechanic=${params.mechanic}` : ""}${params.q ? `&q=${params.q}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs transition ${
              params.status === status ? "bg-ink text-white" : "bg-ink/10 text-ink hover:bg-ink/20"
            }`}
          >
            {status.replace("_", " ")}
          </Link>
        ))}
      </div>

      {/* Mechanic filter */}
      {mechanics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-ink/60 self-center">Mechanic:</span>
          <Link
            href={`/app/jobs${params.status ? `?status=${params.status}` : ""}${params.q ? `${params.status ? "&" : "?"}q=${params.q}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs transition ${
              !params.mechanic ? "bg-ink/20 text-ink" : "bg-ink/5 text-ink/60 hover:bg-ink/10"
            }`}
          >
            All
          </Link>
          {mechanics.map((m) => (
            <Link
              key={m.id}
              href={`/app/jobs?mechanic=${m.id}${params.status ? `&status=${params.status}` : ""}${params.q ? `&q=${params.q}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs transition ${
                params.mechanic === m.id ? "bg-ink/20 text-ink" : "bg-ink/5 text-ink/60 hover:bg-ink/10"
              }`}
            >
              {m.firstName} {m.lastName}
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card className="text-sm text-ink/70">
            {params.q ? `No jobs matching "${params.q}"` : "No jobs found."}
          </Card>
        ) : (
          jobs.map((job) => (
            <Link
              key={job.id}
              href={`/app/jobs/${job.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{job.jobCode}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[job.status]}`}>
                      {job.status.replace("_", " ")}
                    </span>
                    {job.archivedAt && (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/60">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink">{job.title}</p>
                  <p className="text-xs text-ink/60">
                    {job.managementCompany.name} - {job.building.name}
                    {job.unit && ` - ${job.unit.identifier}`}
                  </p>
                  <p className="text-xs text-ink/60">
                    {job.mechanic
                      ? `${job.mechanic.firstName} ${job.mechanic.lastName}`
                      : "Unassigned"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink/60">
                    {new Date(job.scheduledDate).toLocaleDateString()}
                  </p>
                  {job.scheduledStartTime && (
                    <p className="text-xs text-ink/40">{job.scheduledStartTime}</p>
                  )}
                  <p className={`text-xs ${priorityColors[job.priority]}`}>
                    {job.priority}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
