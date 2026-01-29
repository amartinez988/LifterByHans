import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import MechanicForm from "../mechanic-form";

type MechanicPageProps = {
  params: { id: string };
};

export default async function MechanicPage({ params }: MechanicPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const mechanic = await db.mechanic.findUnique({
    where: { id: params.id }
  });

  if (!mechanic || mechanic.companyId !== membership.companyId) {
    redirect("/app/mechanics");
  }

  const levels = await db.mechanicLevel.findMany({
    where: { companyId: membership.companyId },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Mechanics", href: "/app/mechanics" },
          { label: `${mechanic.firstName} ${mechanic.lastName}` }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Mechanic profile</CardTitle>
          <CardDescription>Update mechanic details.</CardDescription>
        </CardHeader>
        <CardContent>
          <MechanicForm
            mechanicId={mechanic.id}
            readOnly={!canEdit}
            levels={levels}
            initialValues={{
              mechanicLevelId: mechanic.mechanicLevelId ?? "",
              firstName: mechanic.firstName,
              lastName: mechanic.lastName,
              email: mechanic.email ?? "",
              phone: mechanic.phone ?? "",
              isActive: mechanic.isActive
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
