import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import MaintenanceForm from "../maintenance-form";
import {
  archiveMaintenanceAction,
  restoreMaintenanceAction
} from "../actions";

type MaintenancePageProps = {
  params: Promise<{ id: string }>;
};

export default async function MaintenanceDetailPage({ params }: MaintenancePageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const maintenance = await db.maintenance.findUnique({
    where: { id },
    include: {
      managementCompany: true,
      building: true,
      unit: true
    }
  });

  if (!maintenance || maintenance.companyId !== membership.companyId) {
    redirect("/app/maintenance");
  }

  const [managementCompanies, buildings, units, mechanics] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.building.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, managementCompanyId: true }
    }),
    db.unit.findMany({
      where: { companyId: membership.companyId },
      orderBy: { identifier: "asc" },
      select: { id: true, identifier: true, buildingId: true }
    }),
    db.mechanic.findMany({
      where: { companyId: membership.companyId, isActive: true },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true }
    })
  ]);

  const canEdit = canEditWorkspace(membership.role);
  const isArchived = !!maintenance.archivedAt;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={`Maintenance ${maintenance.maintenanceCode}`}
        subtitle={`${maintenance.managementCompany.name} - ${maintenance.building.name} - ${maintenance.unit.identifier}`}
        isArchived={isArchived}
        entityName="Maintenance"
        entityId={maintenance.id}
        showActions={canEdit}
        actions={[
          { type: "archive", action: archiveMaintenanceAction },
          { type: "restore", action: restoreMaintenanceAction }
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <MaintenanceForm
            maintenanceId={maintenance.id}
            managementCompanies={managementCompanies}
            buildings={buildings}
            units={units}
            mechanics={mechanics}
            readOnly={!canEdit || isArchived}
            initialValues={{
              managementCompanyId: maintenance.managementCompanyId,
              buildingId: maintenance.buildingId,
              unitId: maintenance.unitId,
              mechanicId: maintenance.mechanicId ?? "",
              status: maintenance.status,
              maintenanceDate: maintenance.maintenanceDate.toISOString().slice(0, 10),
              notes: maintenance.notes ?? ""
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
