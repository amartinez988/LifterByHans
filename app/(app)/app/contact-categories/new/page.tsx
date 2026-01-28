import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import CategoryForm from "../category-form";

export default async function NewContactCategoryPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app/contact-categories");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>New contact category</CardTitle>
          <CardDescription>Label contact roles or departments.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
