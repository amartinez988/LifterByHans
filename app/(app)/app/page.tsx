import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, Clock, Phone, Shield, Wrench } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { QuickActions } from "@/components/ui/quick-actions";
import { db } from "@/lib/db";
import { getInspectionComplianceStatus } from "@/lib/derived";

export default async function AppHomePage() {
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

  const [units, openMaintenance, openEmergency] = await Promise.all([
    db.unit.findMany({
      where: { companyId: membership.companyId, isActive: true },
      include: {
        inspections: { orderBy: { inspectionDate: "desc" }, take: 1 }
      }
    }),
    db.maintenance.count({
      where: { companyId: membership.companyId, status: "OPEN" }
    }),
    db.emergencyCall.count({
      where: { companyId: membership.companyId, completedAt: null }
    })
  ]);

  let expiringSoon = 0;
  let overdue = 0;
  let compliant = 0;
  let missing = 0;

  for (const unit of units) {
    const latest = unit.inspections[0];
    const status = getInspectionComplianceStatus(
      latest?.expirationDate,
      Boolean(latest)
    );
    if (status === "EXPIRING_SOON") expiringSoon += 1;
    if (status === "OVERDUE") overdue += 1;
    if (status === "VALID") compliant += 1;
    if (status === "MISSING") missing += 1;
  }

  const unitsAtRisk = overdue + missing;
  const activeUnits = units.length;
  const complianceRate = activeUnits > 0 
    ? Math.round((compliant / activeUnits) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600">Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-slate-900">
            {membership.company.name}
          </h1>
          <p className="mt-1 text-slate-500">
            Here&apos;s what&apos;s happening with your operations today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/compliance">
              View Compliance
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Compliance Card */}
        <Link
          href="/app/compliance"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors">
              <Shield className="h-6 w-6 text-brand-600" />
            </div>
            <span className="text-3xl font-bold text-brand-600">{complianceRate}%</span>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-slate-900">Compliance Rate</p>
            <p className="text-sm text-slate-500">{compliant} of {activeUnits} units compliant</p>
          </div>
          {expiringSoon > 0 && (
            <div className="mt-3 flex items-center gap-1 text-sm text-warning-600">
              <Clock className="h-4 w-4" />
              {expiringSoon} expiring soon
            </div>
          )}
        </Link>

        {/* Emergency Calls Card */}
        <Link
          href="/app/emergency-calls"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-accent-200 hover:shadow-lg hover:shadow-accent-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 group-hover:bg-accent-100 transition-colors">
              <Phone className="h-6 w-6 text-accent-600" />
            </div>
            <span className="text-3xl font-bold text-accent-600">{openEmergency}</span>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-slate-900">Emergency Calls</p>
            <p className="text-sm text-slate-500">Open calls requiring attention</p>
          </div>
        </Link>

        {/* Maintenance Card */}
        <Link
          href="/app/maintenance"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
              <Wrench className="h-6 w-6 text-slate-600" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{openMaintenance}</span>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-slate-900">Maintenance</p>
            <p className="text-sm text-slate-500">Active maintenance events</p>
          </div>
        </Link>

        {/* Units at Risk Card */}
        <Link
          href="/app/alerts"
          className={`group relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all hover:shadow-lg ${
            unitsAtRisk > 0 
              ? "border-danger-200 bg-danger-50 hover:border-danger-300 hover:shadow-danger-500/10" 
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
              unitsAtRisk > 0 
                ? "bg-danger-100 group-hover:bg-danger-200" 
                : "bg-success-50 group-hover:bg-success-100"
            }`}>
              <AlertTriangle className={`h-6 w-6 ${unitsAtRisk > 0 ? "text-danger-600" : "text-success-600"}`} />
            </div>
            <span className={`text-3xl font-bold ${unitsAtRisk > 0 ? "text-danger-600" : "text-success-600"}`}>
              {unitsAtRisk}
            </span>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-slate-900">Units at Risk</p>
            <p className="text-sm text-slate-500">
              {unitsAtRisk > 0 ? "Overdue or missing inspections" : "All units are compliant!"}
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
