import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import InspectorForm from "../inspector-form";

type InspectorPageProps = {
  params: { id: string };
};

export default async function InspectorPage({ params }: InspectorPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const inspector = await db.inspector.findUnique({
    where: { id: params.id }
  });

  if (!inspector || inspector.companyId !== membership.companyId) {
    redirect("/app/inspectors");
  }

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Inspectors", href: "/app/inspectors" },
          { label: `${inspector.firstName} ${inspector.lastName}` }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Inspector profile</CardTitle>
          <CardDescription>Update inspector details.</CardDescription>
        </CardHeader>
        <CardContent>
          <InspectorForm
            inspectorId={inspector.id}
            readOnly={!canEdit}
            initialValues={{
              firstName: inspector.firstName,
              lastName: inspector.lastName,
              companyName: inspector.companyName ?? "",
              email: inspector.email ?? "",
              phone: inspector.phone ?? "",
              isActive: inspector.isActive
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
