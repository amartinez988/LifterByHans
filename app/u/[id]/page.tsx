import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Building2, Phone, MapPin, Calendar, CheckCircle2, AlertTriangle, Clock, Wrench, AlertCircle } from "lucide-react";
import { db } from "@/lib/db";
import { QuickIssueForm } from "./quick-issue-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicUnitPage({ params }: PageProps) {
  const { id } = await params;

  const unit = await db.unit.findUnique({
    where: { id },
    include: {
      building: {
        include: {
          managementCompany: true,
        },
      },
      unitCategory: true,
      unitStatus: true,
      equipmentType: true,
      brand: true,
      inspections: {
        where: { archivedAt: null },
        orderBy: { inspectionDate: "desc" },
        take: 1,
        include: {
          inspectionResult: true,
        },
      },
      maintenances: {
        where: { archivedAt: null },
        orderBy: { maintenanceDate: "desc" },
        take: 3,
        include: {
          mechanic: true,
        },
      },
      emergencyCalls: {
        where: { archivedAt: null },
        orderBy: { callInAt: "desc" },
        take: 3,
      },
    },
  });

  if (!unit || unit.archivedAt) {
    notFound();
  }

  const latestInspection = unit.inspections[0];
  const isCompliant = latestInspection?.expirationDate 
    ? new Date(latestInspection.expirationDate) > new Date()
    : false;

  const daysUntilExpiration = latestInspection?.expirationDate
    ? Math.ceil((new Date(latestInspection.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-6 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.svg" alt="Uplio" width={28} height={28} className="rounded-lg" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">UPLIO</span>
          </Link>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            Unit Info
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Unit Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Status Banner */}
          <div className={`px-4 py-2 flex items-center justify-between ${
            isCompliant 
              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
              : "bg-gradient-to-r from-amber-500 to-orange-500"
          }`}>
            <div className="flex items-center gap-2 text-white">
              {isCompliant ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Compliant</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Needs Attention</span>
                </>
              )}
            </div>
            {daysUntilExpiration !== null && (
              <span className="text-xs text-white/80">
                {daysUntilExpiration > 0 
                  ? `Expires in ${daysUntilExpiration} days`
                  : `Expired ${Math.abs(daysUntilExpiration)} days ago`
                }
              </span>
            )}
          </div>

          {/* Unit Details */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{unit.identifier}</h1>
                <p className="text-slate-600">{unit.unitCategory.name}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                unit.unitStatus.name.toLowerCase().includes("operational")
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {unit.unitStatus.name}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>{unit.building.name}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{unit.building.address}</span>
              </div>
              {unit.building.localPhone && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${unit.building.localPhone}`} className="text-blue-600 hover:underline">
                    {unit.building.localPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{unit.landings || "-"}</div>
            <div className="text-xs text-slate-500">Landings</div>
          </div>
          <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{unit.capacity ? `${unit.capacity}` : "-"}</div>
            <div className="text-xs text-slate-500">Capacity (lbs)</div>
          </div>
          <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{unit.brand.name.split(" ")[0]}</div>
            <div className="text-xs text-slate-500">Brand</div>
          </div>
        </div>

        {/* Equipment Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-slate-400" />
            Equipment Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Type:</span>
              <span className="ml-2 text-slate-900">{unit.equipmentType.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Brand:</span>
              <span className="ml-2 text-slate-900">{unit.brand.name}</span>
            </div>
            {unit.serialNumber && (
              <div>
                <span className="text-slate-500">Serial:</span>
                <span className="ml-2 text-slate-900 font-mono text-xs">{unit.serialNumber}</span>
              </div>
            )}
            {unit.machineRoomLocation && (
              <div>
                <span className="text-slate-500">Machine Room:</span>
                <span className="ml-2 text-slate-900">{unit.machineRoomLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Latest Inspection */}
        {latestInspection && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              Last Inspection
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-900">
                  {new Date(latestInspection.inspectionDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className={`text-sm ${
                  latestInspection.inspectionResult?.name.toLowerCase().includes("passed")
                    ? "text-green-600"
                    : "text-amber-600"
                }`}>
                  {latestInspection.inspectionResult?.name || "Pending"}
                </div>
              </div>
              {latestInspection.expirationDate && (
                <div className="text-right">
                  <div className="text-xs text-slate-500">Expires</div>
                  <div className="text-slate-900">
                    {new Date(latestInspection.expirationDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {(unit.maintenances.length > 0 || unit.emergencyCalls.length > 0) && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {unit.maintenances.map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm border-l-2 border-blue-400 pl-3">
                  <Wrench className="h-3 w-3 text-blue-500" />
                  <div>
                    <span className="text-slate-900">Maintenance</span>
                    <span className="text-slate-500 ml-2">
                      {new Date(m.maintenanceDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {unit.emergencyCalls.slice(0, 2).map((e) => (
                <div key={e.id} className="flex items-center gap-3 text-sm border-l-2 border-red-400 pl-3">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <div>
                    <span className="text-slate-900">Emergency Call</span>
                    <span className="text-slate-500 ml-2">
                      {new Date(e.callInAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Issue Report */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            Report an Issue
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Notice something wrong with this elevator? Let us know quickly.
          </p>
          <QuickIssueForm 
            unitId={unit.id} 
            buildingName={unit.building.name}
            unitIdentifier={unit.identifier}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 py-4">
          <p>Powered by Uplio</p>
          <p className="mt-1">Elevator Service Management</p>
        </div>
      </div>
    </main>
  );
}
