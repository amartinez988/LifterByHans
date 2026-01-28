"use server";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { inspectionResultSchema, inspectionStatusSchema } from "@/lib/validators";

export async function createInspectionStatusAction(
  values: unknown
): Promise<{ error?: string; item?: { id: string; name: string } }> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create statuses." };
  }

  const parsed = inspectionStatusSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  try {
    const record = await db.inspectionStatus.create({
      data: {
        companyId: membership.companyId,
        name: parsed.data.name,
        description: parsed.data.description || null
      }
    });
    return { item: { id: record.id, name: record.name } };
  } catch (error) {
    return { error: "Unable to create status. Check for duplicates." };
  }
}

export async function createInspectionResultAction(
  values: unknown
): Promise<{ error?: string; item?: { id: string; name: string } }> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create results." };
  }

  const parsed = inspectionResultSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  try {
    const record = await db.inspectionResult.create({
      data: {
        companyId: membership.companyId,
        name: parsed.data.name,
        description: parsed.data.description || null
      }
    });
    return { item: { id: record.id, name: record.name } };
  } catch (error) {
    return { error: "Unable to create result. Check for duplicates." };
  }
}
