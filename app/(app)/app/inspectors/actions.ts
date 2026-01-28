"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { inspectorSchema } from "@/lib/validators";

export type InspectorActionState = {
  error?: string;
};

export async function createInspectorAction(
  values: unknown
): Promise<InspectorActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create inspectors." };
  }

  const parsed = inspectorSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  let inspectorId: string | null = null;
  try {
    const inspector = await db.inspector.create({
      data: {
        companyId: membership.companyId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        companyName: parsed.data.companyName || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        isActive: parsed.data.isActive ?? true
      }
    });
    inspectorId = inspector.id;
  } catch (error) {
    return { error: "Unable to create inspector. Check for duplicates." };
  }

  redirect(`/app/inspectors/${inspectorId}`);
}

export async function updateInspectorAction(
  inspectorId: string,
  values: unknown
): Promise<InspectorActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update inspectors." };
  }

  const parsed = inspectorSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.inspector.findUnique({
    where: { id: inspectorId }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Inspector not found." };
  }

  try {
    await db.inspector.update({
      where: { id: inspectorId },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        companyName: parsed.data.companyName || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        isActive: parsed.data.isActive ?? true
      }
    });
  } catch (error) {
    return { error: "Unable to update inspector. Check for duplicates." };
  }

  return {};
}

export async function createInspectorInlineAction(
  values: unknown
): Promise<{ error?: string; inspector?: { id: string; name: string } }> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create inspectors." };
  }

  const parsed = inspectorSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  try {
    const inspector = await db.inspector.create({
      data: {
        companyId: membership.companyId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        companyName: parsed.data.companyName || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        isActive: parsed.data.isActive ?? true
      }
    });
    return {
      inspector: {
        id: inspector.id,
        name: `${inspector.firstName} ${inspector.lastName}`
      }
    };
  } catch (error) {
    return { error: "Unable to create inspector. Check for duplicates." };
  }
}
