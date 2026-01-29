import Link from "next/link";
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
    where: { id },
    include: {
      managementCompany: true,
      contactCategory: true
    }
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

      {/* Contact Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-ink/60 mb-2">Organization</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-ink/50">Company: </span>
                  <Link
                    href={`/app/management-companies/${contact.managementCompanyId}`}
                    className="font-medium text-ink hover:text-pine hover:underline transition"
                  >
                    {contact.managementCompany.name}
                  </Link>
                </div>
                <div>
                  <span className="text-ink/50">Role: </span>
                  <span className="font-medium text-ink">{contact.contactCategory.name}</span>
                </div>
                {contact.isPrimary && (
                  <div>
                    <span className="rounded-full bg-pine/10 px-2 py-0.5 text-xs font-medium text-pine">
                      Primary Contact
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink/60 mb-2">Contact Info</h3>
              <div className="space-y-1 text-sm">
                {contact.email && (
                  <div>
                    <span className="text-ink/50">Email: </span>
                    <a href={`mailto:${contact.email}`} className="text-ink hover:text-pine hover:underline transition">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div>
                    <span className="text-ink/50">Phone: </span>
                    <a href={`tel:${contact.phone}`} className="text-ink hover:text-pine hover:underline transition">
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink/60 mb-4">Edit Details</h3>
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
