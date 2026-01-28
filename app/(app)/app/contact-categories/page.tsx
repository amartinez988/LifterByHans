import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

export default async function ContactCategoriesPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const categories = await db.contactCategory.findMany({
    where: { companyId: membership.companyId },
    orderBy: { name: "asc" }
  });

  const canEdit = canEditWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Contact categories
          </p>
          <h2 className="font-display text-3xl text-ink">Roles & functions</h2>
          <p className="text-sm text-ink/70">Tag contacts by responsibility.</p>
        </div>
        {canEdit ? (
          <Button asChild size="sm">
            <Link href="/app/contact-categories/new">Add category</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card className="text-sm text-ink/70">No categories yet.</Card>
        ) : (
          categories.map((category) => (
            <Link
              key={category.id}
              href={`/app/contact-categories/${category.id}`}
              className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft transition hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{category.name}</p>
                  <p className="text-xs text-ink/60">
                    {category.description || "No description"}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
                  View
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
