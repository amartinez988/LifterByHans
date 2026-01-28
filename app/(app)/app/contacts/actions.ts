"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { contactSchema } from "@/lib/validators";

export type ContactActionState = {
  error?: string;
};

export async function createContactAction(
  values: unknown
): Promise<ContactActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create contacts." };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const { managementCompanyId, contactCategoryId, isPrimary } = parsed.data;

  const [companyRecord, categoryRecord] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: managementCompanyId } }),
    db.contactCategory.findUnique({ where: { id: contactCategoryId } })
  ]);

  if (
    !companyRecord ||
    companyRecord.companyId !== membership.companyId ||
    !categoryRecord ||
    categoryRecord.companyId !== membership.companyId
  ) {
    return { error: "Invalid company or category selection." };
  }

  const created = await db.$transaction(async (tx) => {
    if (isPrimary) {
      await tx.contact.updateMany({
        where: { managementCompanyId },
        data: { isPrimary: false }
      });
    }

    return tx.contact.create({
      data: {
        companyId: membership.companyId,
        managementCompanyId,
        contactCategoryId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        isPrimary: Boolean(isPrimary),
        notes: parsed.data.notes || null
      }
    });
  });

  redirect(`/app/contacts/${created.id}`);
}

export async function createContactStayAction(
  values: unknown
): Promise<ContactActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create contacts." };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const { managementCompanyId, contactCategoryId, isPrimary } = parsed.data;

  const [companyRecord, categoryRecord] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: managementCompanyId } }),
    db.contactCategory.findUnique({ where: { id: contactCategoryId } })
  ]);

  if (
    !companyRecord ||
    companyRecord.companyId !== membership.companyId ||
    !categoryRecord ||
    categoryRecord.companyId !== membership.companyId
  ) {
    return { error: "Invalid company or category selection." };
  }

  await db.$transaction(async (tx) => {
    if (isPrimary) {
      await tx.contact.updateMany({
        where: { managementCompanyId },
        data: { isPrimary: false }
      });
    }

    await tx.contact.create({
      data: {
        companyId: membership.companyId,
        managementCompanyId,
        contactCategoryId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        isPrimary: Boolean(isPrimary),
        notes: parsed.data.notes || null
      }
    });
  });

  return {};
}

export async function updateContactAction(
  id: string,
  values: unknown
): Promise<ContactActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update contacts." };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.contact.findUnique({
    where: { id }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Contact not found." };
  }

  const { managementCompanyId, contactCategoryId, isPrimary } = parsed.data;

  const [companyRecord, categoryRecord] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: managementCompanyId } }),
    db.contactCategory.findUnique({ where: { id: contactCategoryId } })
  ]);

  if (
    !companyRecord ||
    companyRecord.companyId !== membership.companyId ||
    !categoryRecord ||
    categoryRecord.companyId !== membership.companyId
  ) {
    return { error: "Invalid company or category selection." };
  }

  await db.$transaction(async (tx) => {
    if (isPrimary) {
      await tx.contact.updateMany({
        where: { managementCompanyId },
        data: { isPrimary: false }
      });
    }

    await tx.contact.update({
      where: { id },
      data: {
        managementCompanyId,
        contactCategoryId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        isPrimary: Boolean(isPrimary),
        notes: parsed.data.notes || null
      }
    });
  });

  return {};
}

export async function archiveContactAction(
  id: string
): Promise<ContactActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive contacts." };
  }

  const contact = await db.contact.findUnique({
    where: { id }
  });

  if (!contact || contact.companyId !== membership.companyId) {
    return { error: "Contact not found." };
  }

  await db.contact.update({
    where: { id },
    data: { archivedAt: new Date() }
  });

  return {};
}

export async function restoreContactAction(
  id: string
): Promise<ContactActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore contacts." };
  }

  const contact = await db.contact.findUnique({
    where: { id }
  });

  if (!contact || contact.companyId !== membership.companyId) {
    return { error: "Contact not found." };
  }

  await db.contact.update({
    where: { id },
    data: { archivedAt: null }
  });

  return {};
}

export async function deleteContactAction(
  id: string
): Promise<ContactActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to delete contacts." };
  }

  const contact = await db.contact.findUnique({
    where: { id }
  });

  if (!contact || contact.companyId !== membership.companyId) {
    return { error: "Contact not found." };
  }

  await db.contact.delete({ where: { id } });

  redirect("/app/contacts");
}
