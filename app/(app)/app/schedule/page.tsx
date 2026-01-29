import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ 
    view?: string; 
    date?: string;
    mechanic?: string;
  }>;
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  EN_ROUTE: "bg-yellow-500",
  ON_SITE: "bg-orange-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-gray-400"
};

function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function getMonthDates(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const dates: Date[] = [];
  const startDay = firstDay.getDay();
  const startOffset = startDay === 0 ? 6 : startDay - 1;
  
  for (let i = -startOffset; i <= lastDay.getDate() + (6 - lastDay.getDay()); i++) {
    const d = new Date(year, month, i + 1);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const view = params.view || "week";
  const currentDate = params.date ? new Date(params.date) : new Date();
  
  const dates = view === "month" ? getMonthDates(currentDate) : getWeekDates(currentDate);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const whereClause: Record<string, unknown> = {
    companyId: membership.companyId,
    archivedAt: null,
    scheduledDate: {
      gte: startDate,
      lte: endDate
    }
  };

  if (params.mechanic) {
    whereClause.mechanicId = params.mechanic;
  }

  const [jobs, mechanics] = await Promise.all([
    db.scheduledJob.findMany({
      where: whereClause,
      include: {
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

  // Group jobs by date
  const jobsByDate: Record<string, typeof jobs> = {};
  for (const job of jobs) {
    const key = formatDateKey(new Date(job.scheduledDate));
    if (!jobsByDate[key]) jobsByDate[key] = [];
    jobsByDate[key].push(job);
  }

  const canEdit = canEditWorkspace(membership.role);

  // Navigation
  const prevDate = new Date(currentDate);
  const nextDate = new Date(currentDate);
  if (view === "month") {
    prevDate.setMonth(prevDate.getMonth() - 1);
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else {
    prevDate.setDate(prevDate.getDate() - 7);
    nextDate.setDate(nextDate.getDate() + 7);
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = formatDateKey(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Schedule</p>
          <h2 className="font-display text-3xl text-ink">Calendar</h2>
          <p className="text-sm text-ink/70">View scheduled jobs by date.</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <Button asChild size="sm">
              <Link href="/app/jobs/new">Add job</Link>
            </Button>
          )}
        </div>
      </div>

      {/* View Toggle & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/app/schedule?date=${formatDateKey(prevDate)}&view=${view}${params.mechanic ? `&mechanic=${params.mechanic}` : ""}`}
            className="rounded-full bg-ink/10 px-3 py-1 text-sm hover:bg-ink/20"
          >
            ←
          </Link>
          <span className="text-sm font-medium text-ink min-w-[180px] text-center">
            {view === "month" 
              ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : `${dates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${dates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
            }
          </span>
          <Link
            href={`/app/schedule?date=${formatDateKey(nextDate)}&view=${view}${params.mechanic ? `&mechanic=${params.mechanic}` : ""}`}
            className="rounded-full bg-ink/10 px-3 py-1 text-sm hover:bg-ink/20"
          >
            →
          </Link>
          <Link
            href={`/app/schedule?view=${view}${params.mechanic ? `&mechanic=${params.mechanic}` : ""}`}
            className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/60 hover:bg-ink/10 ml-2"
          >
            Today
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/schedule?view=week&date=${formatDateKey(currentDate)}${params.mechanic ? `&mechanic=${params.mechanic}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs transition ${view === "week" ? "bg-ink text-white" : "bg-ink/10 hover:bg-ink/20"}`}
          >
            Week
          </Link>
          <Link
            href={`/app/schedule?view=month&date=${formatDateKey(currentDate)}${params.mechanic ? `&mechanic=${params.mechanic}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs transition ${view === "month" ? "bg-ink text-white" : "bg-ink/10 hover:bg-ink/20"}`}
          >
            Month
          </Link>
        </div>
      </div>

      {/* Mechanic Filter */}
      {mechanics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-ink/60 self-center">Mechanic:</span>
          <Link
            href={`/app/schedule?view=${view}&date=${formatDateKey(currentDate)}`}
            className={`rounded-full px-3 py-1 text-xs transition ${!params.mechanic ? "bg-ink/20 text-ink" : "bg-ink/5 text-ink/60 hover:bg-ink/10"}`}
          >
            All
          </Link>
          {mechanics.map((m) => (
            <Link
              key={m.id}
              href={`/app/schedule?view=${view}&date=${formatDateKey(currentDate)}&mechanic=${m.id}`}
              className={`rounded-full px-3 py-1 text-xs transition ${params.mechanic === m.id ? "bg-ink/20 text-ink" : "bg-ink/5 text-ink/60 hover:bg-ink/10"}`}
            >
              {m.firstName} {m.lastName}
            </Link>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-ink/10 bg-ink/5">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-ink/60">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className={`grid grid-cols-7 ${view === "month" ? "auto-rows-[100px]" : "auto-rows-[150px]"}`}>
          {dates.map((date) => {
            const key = formatDateKey(date);
            const dayJobs = jobsByDate[key] || [];
            const isToday = key === today;
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();

            return (
              <div
                key={key}
                className={`border-b border-r border-ink/10 p-1 ${!isCurrentMonth && view === "month" ? "bg-ink/5" : ""}`}
              >
                <div className={`text-xs mb-1 ${isToday ? "bg-ink text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto" : "text-ink/60 text-center"}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-0.5 overflow-y-auto max-h-[calc(100%-24px)]">
                  {dayJobs.slice(0, view === "month" ? 3 : 10).map((job) => (
                    <Link
                      key={job.id}
                      href={`/app/jobs/${job.id}`}
                      className={`block rounded px-1 py-0.5 text-xs text-white truncate ${statusColors[job.status]} hover:opacity-80`}
                      title={`${job.jobCode} - ${job.title}`}
                    >
                      {job.scheduledStartTime && <span className="opacity-75">{job.scheduledStartTime} </span>}
                      {job.title}
                    </Link>
                  ))}
                  {dayJobs.length > (view === "month" ? 3 : 10) && (
                    <p className="text-xs text-ink/50 text-center">+{dayJobs.length - (view === "month" ? 3 : 10)} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span>En Route</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span>On Site</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-400"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}
