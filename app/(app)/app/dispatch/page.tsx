import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import { QuickAssign } from "./quick-assign";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-brand-100 text-brand-800 border-brand-200",
  EN_ROUTE: "bg-warning-100 text-warning-800 border-warning-200",
  ON_SITE: "bg-accent-100 text-accent-800 border-accent-200",
  COMPLETED: "bg-success-100 text-success-800 border-success-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200"
};

export default async function DispatchPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todaysJobs, unassignedJobs, mechanics, upcomingJobs] = await Promise.all([
    // Today's jobs
    db.scheduledJob.findMany({
      where: {
        companyId: membership.companyId,
        archivedAt: null,
        scheduledDate: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        building: true,
        unit: true,
        mechanic: true
      },
      orderBy: [{ status: "asc" }, { scheduledStartTime: "asc" }]
    }),
    // Unassigned jobs (any date)
    db.scheduledJob.findMany({
      where: {
        companyId: membership.companyId,
        archivedAt: null,
        mechanicId: null,
        status: { not: "CANCELLED" }
      },
      include: {
        building: true,
        unit: true
      },
      orderBy: { scheduledDate: "asc" },
      take: 10
    }),
    // Active mechanics
    db.mechanic.findMany({
      where: { companyId: membership.companyId, isActive: true },
      orderBy: { firstName: "asc" }
    }),
    // Upcoming jobs (next 7 days, excluding today)
    db.scheduledJob.findMany({
      where: {
        companyId: membership.companyId,
        archivedAt: null,
        scheduledDate: {
          gte: tomorrow,
          lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        status: { not: "CANCELLED" }
      },
      include: {
        building: true,
        mechanic: true
      },
      orderBy: { scheduledDate: "asc" },
      take: 10
    })
  ]);

  // Group today's jobs by status
  const jobsByStatus: Record<string, typeof todaysJobs> = {
    SCHEDULED: [],
    EN_ROUTE: [],
    ON_SITE: [],
    COMPLETED: [],
    CANCELLED: []
  };
  for (const job of todaysJobs) {
    jobsByStatus[job.status].push(job);
  }

  // Calculate mechanic workload for today
  const mechanicWorkload: Record<string, number> = {};
  for (const m of mechanics) {
    mechanicWorkload[m.id] = todaysJobs.filter(j => j.mechanicId === m.id && j.status !== "CANCELLED").length;
  }

  const canEdit = canEditWorkspace(membership.role);
  const activeJobsCount = todaysJobs.filter(j => j.status !== "CANCELLED" && j.status !== "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Dispatch</p>
          <h2 className="font-display text-3xl text-ink">Operations center</h2>
          <p className="text-sm text-ink/70">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app/schedule" className="text-sm text-ink/60 hover:text-ink">
            View calendar →
          </Link>
          {canEdit && (
            <Button asChild size="sm">
              <Link href="/app/jobs/new">Add job</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-ink">{activeJobsCount}</p>
            <p className="text-xs text-ink/60">Active jobs today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-brand-600">{jobsByStatus.SCHEDULED.length}</p>
            <p className="text-xs text-ink/60">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-orange-600">{jobsByStatus.EN_ROUTE.length + jobsByStatus.ON_SITE.length}</p>
            <p className="text-xs text-ink/60">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-success-600">{jobsByStatus.COMPLETED.length}</p>
            <p className="text-xs text-ink/60">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today&apos;s Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysJobs.length === 0 ? (
              <p className="text-sm text-ink/50">No jobs scheduled for today.</p>
            ) : (
              <>
                {["SCHEDULED", "EN_ROUTE", "ON_SITE", "COMPLETED"].map((status) => {
                  const statusJobs = jobsByStatus[status];
                  if (statusJobs.length === 0) return null;
                  return (
                    <div key={status}>
                      <p className="text-xs font-medium text-ink/60 mb-2">
                        {status.replace("_", " ")} ({statusJobs.length})
                      </p>
                      <div className="space-y-2">
                        {statusJobs.map((job) => (
                          <Link
                            key={job.id}
                            href={`/app/jobs/${job.id}`}
                            className={`block rounded-xl border p-3 transition hover:shadow-sm ${statusColors[job.status]}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">{job.jobCode}</p>
                                <p className="text-xs opacity-80">{job.title}</p>
                                <p className="text-xs opacity-60">
                                  {job.building.name}
                                  {job.unit && ` - ${job.unit.identifier}`}
                                </p>
                              </div>
                              <div className="text-right">
                                {job.scheduledStartTime && (
                                  <p className="text-xs font-medium">{job.scheduledStartTime}</p>
                                )}
                                <p className="text-xs opacity-60">
                                  {job.mechanic ? `${job.mechanic.firstName} ${job.mechanic.lastName}` : "Unassigned"}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Unassigned Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unassigned Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {unassignedJobs.length === 0 ? (
                <p className="text-sm text-ink/50">All jobs are assigned!</p>
              ) : (
                <div className="space-y-2">
                  {unassignedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <Link href={`/app/jobs/${job.id}`} className="hover:underline">
                          <p className="text-sm font-medium text-ink truncate">{job.jobCode}</p>
                        </Link>
                        <p className="text-xs text-ink/60 truncate">{job.building.name}</p>
                        <p className="text-xs text-ink/40">
                          {new Date(job.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                      {canEdit && (
                        <QuickAssign jobId={job.id} mechanics={mechanics} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mechanic Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mechanic Workload</CardTitle>
            </CardHeader>
            <CardContent>
              {mechanics.length === 0 ? (
                <p className="text-sm text-ink/50">No active mechanics.</p>
              ) : (
                <div className="space-y-2">
                  {mechanics.map((m) => {
                    const count = mechanicWorkload[m.id] || 0;
                    const maxJobs = 6;
                    const percentage = Math.min((count / maxJobs) * 100, 100);
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-ink truncate">
                          {m.firstName} {m.lastName}
                        </div>
                        <div className="flex-1 h-4 bg-ink/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${count >= maxJobs ? "bg-danger-500" : count >= 4 ? "bg-warning-500" : "bg-success-500"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-12 text-right text-sm text-ink/60">
                          {count} jobs
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming (Next 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingJobs.length === 0 ? (
                <p className="text-sm text-ink/50">No upcoming jobs.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/app/jobs/${job.id}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white p-2 hover:border-ink/20"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{job.jobCode}</p>
                        <p className="text-xs text-ink/60 truncate">{job.building.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink/60">
                          {new Date(job.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                        <p className="text-xs text-ink/40">
                          {job.mechanic ? `${job.mechanic.firstName}` : "Unassigned"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
