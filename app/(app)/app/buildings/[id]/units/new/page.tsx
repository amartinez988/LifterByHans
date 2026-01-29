import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import UnitForm from "@/app/(app)/app/units/unit-form";

type NewUnitPageProps = {
  params: { id: string };
};

export default async function NewUnitPage({ params }: NewUnitPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect(`/app/buildings/${params.id}`);
  }

  const building = await db.building.findUnique({
    where: { id: params.id },
    include: { managementCompany: true }
  });

  if (!building || building.companyId !== membership.companyId) {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Companies", href: "/app/management-companies" },
          { label: building.managementCompany.name, href: `/app/management-companies/${building.managementCompanyId}` },
          { label: building.name, href: `/app/buildings/${building.id}` },
          { label: "New Unit" }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>New unit</CardTitle>
          <CardDescription>
            Add a unit to {building.name}. Create lookup values inline as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnitForm
            buildingId={building.id}
            categories={categories}
            statuses={statuses}
            equipmentTypes={equipmentTypes}
            brands={brands}
          />
        </CardContent>
      </Card>
    </div>
  );
}
