import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import CompanyForm from "../company-form";

export default async function NewManagementCompanyPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app/management-companies");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>New management company</CardTitle>
          <CardDescription>Start a profile for a property manager.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm />
        </CardContent>
      </Card>
    </div>
  );
}
