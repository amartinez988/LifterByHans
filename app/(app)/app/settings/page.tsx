import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import { ImportJobs } from "./import-jobs";

export default async function SettingsPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app");
  }

  // Get lookup data for validation reference
  const [managementCompanies, buildings, units, mechanics] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true }
    }),
    db.building.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true, managementCompanyId: true }
    }),
    db.unit.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, identifier: true, buildingId: true }
    }),
    db.mechanic.findMany({
      where: { companyId: membership.companyId, isActive: true },
      select: { id: true, firstName: true, lastName: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Settings</p>
        <h2 className="font-display text-3xl text-ink">Workspace settings</h2>
        <p className="text-sm text-ink/70">Manage imports, exports, and configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Jobs</CardTitle>
          <CardDescription>
            Bulk import scheduled jobs from a CSV file. Download the template, fill in your data, and upload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportJobs
            managementCompanies={managementCompanies}
            buildings={buildings}
            units={units}
            mechanics={mechanics}
          />
        </CardContent>
      </Card>

      {/* Future settings sections */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Export your workspace data. Coming soon.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
