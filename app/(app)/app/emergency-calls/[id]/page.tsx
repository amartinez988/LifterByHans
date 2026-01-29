import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import EmergencyCallForm from "../emergency-call-form";
import {
  archiveEmergencyCallAction,
  restoreEmergencyCallAction
} from "../actions";

type EmergencyCallPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmergencyCallDetailPage({
  params
}: EmergencyCallPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const emergencyCall = await db.emergencyCall.findUnique({
    where: { id },
    include: {
      managementCompany: true,
      building: true,
      unit: true,
      emergencyCallStatus: true
    }
  });

  if (!emergencyCall || emergencyCall.companyId !== membership.companyId) {
    redirect("/app/emergency-calls");
  }

  const [managementCompanies, buildings, units, mechanics, statuses] =
    await Promise.all([
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
      }),
      db.emergencyCallStatus.findMany({
        where: { companyId: membership.companyId },
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      })
    ]);

  const canEdit = canEditWorkspace(membership.role);
  const isArchived = !!emergencyCall.archivedAt;

  const formatDateTime = (value: Date | null) =>
    value ? new Date(value).toISOString().slice(0, 16) : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Emergency Calls", href: "/app/emergency-calls" },
          { label: emergencyCall.emergencyCode }
        ]}
      />
      <PageHeader
        title={`Emergency ${emergencyCall.emergencyCode}`}
        subtitle={`${emergencyCall.managementCompany.name} - ${emergencyCall.building.name} - ${emergencyCall.unit.identifier}`}
        isArchived={isArchived}
        entityName="Emergency Call"
        entityId={emergencyCall.id}
        showActions={canEdit}
        actions={[
          { type: "archive", action: archiveEmergencyCallAction },
          { type: "restore", action: restoreEmergencyCallAction }
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <EmergencyCallForm
            emergencyId={emergencyCall.id}
            managementCompanies={managementCompanies}
            buildings={buildings}
            units={units}
            mechanics={mechanics}
            statuses={statuses}
            readOnly={!canEdit || isArchived}
            initialValues={{
              managementCompanyId: emergencyCall.managementCompanyId,
              buildingId: emergencyCall.buildingId,
              unitId: emergencyCall.unitId,
              mechanicId: emergencyCall.mechanicId ?? "",
              emergencyCallStatusId: emergencyCall.emergencyCallStatusId,
              callInAt: formatDateTime(emergencyCall.callInAt),
              completedAt: formatDateTime(emergencyCall.completedAt),
              ticketNumber: emergencyCall.ticketNumber ?? "",
              issueDescription: emergencyCall.issueDescription,
              notes: emergencyCall.notes ?? ""
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
