"use server";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { emergencyCallStatusSchema } from "@/lib/validators";

export async function createEmergencyCallStatusAction(
  values: unknown
): Promise<{ error?: string; item?: { id: string; name: string } }> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create statuses." };
  }

  const parsed = emergencyCallStatusSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  try {
    const record = await db.emergencyCallStatus.create({
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
