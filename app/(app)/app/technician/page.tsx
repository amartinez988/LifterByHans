import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Navigation,
  Wrench,
  AlertTriangle,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { JobCard } from "./job-card";

export default async function TechnicianPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const membership = await db.companyMember.findFirst({
    where: { userId: session.user.id },
    include: { company: true }
  });

  if (!membership) {
    redirect("/onboarding");
  }

  // Find mechanic profile for this user
  const mechanic = await db.mechanic.findFirst({
    where: {
      companyId: membership.companyId,
      OR: [
        { email: session.user.email },
        // Could also match by name if needed
      ],
    },
  });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Get today's jobs
  const [todaysJobs, upcomingJobs, openEmergencies] = await Promise.all([
    db.scheduledJob.findMany({
      where: {
        companyId: membership.companyId,
        ...(mechanic ? { mechanicId: mechanic.id } : {}),
        scheduledDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
        mechanic: true,
      },
      orderBy: { scheduledDate: "asc" },
    }),
    db.scheduledJob.findMany({
      where: {
        companyId: membership.companyId,
        ...(mechanic ? { mechanicId: mechanic.id } : {}),
        scheduledDate: { gt: endOfDay },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
        mechanic: true,
      },
      orderBy: { scheduledDate: "asc" },
      take: 5,
    }),
    db.emergencyCall.findMany({
      where: {
        companyId: membership.companyId,
        completedAt: null,
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
      orderBy: { callInAt: "desc" },
      take: 3,
    }),
  ]);

  const completedToday = await db.scheduledJob.count({
    where: {
      companyId: membership.companyId,
      ...(mechanic ? { mechanicId: mechanic.id } : {}),
      status: "COMPLETED",
      completedAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-brand-100 text-sm">Good {getTimeOfDay()},</p>
            <h1 className="text-2xl font-bold">
              {mechanic ? `${mechanic.firstName}` : session.user.name?.split(" ")[0] || "Technician"}
            </h1>
          </div>
          <Link href="/app">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              Full App
            </Button>
          </Link>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{todaysJobs.length}</p>
            <p className="text-xs text-brand-100">Today&apos;s Jobs</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{completedToday}</p>
            <p className="text-xs text-brand-100">Completed</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-amber-300">{openEmergencies.length}</p>
            <p className="text-xs text-brand-100">Emergencies</p>
          </div>
        </div>
      </div>

      {/* Emergency Alerts */}
      {openEmergencies.length > 0 && (
        <div className="px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="font-semibold text-red-900">Active Emergencies</h2>
            </div>
            <div className="space-y-2">
              {openEmergencies.map((emergency) => (
                <Link
                  key={emergency.id}
                  href={`/app/emergency-calls`}
                  className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">{emergency.unit.identifier}</p>
                    <p className="text-sm text-slate-500">{emergency.unit.building.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${emergency.unit.building.phone || ""}`}
                      className="p-2 bg-red-100 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-4 w-4 text-red-600" />
                    </a>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-500" />
            Today&apos;s Schedule
          </h2>
          <Link href="/app/schedule" className="text-sm text-brand-600 font-medium">
            View All
          </Link>
        </div>

        {todaysJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-slate-900">All caught up!</p>
            <p className="text-sm text-slate-500">No more jobs scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Jobs */}
      {upcomingJobs.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-slate-500" />
            Coming Up
          </h2>
          <div className="space-y-2">
            {upcomingJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{job.unit?.identifier || "No Unit"}</p>
                  <p className="text-sm text-slate-500">
                    {job.jobType || "Job"} • {job.scheduledDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex gap-3">
        <Link href="/app/dispatch" className="flex-1">
          <Button variant="outline" className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            Dispatch
          </Button>
        </Link>
        <Link href="/app/jobs/new" className="flex-1">
          <Button className="w-full">
            <Wrench className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </Link>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
