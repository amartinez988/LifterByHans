import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import ContactForm from "../contact-form";
import {
  archiveContactAction,
  restoreContactAction,
  deleteContactAction
} from "../actions";

type ContactPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const contact = await db.contact.findUnique({
    where: { id }
  });

  if (!contact || contact.companyId !== membership.companyId) {
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

  const canEdit = canEditWorkspace(membership.role);
  const isArchived = !!contact.archivedAt;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Contacts", href: "/app/contacts" },
          { label: `${contact.firstName} ${contact.lastName}` }
        ]}
      />
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle="Review and update contact details."
        isArchived={isArchived}
        entityName="Contact"
        entityId={contact.id}
        showActions={canEdit}
        redirectAfterDelete="/app/contacts"
        actions={[
          { type: "archive", action: archiveContactAction },
          { type: "restore", action: restoreContactAction },
          { type: "delete", action: deleteContactAction, disabled: false }
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <ContactForm
            contactId={contact.id}
            managementCompanies={managementCompanies}
            categories={categories}
            readOnly={!canEdit || isArchived}
            initialValues={{
              managementCompanyId: contact.managementCompanyId,
              contactCategoryId: contact.contactCategoryId,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email ?? "",
              phone: contact.phone ?? "",
              isPrimary: contact.isPrimary,
              notes: contact.notes ?? ""
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
