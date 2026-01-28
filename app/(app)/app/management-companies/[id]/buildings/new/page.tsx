import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import BuildingForm from "@/app/(app)/app/buildings/building-form";

type NewBuildingPageProps = {
  params: { id: string };
};

export default async function NewBuildingPage({ params }: NewBuildingPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect(`/app/management-companies/${params.id}`);
  }

  const managementCompany = await db.managementCompany.findUnique({
    where: { id: params.id }
  });

  if (!managementCompany || managementCompany.companyId !== membership.companyId) {
    redirect("/app/management-companies");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>New building</CardTitle>
          <CardDescription>
            Add a building for {managementCompany.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BuildingForm managementCompanyId={managementCompany.id} />
        </CardContent>
      </Card>
    </div>
  );
}
