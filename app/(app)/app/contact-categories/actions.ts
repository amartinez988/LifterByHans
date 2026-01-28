"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { contactCategorySchema } from "@/lib/validators";

export type ContactCategoryActionState = {
  error?: string;
};

export async function createContactCategoryAction(
  values: unknown
): Promise<{ error?: string; category?: { id: string; name: string } }> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create categories." };
  }

  const parsed = contactCategorySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  try {
    const category = await db.contactCategory.create({
      data: {
        companyId: membership.companyId,
        name: parsed.data.name,
        description: parsed.data.description || null
      }
    });

    return { category: { id: category.id, name: category.name } };
  } catch (error) {
    return { error: "Unable to create category. Check for duplicates." };
  }
}

export async function createContactCategoryRedirectAction(values: unknown) {
  const result = await createContactCategoryAction(values);
  if (result.error || !result.category) {
    return result;
  }
  redirect(`/app/contact-categories/${result.category.id}`);
}

export async function updateContactCategoryAction(
  id: string,
  values: unknown
): Promise<ContactCategoryActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update categories." };
  }

  const parsed = contactCategorySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.contactCategory.findUnique({ where: { id } });
  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Category not found." };
  }

  try {
    await db.contactCategory.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null
      }
    });
  } catch (error) {
    return { error: "Unable to update category. Check for duplicates." };
  }

  return {};
}
