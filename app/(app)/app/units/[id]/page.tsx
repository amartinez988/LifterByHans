import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Wrench, AlertCircle, CheckCircle, Clock } from "lucide-react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { UnitQRCode } from "@/components/unit-qr-code";
import { DocumentUpload } from "@/components/document-upload";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import UnitForm from "../unit-form";
import {
  archiveUnitAction,
  restoreUnitAction,
  deleteUnitAction,
  canDeleteUnit
} from "../actions";

type UnitPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UnitPage({ params }: UnitPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const unit = await db.unit.findUnique({
    where: { id },
    include: {
      building: {
        include: {
          managementCompany: true
        }
      },
      unitCategory: true,
      unitStatus: true,
      brand: true,
      equipmentType: true,
      inspections: {
        where: { archivedAt: null },
        orderBy: { inspectionDate: "desc" },
        take: 5,
        include: {
          inspectionResult: true,
          inspectionStatus: true,
          inspector: true,
        },
      },
      maintenances: {
        where: { archivedAt: null },
        orderBy: { maintenanceDate: "desc" },
        take: 5,
        include: {
          mechanic: true,
        },
      },
      emergencyCalls: {
        where: { archivedAt: null },
        orderBy: { callInAt: "desc" },
        take: 5,
        include: {
          emergencyCallStatus: true,
          mechanic: true,
        },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    }
  });

  if (!unit || unit.companyId !== membership.companyId) {
    redirect("/app/management-companies");
  }

  const [categories, statuses, equipmentTypes, brands] = await Promise.all([
    db.unitCategory.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.unitStatus.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.unitEquipmentType.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.unitBrand.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  const canEdit = canEditWorkspace(membership.role);
  const canDelete = await canDeleteUnit(unit.id);
  const isArchived = !!unit.archivedAt;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Companies", href: "/app/management-companies" },
          { label: unit.building.managementCompany.name, href: `/app/management-companies/${unit.building.managementCompanyId}` },
          { label: unit.building.name, href: `/app/buildings/${unit.buildingId}` },
          { label: unit.identifier }
        ]}
      />
      <PageHeader
        title={unit.identifier}
        subtitle={unit.building.name}
        isArchived={isArchived}
        entityName="Unit"
        entityId={unit.id}
        showActions={canEdit}
        redirectAfterDelete={`/app/buildings/${unit.buildingId}`}
        actions={[
          { type: "archive", action: archiveUnitAction },
          { type: "restore", action: restoreUnitAction },
          {
            type: "delete",
            action: deleteUnitAction,
            disabled: !canDelete,
            disabledReason: "Has related records"
          }
        ]}
      />

      {/* QR Code Section */}
      <Card>
        <CardContent className="pt-6">
          <UnitQRCode unitId={unit.id} unitIdentifier={unit.identifier} />
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardContent className="pt-6">
          <DocumentUpload 
            unitId={unit.id} 
            documents={unit.documents} 
            canEdit={canEdit && !isArchived}
          />
        </CardContent>
      </Card>

      {/* Location & Unit Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-ink/60 mb-2">Location</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-ink/50">Company: </span>
                  <Link
                    href={`/app/management-companies/${unit.building.managementCompanyId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {unit.building.managementCompany.name}
                  </Link>
                </div>
                <div>
                  <span className="text-ink/50">Building: </span>
                  <Link
                    href={`/app/buildings/${unit.buildingId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {unit.building.name}
                  </Link>
                </div>
                <div>
                  <span className="text-ink/50">Address: </span>
                  <span className="text-ink">{unit.building.address}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink/60 mb-2">Unit Info</h3>
              <div className="space-y-1 text-sm">
                {unit.unitCategory && (
                  <div>
                    <span className="text-ink/50">Type: </span>
                    <span className="font-medium text-ink">{unit.unitCategory.name}</span>
                  </div>
                )}
                {unit.unitStatus && (
                  <div>
                    <span className="text-ink/50">Status: </span>
                    <span className="font-medium text-ink">{unit.unitStatus.name}</span>
                  </div>
                )}
                {unit.brand && (
                  <div>
                    <span className="text-ink/50">Brand: </span>
                    <span className="text-ink">{unit.brand.name}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {unit.isActive ? (
                    <span className="rounded-full bg-pine/10 px-2 py-0.5 text-xs font-medium text-pine">Active</span>
                  ) : (
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink/60">Inactive</span>
                  )}
                  {unit.underContract && (
                    <span className="rounded-full bg-ember/10 px-2 py-0.5 text-xs font-medium text-ember">Under Contract</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink/60 mb-4">Edit Details</h3>
          <UnitForm
            unitId={unit.id}
            buildingId={unit.buildingId}
            categories={categories}
            statuses={statuses}
            equipmentTypes={equipmentTypes}
            brands={brands}
            readOnly={!canEdit || isArchived}
            initialValues={{
              identifier: unit.identifier,
              unitCategoryId: unit.unitCategoryId,
              unitStatusId: unit.unitStatusId,
              equipmentTypeId: unit.equipmentTypeId,
              brandId: unit.brandId,
              description: unit.description ?? "",
              serialNumber: unit.serialNumber ?? "",
              underContract: unit.underContract,
              isActive: unit.isActive,
              agreementStartDate: unit.agreementStartDate
                ? unit.agreementStartDate.toISOString().slice(0, 10)
                : "",
              agreementEndDate: unit.agreementEndDate
                ? unit.agreementEndDate.toISOString().slice(0, 10)
                : "",
              phoneLineService: unit.phoneLineService,
              folderUrl: unit.folderUrl ?? "",
              landings: unit.landings ?? undefined,
              capacity: unit.capacity ?? undefined,
              floorLocation: unit.floorLocation ?? undefined,
              machineRoomLocation: unit.machineRoomLocation ?? "",
              buildingNumber: unit.buildingNumber ?? "",
              certificateUrl: unit.certificateUrl ?? "",
              photoUrl: unit.photoUrl ?? "",
              notes: unit.notes ?? ""
            }}
          />
        </CardContent>
      </Card>

      {/* Service Timeline */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink/60 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Service Timeline
          </h3>
          
          {(unit.inspections.length === 0 && unit.maintenances.length === 0 && unit.emergencyCalls.length === 0) ? (
            <p className="text-sm text-ink/50 text-center py-8">No service history yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Combine and sort all events */}
              {[
                ...unit.inspections.map(i => ({
                  type: "inspection" as const,
                  date: i.inspectionDate,
                  data: i,
                })),
                ...unit.maintenances.map(m => ({
                  type: "maintenance" as const,
                  date: m.maintenanceDate,
                  data: m,
                })),
                ...unit.emergencyCalls.map(e => ({
                  type: "emergency" as const,
                  date: e.callInAt,
                  data: e,
                })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((event, index) => (
                  <div
                    key={`${event.type}-${index}`}
                    className={`flex items-start gap-4 p-3 rounded-lg border-l-4 ${
                      event.type === "inspection"
                        ? "border-l-brand-500 bg-brand-50/50"
                        : event.type === "maintenance"
                        ? "border-l-success-500 bg-success-50/50"
                        : "border-l-danger-500 bg-danger-50/50"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      event.type === "inspection"
                        ? "bg-brand-100"
                        : event.type === "maintenance"
                        ? "bg-success-100"
                        : "bg-danger-100"
                    }`}>
                      {event.type === "inspection" ? (
                        <Calendar className="h-4 w-4 text-brand-600" />
                      ) : event.type === "maintenance" ? (
                        <Wrench className="h-4 w-4 text-success-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-danger-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink">
                          {event.type === "inspection" && (
                            <>
                              Inspection
                              {event.data.inspectionResult && (
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                  event.data.inspectionResult.name.toLowerCase().includes("passed")
                                    ? "bg-success-100 text-success-700"
                                    : "bg-warning-100 text-warning-700"
                                }`}>
                                  {event.data.inspectionResult.name}
                                </span>
                              )}
                            </>
                          )}
                          {event.type === "maintenance" && (
                            <>
                              Maintenance
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                event.data.status === "COMPLETED"
                                  ? "bg-success-100 text-success-700"
                                  : "bg-brand-100 text-brand-700"
                              }`}>
                                {event.data.status}
                              </span>
                            </>
                          )}
                          {event.type === "emergency" && (
                            <>
                              Emergency Call
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-danger-100 text-danger-700">
                                {event.data.emergencyCallStatus?.name}
                              </span>
                            </>
                          )}
                        </p>
                        <time className="text-xs text-ink/50">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                      
                      {event.type === "inspection" && event.data.inspector && (
                        <p className="text-xs text-ink/60 mt-1">
                          Inspector: {event.data.inspector.firstName} {event.data.inspector.lastName}
                        </p>
                      )}
                      {event.type === "maintenance" && event.data.mechanic && (
                        <p className="text-xs text-ink/60 mt-1">
                          Mechanic: {event.data.mechanic.firstName} {event.data.mechanic.lastName}
                        </p>
                      )}
                      {event.type === "emergency" && (
                        <p className="text-xs text-ink/60 mt-1 line-clamp-2">
                          {event.data.issueDescription}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
