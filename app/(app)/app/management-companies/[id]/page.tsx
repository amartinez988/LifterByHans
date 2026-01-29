import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import ContactForm from "../../contacts/contact-form";
import CompanyForm from "../company-form";
import AddExistingContactForm from "../add-existing-contact-form";
import {
  archiveManagementCompanyAction,
  restoreManagementCompanyAction,
  deleteManagementCompanyAction,
  canDeleteManagementCompany
} from "../actions";

type ManagementCompanyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ManagementCompanyPage({
  params
}: ManagementCompanyPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const company = await db.managementCompany.findUnique({
    where: { id },
    include: {
      contacts: { include: { contactCategory: true }, orderBy: { createdAt: "asc" } }
    }
  });

  if (!company || company.companyId !== membership.companyId) {
    redirect("/app/management-companies");
  }

  const categories = await db.contactCategory.findMany({
    where: { companyId: membership.companyId },
    orderBy: { name: "asc" }
  });

  const buildings = await db.building.findMany({
    where: { managementCompanyId: company.id },
    orderBy: { createdAt: "desc" }
  });

  const unassignedContacts = await db.contact.findMany({
    where: {
      companyId: membership.companyId,
      NOT: { managementCompanyId: company.id }
    },
    orderBy: { createdAt: "desc" }
  });

  const managementCompanies = await db.managementCompany.findMany({
    where: { companyId: membership.companyId },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  const canEdit = canEditWorkspace(membership.role);
  const canDelete = await canDeleteManagementCompany(company.id);
  const isArchived = !!company.archivedAt;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Companies", href: "/app/management-companies" },
          { label: company.name }
        ]}
      />
      <PageHeader
        title={company.name}
        subtitle="Manage details and contacts."
        isArchived={isArchived}
        entityName="Management Company"
        entityId={company.id}
        showActions={canEdit}
        redirectAfterDelete="/app/management-companies"
        actions={[
          { type: "archive", action: archiveManagementCompanyAction },
          { type: "restore", action: restoreManagementCompanyAction },
          {
            type: "delete",
            action: deleteManagementCompanyAction,
            disabled: !canDelete,
            disabledReason: "Has buildings"
          }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Company details</CardTitle>
          <CardDescription>Update company profile and contact info.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm
            companyId={company.id}
            readOnly={!canEdit || isArchived}
            initialValues={{
              name: company.name,
              accountNumber: company.accountNumber || "",
              website: company.website || "",
              mainPhone: company.mainPhone || "",
              emergencyPhone: company.emergencyPhone || "",
              notes: company.notes || ""
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buildings</CardTitle>
          <CardDescription>Buildings managed by this company.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {buildings.length === 0 ? (
            <p className="text-sm text-ink/60">No buildings yet.</p>
          ) : (
            buildings.map((building) => (
              <Link
                key={building.id}
                href={`/app/buildings/${building.id}`}
                className="rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-ink/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {building.name}
                      {building.archivedAt && (
                        <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                          Archived
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink/60">{building.address}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
                    View
                  </span>
                </div>
              </Link>
            ))
          )}
          {canEdit ? (
            <Button asChild size="sm">
              <Link href={`/app/management-companies/${company.id}/buildings/new`}>
                Add building
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>Linked contacts for this management company.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company.contacts.length === 0 ? (
            <p className="text-sm text-ink/60">No contacts yet.</p>
          ) : (
            company.contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-sm text-ink/60">{contact.contactCategory.name}</p>
                  <p className="text-xs text-ink/60">
                    {contact.email || "No email"} - {contact.phone || "No phone"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.3em] text-ink/50">
                    {contact.isPrimary ? "Primary" : "Secondary"}
                  </span>
                  <Link
                    className="text-xs uppercase tracking-[0.3em] text-ink/60 hover:text-ink"
                    href={`/app/contacts/${contact.id}`}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>Create contact</CardTitle>
            <CardDescription>Add a contact directly to this company.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm
              fixedManagementCompanyId={company.id}
              managementCompanies={managementCompanies}
              categories={categories}
              stayOnSubmit
            />
          </CardContent>
        </Card>
      ) : null}

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>Add existing contact</CardTitle>
            <CardDescription>Move a contact from another company.</CardDescription>
          </CardHeader>
          <CardContent>
            {unassignedContacts.length === 0 ? (
              <p className="text-sm text-ink/60">No other contacts available.</p>
            ) : (
              <AddExistingContactForm
                companyId={company.id}
                contacts={unassignedContacts}
              />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
