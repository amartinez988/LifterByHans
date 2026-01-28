"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { managementCompanySchema } from "@/lib/validators";

export type ManagementCompanyActionState = {
  error?: string;
};

export async function createManagementCompanyAction(
  values: unknown
): Promise<ManagementCompanyActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create companies." };
  }

  const parsed = managementCompanySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const data = {
    companyId: membership.companyId,
    name: parsed.data.name,
    accountNumber: parsed.data.accountNumber || null,
    website: parsed.data.website || null,
    mainPhone: parsed.data.mainPhone || null,
    emergencyPhone: parsed.data.emergencyPhone || null,
    notes: parsed.data.notes || null
  };

  let recordId: string | null = null;
  try {
    const record = await db.managementCompany.create({ data });
    recordId = record.id;
  } catch (error) {
    return { error: "Unable to create company. Check for duplicates." };
  }

  redirect(`/app/management-companies/${recordId}`);
}

export async function updateManagementCompanyAction(
  id: string,
  values: unknown
): Promise<ManagementCompanyActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update companies." };
  }

  const parsed = managementCompanySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.managementCompany.findUnique({
    where: { id }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Management company not found." };
  }

  try {
    await db.managementCompany.update({
      where: { id },
      data: {
        name: parsed.data.name,
        accountNumber: parsed.data.accountNumber || null,
        website: parsed.data.website || null,
        mainPhone: parsed.data.mainPhone || null,
        emergencyPhone: parsed.data.emergencyPhone || null,
        notes: parsed.data.notes || null
      }
    });
  } catch (error) {
    return { error: "Unable to update company. Check for duplicates." };
  }

  return {};
}

export async function attachExistingContactAction(
  companyId: string,
  contactId: string
): Promise<ManagementCompanyActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update contacts." };
  }

  if (!contactId) {
    return { error: "Select a contact to add." };
  }

  const company = await db.managementCompany.findUnique({
    where: { id: companyId }
  });

  const contact = await db.contact.findUnique({
    where: { id: contactId }
  });

  if (
    !company ||
    company.companyId !== membership.companyId ||
    !contact ||
    contact.companyId !== membership.companyId
  ) {
    return { error: "Contact or company not found." };
  }

  await db.contact.update({
    where: { id: contactId },
    data: { managementCompanyId: companyId }
  });

  return {};
}

export async function archiveManagementCompanyAction(
  id: string
): Promise<ManagementCompanyActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive companies." };
  }

  const company = await db.managementCompany.findUnique({
    where: { id }
  });

  if (!company || company.companyId !== membership.companyId) {
    return { error: "Management company not found." };
  }

  await db.managementCompany.update({
    where: { id },
    data: { archivedAt: new Date() }
  });

  return {};
}

export async function restoreManagementCompanyAction(
  id: string
): Promise<ManagementCompanyActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore companies." };
  }

  const company = await db.managementCompany.findUnique({
    where: { id }
  });

  if (!company || company.companyId !== membership.companyId) {
    return { error: "Management company not found." };
  }

  await db.managementCompany.update({
    where: { id },
    data: { archivedAt: null }
  });

  return {};
}

export async function deleteManagementCompanyAction(
  id: string
): Promise<ManagementCompanyActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to delete companies." };
  }

  const company = await db.managementCompany.findUnique({
    where: { id },
    include: { _count: { select: { buildings: true } } }
  });

  if (!company || company.companyId !== membership.companyId) {
    return { error: "Management company not found." };
  }

  if (company._count.buildings > 0) {
    return { error: "Cannot delete company with buildings. Delete all buildings first." };
  }

  await db.managementCompany.delete({ where: { id } });

  redirect("/app/management-companies");
}

export async function canDeleteManagementCompany(id: string): Promise<boolean> {
  const count = await db.building.count({ where: { managementCompanyId: id } });
  return count === 0;
}
