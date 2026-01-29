import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import InspectionForm from "../inspection-form";

export default async function NewInspectionPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Inspections", href: "/app/inspections" },
          { label: "New Inspection" }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>New inspection</CardTitle>
          <CardDescription>Create a new inspection record.</CardDescription>
        </CardHeader>
        <CardContent>
          <InspectionForm
            managementCompanies={managementCompanies}
            buildings={buildings}
            units={units}
            inspectors={inspectorOptions}
            statuses={statuses}
            results={results}
          />
        </CardContent>
      </Card>
    </div>
  );
}
