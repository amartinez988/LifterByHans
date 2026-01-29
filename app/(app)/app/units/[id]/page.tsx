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
      }
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

      <Card>
        <CardContent className="pt-6">
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
