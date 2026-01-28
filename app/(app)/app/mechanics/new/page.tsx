import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import MechanicForm from "../mechanic-form";

export default async function NewMechanicPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app/mechanics");
  }

  const levels = await db.mechanicLevel.findMany({
    where: { companyId: membership.companyId },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>New mechanic</CardTitle>
          <CardDescription>Add a technician to your team.</CardDescription>
        </CardHeader>
        <CardContent>
          <MechanicForm levels={levels} />
        </CardContent>
      </Card>
    </div>
  );
}
