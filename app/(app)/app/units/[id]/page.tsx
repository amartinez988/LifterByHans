import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
      equipmentType: true
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
    </div>
  );
}
