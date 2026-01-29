import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import InspectionForm from "../inspection-form";
import {
  archiveInspectionAction,
  restoreInspectionAction
} from "../actions";

type InspectionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InspectionDetailPage({ params }: InspectionPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const inspection = await db.inspection.findUnique({
    where: { id },
    include: {
      managementCompany: true,
      building: true,
      unit: true,
      inspector: true,
      inspectionStatus: true,
      inspectionResult: true
    }
  });

  if (!inspection || inspection.companyId !== membership.companyId) {
    redirect("/app/inspections");
  }

  const [managementCompanies, buildings, units, inspectors, statuses, results] =
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
      db.inspector.findMany({
        where: { companyId: membership.companyId, isActive: true },
        orderBy: { lastName: "asc" },
        select: { id: true, firstName: true, lastName: true }
      }),
      db.inspectionStatus.findMany({
        where: { companyId: membership.companyId },
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      }),
      db.inspectionResult.findMany({
        where: { companyId: membership.companyId },
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      })
    ]);

  const inspectorOptions = inspectors.map((inspector) => ({
    id: inspector.id,
    name: `${inspector.firstName} ${inspector.lastName}`
  }));

  const canEdit = canEditWorkspace(membership.role);
  const isArchived = !!inspection.archivedAt;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Inspections", href: "/app/inspections" },
          { label: inspection.inspectionCode }
        ]}
      />
      <PageHeader
        title={`Inspection ${inspection.inspectionCode}`}
        subtitle={`${inspection.managementCompany.name} - ${inspection.building.name} - ${inspection.unit.identifier}`}
        isArchived={isArchived}
        entityName="Inspection"
        entityId={inspection.id}
        showActions={canEdit}
        actions={[
          { type: "archive", action: archiveInspectionAction },
          { type: "restore", action: restoreInspectionAction }
        ]}
      />

      {/* Location & Inspection Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-ink/60 mb-2">Location</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-ink/50">Company: </span>
                  <Link
                    href={`/app/management-companies/${inspection.managementCompanyId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {inspection.managementCompany.name}
                  </Link>
                </div>
                <div>
                  <span className="text-ink/50">Building: </span>
                  <Link
                    href={`/app/buildings/${inspection.buildingId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {inspection.building.name}
                  </Link>
                </div>
                <div>
                  <span className="text-ink/50">Unit: </span>
                  <Link
                    href={`/app/units/${inspection.unitId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {inspection.unit.identifier}
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink/60 mb-2">Inspection Details</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-ink/50">Inspector: </span>
                  {inspection.inspector ? (
                    <Link
                      href={`/app/inspectors/${inspection.inspector.id}`}
                      className="font-medium text-ink hover:text-pine hover:underline transition"
                    >
                      {inspection.inspector.firstName} {inspection.inspector.lastName}
                    </Link>
                  ) : (
                    <span className="text-ink/40">Not assigned</span>
                  )}
                </div>
                <div>
                  <span className="text-ink/50">Status: </span>
                  <span className="font-medium text-ink">{inspection.inspectionStatus.name}</span>
                </div>
                {inspection.inspectionResult && (
                  <div>
                    <span className="text-ink/50">Result: </span>
                    <span className="font-medium text-ink">{inspection.inspectionResult.name}</span>
                  </div>
                )}
                <div>
                  <span className="text-ink/50">Date: </span>
                  <span className="text-ink">{new Date(inspection.inspectionDate).toLocaleDateString()}</span>
                </div>
                {inspection.expirationDate && (
                  <div>
                    <span className="text-ink/50">Expires: </span>
                    <span className="text-ink">{new Date(inspection.expirationDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink/60 mb-4">Edit Details</h3>
          <InspectionForm
            inspectionId={inspection.id}
            managementCompanies={managementCompanies}
            buildings={buildings}
            units={units}
            inspectors={inspectorOptions}
            statuses={statuses}
            results={results}
            readOnly={!canEdit || isArchived}
            initialValues={{
              managementCompanyId: inspection.managementCompanyId,
              buildingId: inspection.buildingId,
              unitId: inspection.unitId,
              inspectorId: inspection.inspectorId ?? "",
              inspectionStatusId: inspection.inspectionStatusId,
              inspectionResultId: inspection.inspectionResultId ?? "",
              inspectionDate: inspection.inspectionDate.toISOString().slice(0, 10),
              expirationDate: inspection.expirationDate
                ? inspection.expirationDate.toISOString().slice(0, 10)
                : "",
              reportUrl: inspection.reportUrl ?? "",
              notes: inspection.notes ?? ""
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
