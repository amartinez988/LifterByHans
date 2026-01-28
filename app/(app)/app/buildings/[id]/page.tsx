import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import BuildingForm from "../building-form";
import {
  archiveBuildingAction,
  restoreBuildingAction,
  deleteBuildingAction,
  canDeleteBuilding
} from "../actions";

type BuildingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuildingPage({ params }: BuildingPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const building = await db.building.findUnique({
    where: { id },
    include: {
      managementCompany: true,
      units: {
        include: {
          unitCategory: true,
          unitStatus: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!building || building.companyId !== membership.companyId) {
    redirect("/app/management-companies");
  }

  const canEdit = canEditWorkspace(membership.role);
  const canDelete = await canDeleteBuilding(building.id);
  const unitCount = building.units.length;
  const isArchived = !!building.archivedAt;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title={building.name}
          subtitle={building.address}
          isArchived={isArchived}
          entityName="Building"
          entityId={building.id}
          showActions={canEdit}
          redirectAfterDelete={`/app/management-companies/${building.managementCompanyId}`}
          actions={[
            {
              type: "archive",
              action: archiveBuildingAction,
              cascadeMessage: unitCount > 0 ? `Archiving this building will also archive ${unitCount} unit${unitCount === 1 ? '' : 's'}.` : undefined
            },
            { type: "restore", action: restoreBuildingAction },
            {
              type: "delete",
              action: deleteBuildingAction,
              disabled: !canDelete,
              disabledReason: "Has units"
            }
          ]}
        />
        {canEdit && !isArchived ? (
          <Button asChild size="sm">
            <Link href={`/app/buildings/${building.id}/units/new`}>Add unit</Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Building details</CardTitle>
          <CardDescription>Update building information.</CardDescription>
        </CardHeader>
        <CardContent>
          <BuildingForm
            buildingId={building.id}
            managementCompanyId={building.managementCompanyId}
            readOnly={!canEdit || isArchived}
            initialValues={{
              name: building.name,
              address: building.address,
              localPhone: building.localPhone ?? "",
              jurisdiction: building.jurisdiction ?? "",
              notes: building.notes ?? ""
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
          <CardDescription>
            {building.units.length} units in this building.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {building.units.length === 0 ? (
            <p className="text-sm text-ink/60">No units yet.</p>
          ) : (
            building.units.map((unit) => (
              <Link
                key={unit.id}
                href={`/app/units/${unit.id}`}
                className="rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-ink/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {unit.identifier}
                      {unit.archivedAt && (
                        <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                          Archived
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink/60">
                      {unit.unitCategory.name} - {unit.unitStatus.name}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
                    View
                  </span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
