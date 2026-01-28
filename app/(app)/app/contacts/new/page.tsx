import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import ContactForm from "../contact-form";

export default async function NewContactPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app/contacts");
  }

  const [managementCompanies, categories] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.contactCategory.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  if (managementCompanies.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Add a management company first</CardTitle>
            <CardDescription>
              Contacts must be linked to a management company.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/app/management-companies/new">Create company</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>New contact</CardTitle>
          <CardDescription>Add a new contact to your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm
            managementCompanies={managementCompanies}
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
