import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import CategoryForm from "../category-form";

type ContactCategoryPageProps = {
  params: { id: string };
};

export default async function ContactCategoryPage({
  params
}: ContactCategoryPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const category = await db.contactCategory.findUnique({
    where: { id: params.id }
  });

  if (!category || category.companyId !== membership.companyId) {
    redirect("/app/contact-categories");
  }

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Category details</CardTitle>
          <CardDescription>Edit name and description.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm
            categoryId={category.id}
            readOnly={!canEdit}
            initialValues={{
              name: category.name,
              description: category.description ?? ""
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
