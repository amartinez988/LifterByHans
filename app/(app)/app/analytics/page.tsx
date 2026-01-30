import { redirect } from "next/navigation";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Wrench,
  CheckCircle,
  AlertTriangle,
  DollarSign
} from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AnalyticsCharts } from "./analytics-charts";

export default async function AnalyticsPage() {
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

  const companyId = membership.companyId;

  // Get date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Fetch all analytics data in parallel
  const [
    totalUnits,
    activeUnits,
    totalMechanics,
    activeMechanics,
    totalJobs,
    completedJobsThisMonth,
    completedJobsLastMonth,
    scheduledJobs,
    openMaintenance,
    completedMaintenanceThisMonth,
    completedMaintenanceLastMonth,
    emergencyCallsThisMonth,
    emergencyCallsLastMonth,
    openEmergencyCalls,
    inspectionsThisMonth,
    inspectionsLastMonth,
    upcomingInspections,
    overdueUnits,
    jobsLast30Days,
    maintenanceLast30Days,
    emergencyLast30Days,
    mechanicJobCounts,
    jobsByStatus,
    jobsByPriority,
  ] = await Promise.all([
    // Unit counts
    db.unit.count({ where: { companyId } }),
    db.unit.count({ where: { companyId, isActive: true } }),
    
    // Mechanic counts
    db.mechanic.count({ where: { companyId } }),
    db.mechanic.count({ where: { companyId, isActive: true } }),
    
    // Job counts
    db.scheduledJob.count({ where: { companyId } }),
    db.scheduledJob.count({ 
      where: { 
        companyId, 
        status: "COMPLETED",
        completedAt: { gte: startOfMonth }
      } 
    }),
    db.scheduledJob.count({ 
      where: { 
        companyId, 
        status: "COMPLETED",
        completedAt: { gte: startOfLastMonth, lt: startOfMonth }
      } 
    }),
    db.scheduledJob.count({ 
      where: { 
        companyId, 
        status: "SCHEDULED",
        scheduledDate: { gte: now }
      } 
    }),
    
    // Maintenance counts
    db.maintenance.count({ where: { companyId, status: "OPEN" } }),
    db.maintenance.count({ 
      where: { 
        companyId, 
        status: "COMPLETED",
        updatedAt: { gte: startOfMonth }
      } 
    }),
    db.maintenance.count({ 
      where: { 
        companyId, 
        status: "COMPLETED",
        updatedAt: { gte: startOfLastMonth, lt: startOfMonth }
      } 
    }),
    
    // Emergency call counts
    db.emergencyCall.count({ 
      where: { 
        companyId,
        callInAt: { gte: startOfMonth }
      } 
    }),
    db.emergencyCall.count({ 
      where: { 
        companyId,
        callInAt: { gte: startOfLastMonth, lt: startOfMonth }
      } 
    }),
    db.emergencyCall.count({ 
      where: { 
        companyId,
        completedAt: null
      } 
    }),
    
    // Inspection counts
    db.inspection.count({ 
      where: { 
        companyId,
        inspectionDate: { gte: startOfMonth }
      } 
    }),
    db.inspection.count({ 
      where: { 
        companyId,
        inspectionDate: { gte: startOfLastMonth, lt: startOfMonth }
      } 
    }),
    db.inspection.count({ 
      where: { 
        companyId,
        expirationDate: { 
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        }
      } 
    }),
    
    // Overdue units (no valid inspection)
    db.unit.count({
      where: {
        companyId,
        isActive: true,
        inspections: {
          every: {
            expirationDate: { lt: now }
          }
        }
      }
    }),
    
    // Jobs last 30 days (for chart)
    db.scheduledJob.findMany({
      where: {
        companyId,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: { scheduledDate: "asc" }
    }),
    
    // Maintenance last 30 days
    db.maintenance.findMany({
      where: {
        companyId,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        id: true,
        status: true,
        maintenanceDate: true,
        createdAt: true,
      },
      orderBy: { maintenanceDate: "asc" }
    }),
    
    // Emergency calls last 30 days
    db.emergencyCall.findMany({
      where: {
        companyId,
        callInAt: { gte: thirtyDaysAgo }
      },
      select: {
        id: true,
        callInAt: true,
        completedAt: true,
      },
      orderBy: { callInAt: "asc" }
    }),
    
    // Mechanic job counts
    db.mechanic.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            scheduledJobs: {
              where: {
                status: "COMPLETED",
                completedAt: { gte: startOfMonth }
              }
            }
          }
        }
      }
    }),
    
    // Jobs by status
    db.scheduledJob.groupBy({
      by: ["status"],
      where: { companyId },
      _count: { id: true }
    }),
    
    // Jobs by priority
    db.scheduledJob.groupBy({
      by: ["priority"],
      where: { companyId },
      _count: { id: true }
    }),
  ]);

  // Calculate percentage changes
  const jobsChange = completedJobsLastMonth > 0 
    ? Math.round(((completedJobsThisMonth - completedJobsLastMonth) / completedJobsLastMonth) * 100)
    : completedJobsThisMonth > 0 ? 100 : 0;
    
  const maintenanceChange = completedMaintenanceLastMonth > 0
    ? Math.round(((completedMaintenanceThisMonth - completedMaintenanceLastMonth) / completedMaintenanceLastMonth) * 100)
    : completedMaintenanceThisMonth > 0 ? 100 : 0;
    
  const emergencyChange = emergencyCallsLastMonth > 0
    ? Math.round(((emergencyCallsThisMonth - emergencyCallsLastMonth) / emergencyCallsLastMonth) * 100)
    : emergencyCallsThisMonth > 0 ? 100 : 0;

  // Prepare chart data - daily activity for last 30 days
  const dailyData: { date: string; jobs: number; maintenance: number; emergency: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const jobsCount = jobsLast30Days.filter(j => 
      j.scheduledDate.toISOString().split('T')[0] === dateStr
    ).length;
    
    const maintenanceCount = maintenanceLast30Days.filter(m =>
      m.maintenanceDate.toISOString().split('T')[0] === dateStr
    ).length;
    
    const emergencyCount = emergencyLast30Days.filter(e =>
      e.callInAt.toISOString().split('T')[0] === dateStr
    ).length;
    
    dailyData.push({
      date: displayDate,
      jobs: jobsCount,
      maintenance: maintenanceCount,
      emergency: emergencyCount,
    });
  }

  // Prepare mechanic performance data
  const mechanicPerformance = mechanicJobCounts
    .map(m => ({
      name: `${m.firstName} ${m.lastName}`,
      completed: m._count.scheduledJobs,
    }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 10);

  // Prepare status distribution data
  const statusData = jobsByStatus.map(s => ({
    name: s.status.replace('_', ' '),
    value: s._count.id,
  }));

  // Prepare priority distribution data  
  const priorityData = jobsByPriority.map(p => ({
    name: p.priority,
    value: p._count.id,
  }));

  // Calculate average response time for emergency calls (in hours)
  const completedEmergencies = emergencyLast30Days.filter(e => e.completedAt);
  const avgResponseTime = completedEmergencies.length > 0
    ? Math.round(completedEmergencies.reduce((sum, e) => {
        const diff = e.completedAt!.getTime() - e.callInAt.getTime();
        return sum + diff / (1000 * 60 * 60); // Convert to hours
      }, 0) / completedEmergencies.length * 10) / 10
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-brand-600">Business Intelligence</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-slate-500">
          Track performance metrics and business insights for your operations.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Jobs Completed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
              <CheckCircle className="h-6 w-6 text-brand-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              jobsChange >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${jobsChange < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(jobsChange)}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900">{completedJobsThisMonth}</p>
            <p className="text-sm text-slate-500">Jobs completed this month</p>
          </div>
        </div>

        {/* Maintenance Completed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Wrench className="h-6 w-6 text-slate-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              maintenanceChange >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${maintenanceChange < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(maintenanceChange)}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900">{completedMaintenanceThisMonth}</p>
            <p className="text-sm text-slate-500">Maintenance completed this month</p>
          </div>
        </div>

        {/* Active Units */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50">
              <BarChart3 className="h-6 w-6 text-accent-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900">{activeUnits}</p>
            <p className="text-sm text-slate-500">Active units under service</p>
          </div>
        </div>

        {/* Emergency Response Time */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900">{avgResponseTime}h</p>
            <p className="text-sm text-slate-500">Avg. emergency response time</p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{scheduledJobs}</p>
          <p className="text-xs text-slate-500">Scheduled Jobs</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{openMaintenance}</p>
          <p className="text-xs text-slate-500">Open Maintenance</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-warning-600">{openEmergencyCalls}</p>
          <p className="text-xs text-slate-500">Open Emergency Calls</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{upcomingInspections}</p>
          <p className="text-xs text-slate-500">Inspections Due (30d)</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-danger-600">{overdueUnits}</p>
          <p className="text-xs text-slate-500">Overdue Units</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{activeMechanics}</p>
          <p className="text-xs text-slate-500">Active Mechanics</p>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        dailyData={dailyData}
        mechanicPerformance={mechanicPerformance}
        statusData={statusData}
        priorityData={priorityData}
      />
    </div>
  );
}
