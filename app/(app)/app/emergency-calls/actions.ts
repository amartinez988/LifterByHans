"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { emergencyCallSchema } from "@/lib/validators";

export type EmergencyCallActionState = {
  error?: string;
};

function formatEmergencyCode(value: number) {
  return `E-${value.toString().padStart(6, "0")}`;
}

function parseDateTime(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export async function createEmergencyCallAction(
  values: unknown
): Promise<EmergencyCallActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create emergency calls." };
  }

  const parsed = emergencyCallSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const [managementCompany, building, unit, mechanic, status] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: parsed.data.managementCompanyId } }),
    db.building.findUnique({ where: { id: parsed.data.buildingId } }),
    db.unit.findUnique({ where: { id: parsed.data.unitId } }),
    parsed.data.mechanicId ? db.mechanic.findUnique({ where: { id: parsed.data.mechanicId } }) : null,
    db.emergencyCallStatus.findUnique({ where: { id: parsed.data.emergencyCallStatusId } })
  ]);

  if (
    !managementCompany ||
    managementCompany.companyId !== membership.companyId ||
    !building ||
    building.companyId !== membership.companyId ||
    building.managementCompanyId !== managementCompany.id ||
    !unit ||
    unit.companyId !== membership.companyId ||
    unit.buildingId !== building.id ||
    (mechanic && mechanic.companyId !== membership.companyId) ||
    !status ||
    status.companyId !== membership.companyId
  ) {
    return { error: "Invalid emergency call relationships." };
  }

  const callInAt = parseDateTime(parsed.data.callInAt);
  if (!callInAt) {
    return { error: "Invalid call-in time." };
  }

  const completedAt = parseDateTime(parsed.data.completedAt);

  let emergencyId: string | null = null;
  try {
    await db.$transaction(async (tx) => {
      const seq = await tx.emergencyCallSequence.upsert({
        where: { companyId: membership.companyId },
        create: { companyId: membership.companyId, nextNumber: 2 },
        update: { nextNumber: { increment: 1 } }
      });

      const emergencyCode = formatEmergencyCode(seq.nextNumber - 1);

      const emergency = await tx.emergencyCall.create({
        data: {
          companyId: membership.companyId,
          emergencyCode,
          ticketNumber: parsed.data.ticketNumber || null,
          managementCompanyId: managementCompany.id,
          buildingId: building.id,
          unitId: unit.id,
          mechanicId: mechanic ? mechanic.id : null,
          emergencyCallStatusId: status.id,
          callInAt,
          completedAt,
          issueDescription: parsed.data.issueDescription,
          notes: parsed.data.notes || null
        }
      });

      emergencyId = emergency.id;
    });
  } catch (error) {
    return { error: "Unable to create emergency call. Check for duplicates." };
  }

  redirect(`/app/emergency-calls/${emergencyId}`);
}

export async function updateEmergencyCallAction(
  emergencyId: string,
  values: unknown
): Promise<EmergencyCallActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update emergency calls." };
  }

  const parsed = emergencyCallSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.emergencyCall.findUnique({
    where: { id: emergencyId }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Emergency call not found." };
  }

  const [managementCompany, building, unit, mechanic, status] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: parsed.data.managementCompanyId } }),
    db.building.findUnique({ where: { id: parsed.data.buildingId } }),
    db.unit.findUnique({ where: { id: parsed.data.unitId } }),
    parsed.data.mechanicId ? db.mechanic.findUnique({ where: { id: parsed.data.mechanicId } }) : null,
    db.emergencyCallStatus.findUnique({ where: { id: parsed.data.emergencyCallStatusId } })
  ]);

  if (
    !managementCompany ||
    managementCompany.companyId !== membership.companyId ||
    !building ||
    building.companyId !== membership.companyId ||
    building.managementCompanyId !== managementCompany.id ||
    !unit ||
    unit.companyId !== membership.companyId ||
    unit.buildingId !== building.id ||
    (mechanic && mechanic.companyId !== membership.companyId) ||
    !status ||
    status.companyId !== membership.companyId
  ) {
    return { error: "Invalid emergency call relationships." };
  }

  const callInAt = parseDateTime(parsed.data.callInAt);
  if (!callInAt) {
    return { error: "Invalid call-in time." };
  }

  const completedAt = parseDateTime(parsed.data.completedAt);

  try {
    await db.emergencyCall.update({
      where: { id: emergencyId },
      data: {
        ticketNumber: parsed.data.ticketNumber || null,
        managementCompanyId: managementCompany.id,
        buildingId: building.id,
        unitId: unit.id,
        mechanicId: mechanic ? mechanic.id : null,
        emergencyCallStatusId: status.id,
        callInAt,
        completedAt,
        issueDescription: parsed.data.issueDescription,
        notes: parsed.data.notes || null
      }
    });
  } catch (error) {
    return { error: "Unable to update emergency call." };
  }

  return {};
}

export async function archiveEmergencyCallAction(
  id: string
): Promise<EmergencyCallActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive emergency calls." };
  }

  const emergencyCall = await db.emergencyCall.findUnique({
    where: { id }
  });

  if (!emergencyCall || emergencyCall.companyId !== membership.companyId) {
    return { error: "Emergency call not found." };
  }

  await db.emergencyCall.update({
    where: { id },
    data: { archivedAt: new Date() }
  });

  return {};
}

export async function restoreEmergencyCallAction(
  id: string
): Promise<EmergencyCallActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore emergency calls." };
  }

  const emergencyCall = await db.emergencyCall.findUnique({
    where: { id }
  });

  if (!emergencyCall || emergencyCall.companyId !== membership.companyId) {
    return { error: "Emergency call not found." };
  }

  await db.emergencyCall.update({
    where: { id },
    data: { archivedAt: null }
  });

  return {};
}
