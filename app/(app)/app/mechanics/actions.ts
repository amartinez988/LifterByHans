"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { mechanicLevelSchema, mechanicSchema } from "@/lib/validators";

export type MechanicActionState = {
  error?: string;
};

export async function createMechanicAction(
  values: unknown
): Promise<MechanicActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create mechanics." };
  }

  const parsed = mechanicSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const level = await db.mechanicLevel.findUnique({
    where: { id: parsed.data.mechanicLevelId }
  });

  if (!level || level.companyId !== membership.companyId) {
    return { error: "Mechanic level not found." };
  }

  let mechanicId: string | null = null;
  try {
    const mechanic = await db.mechanic.create({
      data: {
        companyId: membership.companyId,
        mechanicLevelId: level.id,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        isActive: parsed.data.isActive ?? true
      }
    });
    mechanicId = mechanic.id;
  } catch (error) {
    return { error: "Unable to create mechanic. Check for duplicates." };
  }

  redirect(`/app/mechanics/${mechanicId}`);
}

export async function updateMechanicAction(
  mechanicId: string,
  values: unknown
): Promise<MechanicActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update mechanics." };
  }

  const parsed = mechanicSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const level = await db.mechanicLevel.findUnique({
    where: { id: parsed.data.mechanicLevelId }
  });

  if (!level || level.companyId !== membership.companyId) {
    return { error: "Mechanic level not found." };
  }

  const existing = await db.mechanic.findUnique({
    where: { id: mechanicId }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Mechanic not found." };
  }

  try {
    await db.mechanic.update({
      where: { id: mechanicId },
      data: {
        mechanicLevelId: level.id,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        isActive: parsed.data.isActive ?? true
      }
    });
  } catch (error) {
    return { error: "Unable to update mechanic. Check for duplicates." };
  }

  return {};
}

export async function createMechanicLevelAction(
  values: unknown
): Promise<{ error?: string; level?: { id: string; name: string } }> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create levels." };
  }

  const parsed = mechanicLevelSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  try {
    const level = await db.mechanicLevel.create({
      data: {
        companyId: membership.companyId,
        name: parsed.data.name,
        description: parsed.data.description || null
      }
    });
    return { level: { id: level.id, name: level.name } };
  } catch (error) {
    return { error: "Unable to create level. Check for duplicates." };
  }
}
