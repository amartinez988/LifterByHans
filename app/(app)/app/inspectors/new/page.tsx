import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import InspectorForm from "../inspector-form";

export default async function NewInspectorPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app/inspectors");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Inspectors", href: "/app/inspectors" },
          { label: "New Inspector" }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>New inspector</CardTitle>
          <CardDescription>Add an inspector profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <InspectorForm />
        </CardContent>
      </Card>
    </div>
  );
}
