import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Wrench,
  Phone,
  Calendar,
  Shield,
  ExternalLink
} from "lucide-react";

import { db } from "@/lib/db";
import { getInspectionComplianceStatus } from "@/lib/derived";
import { Button } from "@/components/ui/button";

interface PortalPageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params;
  
  // Find valid portal access
  const portalAccess = await db.portalAccess.findFirst({
    where: {
      token,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      managementCompany: {
        include: {
          company: true,
          buildings: {
            where: { archivedAt: null },
            include: {
              units: {
                where: { archivedAt: null, isActive: true },
                include: {
                  unitCategory: true,
                  unitStatus: true,
                  inspections: {
                    orderBy: { inspectionDate: "desc" },
                    take: 1,
                    include: {
                      inspector: true,
                      inspectionStatus: true,
                      inspectionResult: true,
                    },
                  },
                  maintenances: {
                    where: { status: "OPEN" },
                    orderBy: { maintenanceDate: "desc" },
                    take: 3,
                  },
                  emergencyCalls: {
                    where: { completedAt: null },
                    orderBy: { callInAt: "desc" },
                    take: 3,
                  },
                },
              },
            },
          },
          inspections: {
            where: { archivedAt: null },
            orderBy: { inspectionDate: "desc" },
            take: 10,
            include: {
              unit: true,
              building: true,
              inspector: true,
              inspectionStatus: true,
              inspectionResult: true,
            },
          },
          maintenances: {
            where: { archivedAt: null },
            orderBy: { maintenanceDate: "desc" },
            take: 10,
            include: {
              unit: true,
              building: true,
              mechanic: true,
            },
          },
          emergencyCalls: {
            where: { archivedAt: null },
            orderBy: { callInAt: "desc" },
            take: 10,
            include: {
              unit: true,
              building: true,
              mechanic: true,
              emergencyCallStatus: true,
            },
          },
        },
      },
    },
  });

  if (!portalAccess) {
    notFound();
  }

  // Update last accessed time
  await db.portalAccess.update({
    where: { id: portalAccess.id },
    data: { lastAccessedAt: new Date() },
  });

  const { managementCompany } = portalAccess;
  const { company } = managementCompany;

  // Calculate stats
  let totalUnits = 0;
  let compliantUnits = 0;
  let expiringSoon = 0;
  let overdueUnits = 0;
  let openMaintenance = 0;
  let openEmergency = 0;

  for (const building of managementCompany.buildings) {
    for (const unit of building.units) {
      totalUnits++;
      const latestInspection = unit.inspections[0];
      const status = getInspectionComplianceStatus(
        latestInspection?.expirationDate,
        Boolean(latestInspection)
      );
      
      if (status === "VALID") compliantUnits++;
      if (status === "EXPIRING_SOON") expiringSoon++;
      if (status === "OVERDUE" || status === "MISSING") overdueUnits++;
      
      openMaintenance += unit.maintenances.length;
      openEmergency += unit.emergencyCalls.length;
    }
  }

  const complianceRate = totalUnits > 0 
    ? Math.round((compliantUnits / totalUnits) * 100) 
    : 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/icon.svg" alt="Uplio" width={32} height={32} className="rounded-lg" />
              <div>
                <p className="text-xs text-slate-500">Customer Portal</p>
                <h1 className="font-semibold text-slate-900">{managementCompany.name}</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Service Provider</p>
              <p className="font-medium text-slate-900">{company.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome, {portalAccess.contactName}
          </h2>
          <p className="mt-1 text-slate-600">
            View the status of your elevator and escalator units below.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Compliance Rate */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <Shield className="h-6 w-6 text-brand-600" />
              </div>
              <span className={`text-3xl font-bold ${
                complianceRate >= 80 ? 'text-success-600' : 
                complianceRate >= 50 ? 'text-warning-600' : 'text-danger-600'
              }`}>{complianceRate}%</span>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-slate-900">Compliance Rate</p>
              <p className="text-sm text-slate-500">{compliantUnits} of {totalUnits} units compliant</p>
            </div>
          </div>

          {/* Units */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Building2 className="h-6 w-6 text-slate-600" />
              </div>
              <span className="text-3xl font-bold text-slate-900">{totalUnits}</span>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-slate-900">Active Units</p>
              <p className="text-sm text-slate-500">{managementCompany.buildings.length} buildings</p>
            </div>
          </div>

          {/* Open Maintenance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50">
                <Wrench className="h-6 w-6 text-accent-600" />
              </div>
              <span className="text-3xl font-bold text-accent-600">{openMaintenance}</span>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-slate-900">Open Maintenance</p>
              <p className="text-sm text-slate-500">In progress</p>
            </div>
          </div>

          {/* Attention Needed */}
          <div className={`rounded-2xl border p-6 ${
            overdueUnits > 0 || openEmergency > 0
              ? 'border-danger-200 bg-danger-50'
              : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                overdueUnits > 0 || openEmergency > 0 ? 'bg-danger-100' : 'bg-success-50'
              }`}>
                <AlertTriangle className={`h-6 w-6 ${
                  overdueUnits > 0 || openEmergency > 0 ? 'text-danger-600' : 'text-success-600'
                }`} />
              </div>
              <span className={`text-3xl font-bold ${
                overdueUnits > 0 || openEmergency > 0 ? 'text-danger-600' : 'text-success-600'
              }`}>{overdueUnits + openEmergency}</span>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-slate-900">Needs Attention</p>
              <p className="text-sm text-slate-500">
                {overdueUnits > 0 ? `${overdueUnits} overdue inspections` : ''}
                {overdueUnits > 0 && openEmergency > 0 ? ', ' : ''}
                {openEmergency > 0 ? `${openEmergency} emergency calls` : ''}
                {overdueUnits === 0 && openEmergency === 0 ? 'All good!' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Buildings & Units */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Your Units</h3>
          <div className="space-y-4">
            {managementCompany.buildings.map((building) => (
              <div key={building.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{building.name}</h4>
                      <p className="text-sm text-slate-500">{building.address}</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {building.units.map((unit) => {
                    const latestInspection = unit.inspections[0];
                    const complianceStatus = getInspectionComplianceStatus(
                      latestInspection?.expirationDate,
                      Boolean(latestInspection)
                    );
                    
                    return (
                      <div key={unit.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            complianceStatus === 'VALID' ? 'bg-success-50' :
                            complianceStatus === 'EXPIRING_SOON' ? 'bg-warning-50' :
                            'bg-danger-50'
                          }`}>
                            {complianceStatus === 'VALID' ? (
                              <CheckCircle className="h-5 w-5 text-success-600" />
                            ) : complianceStatus === 'EXPIRING_SOON' ? (
                              <Clock className="h-5 w-5 text-warning-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-danger-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{unit.identifier}</p>
                            <p className="text-sm text-slate-500">
                              {unit.unitCategory.name} • {unit.unitStatus.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {latestInspection ? (
                            <>
                              <p className="text-sm font-medium text-slate-900">
                                Expires: {latestInspection.expirationDate 
                                  ? new Date(latestInspection.expirationDate).toLocaleDateString() 
                                  : 'N/A'}
                              </p>
                              <p className={`text-xs ${
                                complianceStatus === 'VALID' ? 'text-success-600' :
                                complianceStatus === 'EXPIRING_SOON' ? 'text-warning-600' :
                                'text-danger-600'
                              }`}>
                                {complianceStatus === 'VALID' ? 'Compliant' :
                                 complianceStatus === 'EXPIRING_SOON' ? 'Expiring Soon' :
                                 'Action Required'}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-danger-600">No inspection on record</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {building.units.length === 0 && (
                    <div className="px-6 py-8 text-center text-slate-500">
                      No units in this building
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Inspections */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="font-semibold text-slate-900">Recent Inspections</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {managementCompany.inspections.slice(0, 5).map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {inspection.building.name} - {inspection.unit.identifier}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(inspection.inspectionDate).toLocaleDateString()}
                      {inspection.inspector && ` • ${inspection.inspector.firstName} ${inspection.inspector.lastName}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    inspection.inspectionResult?.name === 'Passed' 
                      ? 'bg-success-50 text-success-700'
                      : inspection.inspectionResult?.name === 'Failed'
                      ? 'bg-danger-50 text-danger-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {inspection.inspectionResult?.name || inspection.inspectionStatus.name}
                  </span>
                </div>
              ))}
              {managementCompany.inspections.length === 0 && (
                <div className="px-6 py-8 text-center text-slate-500">
                  No inspections recorded
                </div>
              )}
            </div>
          </div>

          {/* Recent Maintenance */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="font-semibold text-slate-900">Recent Maintenance</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {managementCompany.maintenances.slice(0, 5).map((maintenance) => (
                <div key={maintenance.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {maintenance.building.name} - {maintenance.unit.identifier}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(maintenance.maintenanceDate).toLocaleDateString()}
                      {maintenance.mechanic && ` • ${maintenance.mechanic.firstName} ${maintenance.mechanic.lastName}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    maintenance.status === 'COMPLETED' 
                      ? 'bg-success-50 text-success-700'
                      : 'bg-warning-50 text-warning-700'
                  }`}>
                    {maintenance.status}
                  </span>
                </div>
              ))}
              {managementCompany.maintenances.length === 0 && (
                <div className="px-6 py-8 text-center text-slate-500">
                  No maintenance recorded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Contact Your Service Provider</h3>
          <div className="flex flex-wrap gap-4">
            {managementCompany.company && (
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="h-4 w-4" />
                <span>{company.name}</span>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            For service requests or questions, please contact your service provider directly.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>Powered by Uplio</p>
            <p>Portal access expires {new Date(portalAccess.expiresAt).toLocaleDateString()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
