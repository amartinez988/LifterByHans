import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArchiveFilter } from "@/components/ui/archive-filter";
import { SearchInput } from "@/components/ui/search-input";
import { getArchiveWhereClause } from "@/lib/archive";
import { getSearchFilter } from "@/lib/search";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type PageProps = {
  searchParams: Promise<{ filter?: string; q?: string }>;
};

export default async function ContactsPage({ searchParams }: PageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const archiveFilter = getArchiveWhereClause(params.filter);
  const searchFilter = getSearchFilter(params.q, ["firstName", "lastName", "email", "phone", "notes"]);

  const contacts = await db.contact.findMany({
    where: {
      companyId: membership.companyId,
      ...archiveFilter,
      ...searchFilter
    },
    include: {
      managementCompany: true,
      contactCategory: true
    },
    orderBy: { createdAt: "desc" }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Contacts</p>
          <h2 className="font-display text-3xl text-ink">People & roles</h2>
          <p className="text-sm text-ink/70">Contacts across all management firms.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <SearchInput placeholder="Search contacts..." />
          </Suspense>
          <Suspense fallback={null}>
            <ArchiveFilter />
          </Suspense>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/app/contacts/new">Add contact</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {contacts.length === 0 ? (
          <Card className="text-sm text-ink/70">
            {params.q ? `No contacts matching "${params.q}"` : "No contacts found."}
          </Card>
        ) : (
          contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/app/contacts/${contact.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {contact.firstName} {contact.lastName}
                    {contact.archivedAt && (
                      <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal text-ink/60">
                        Archived
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/60">
                    {contact.contactCategory.name} - {contact.managementCompany.name}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
                  {contact.isPrimary ? "Primary" : "View"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
