import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import JobForm from "../job-form";

export default async function NewJobPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app/jobs");
  }

  const [managementCompanies, buildings, units, mechanics] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.building.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, managementCompanyId: true }
    }),
    db.unit.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      orderBy: { identifier: "asc" },
      select: { id: true, identifier: true, buildingId: true }
    }),
    db.mechanic.findMany({
      where: { companyId: membership.companyId, isActive: true },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true }
    })
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Jobs", href: "/app/jobs" },
          { label: "New Job" }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>New job</CardTitle>
          <CardDescription>Schedule a new service job.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm
            managementCompanies={managementCompanies}
            buildings={buildings}
            units={units}
            mechanics={mechanics}
          />
        </CardContent>
      </Card>
    </div>
  );
}
