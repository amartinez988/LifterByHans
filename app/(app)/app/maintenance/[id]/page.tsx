import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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
      unit: true,
      mechanic: true
    }
  });

  if (!maintenance || maintenance.companyId !== membership.companyId) {
    redirect("/app/maintenance");
  }

  const [managementCompanies, buildings, units, mechanics] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId, OR: [{ archivedAt: null }, { id: maintenance.managementCompanyId }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.building.findMany({
      where: { companyId: membership.companyId, OR: [{ archivedAt: null }, { id: maintenance.buildingId }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true, managementCompanyId: true }
    }),
    db.unit.findMany({
      where: { companyId: membership.companyId, OR: [{ archivedAt: null }, { id: maintenance.unitId }] },
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
      <Breadcrumbs
        items={[
          { label: "Maintenance", href: "/app/maintenance" },
          { label: maintenance.maintenanceCode }
        ]}
      />
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

      {/* Location & Assignment Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-ink/60 mb-2">Location</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-ink/50">Company: </span>
                  <Link
                    href={`/app/management-companies/${maintenance.managementCompanyId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {maintenance.managementCompany.name}
                  </Link>
                </div>
                <div>
                  <span className="text-ink/50">Building: </span>
                  <Link
                    href={`/app/buildings/${maintenance.buildingId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {maintenance.building.name}
                  </Link>
                </div>
                <div>
                  <span className="text-ink/50">Unit: </span>
                  <Link
                    href={`/app/units/${maintenance.unitId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {maintenance.unit.identifier}
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink/60 mb-2">Assignment</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-ink/50">Mechanic: </span>
                  {maintenance.mechanic ? (
                    <Link
                      href={`/app/mechanics/${maintenance.mechanic.id}`}
                      className="font-medium text-ink hover:text-pine hover:underline transition"
                    >
                      {maintenance.mechanic.firstName} {maintenance.mechanic.lastName}
                    </Link>
                  ) : (
                    <span className="text-ink/40">Unassigned</span>
                  )}
                </div>
                <div>
                  <span className="text-ink/50">Status: </span>
                  <span className="font-medium text-ink">{maintenance.status}</span>
                </div>
                <div>
                  <span className="text-ink/50">Date: </span>
                  <span className="text-ink">{new Date(maintenance.maintenanceDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink/60 mb-4">Edit Details</h3>
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
