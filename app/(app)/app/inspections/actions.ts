"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { inspectionSchema } from "@/lib/validators";

export type InspectionActionState = {
  error?: string;
};

function formatInspectionCode(value: number) {
  return `I-${value.toString().padStart(6, "0")}`;
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export async function createInspectionAction(
  values: unknown
): Promise<InspectionActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create inspections." };
  }

  const parsed = inspectionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const [managementCompany, building, unit, inspector, status, result] =
    await Promise.all([
      db.managementCompany.findUnique({
        where: { id: parsed.data.managementCompanyId }
      }),
      db.building.findUnique({ where: { id: parsed.data.buildingId } }),
      db.unit.findUnique({ where: { id: parsed.data.unitId } }),
      parsed.data.inspectorId
        ? db.inspector.findUnique({ where: { id: parsed.data.inspectorId } })
        : null,
      db.inspectionStatus.findUnique({ where: { id: parsed.data.inspectionStatusId } }),
      parsed.data.inspectionResultId
        ? db.inspectionResult.findUnique({ where: { id: parsed.data.inspectionResultId } })
        : null
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
    (inspector && inspector.companyId !== membership.companyId) ||
    !status ||
    status.companyId !== membership.companyId ||
    (result && result.companyId !== membership.companyId)
  ) {
    return { error: "Invalid inspection relationships." };
  }

  const inspectionDate = parseDate(parsed.data.inspectionDate);
  if (!inspectionDate) {
    return { error: "Invalid inspection date." };
  }

  const expirationDate = parseDate(parsed.data.expirationDate);

  let inspectionId: string | null = null;
  try {
    await db.$transaction(async (tx) => {
      const seq = await tx.inspectionSequence.upsert({
        where: { companyId: membership.companyId },
        create: { companyId: membership.companyId, nextNumber: 2 },
        update: { nextNumber: { increment: 1 } }
      });

      const inspectionCode = formatInspectionCode(seq.nextNumber - 1);

      const inspection = await tx.inspection.create({
        data: {
          companyId: membership.companyId,
          inspectionCode,
          managementCompanyId: managementCompany.id,
          buildingId: building.id,
          unitId: unit.id,
          inspectorId: inspector ? inspector.id : null,
          inspectionStatusId: status.id,
          inspectionResultId: result ? result.id : null,
          inspectionDate,
          expirationDate,
          reportUrl: parsed.data.reportUrl || null,
          notes: parsed.data.notes || null
        }
      });

      inspectionId = inspection.id;
    });
  } catch (error) {
    return { error: "Unable to create inspection. Check for duplicates." };
  }

  redirect(`/app/inspections/${inspectionId}`);
}

export async function updateInspectionAction(
  inspectionId: string,
  values: unknown
): Promise<InspectionActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update inspections." };
  }

  const parsed = inspectionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.inspection.findUnique({
    where: { id: inspectionId }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Inspection not found." };
  }

  const [managementCompany, building, unit, inspector, status, result] =
    await Promise.all([
      db.managementCompany.findUnique({
        where: { id: parsed.data.managementCompanyId }
      }),
      db.building.findUnique({ where: { id: parsed.data.buildingId } }),
      db.unit.findUnique({ where: { id: parsed.data.unitId } }),
      parsed.data.inspectorId
        ? db.inspector.findUnique({ where: { id: parsed.data.inspectorId } })
        : null,
      db.inspectionStatus.findUnique({ where: { id: parsed.data.inspectionStatusId } }),
      parsed.data.inspectionResultId
        ? db.inspectionResult.findUnique({ where: { id: parsed.data.inspectionResultId } })
        : null
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
    (inspector && inspector.companyId !== membership.companyId) ||
    !status ||
    status.companyId !== membership.companyId ||
    (result && result.companyId !== membership.companyId)
  ) {
    return { error: "Invalid inspection relationships." };
  }

  const inspectionDate = parseDate(parsed.data.inspectionDate);
  if (!inspectionDate) {
    return { error: "Invalid inspection date." };
  }

  const expirationDate = parseDate(parsed.data.expirationDate);

  try {
    await db.inspection.update({
      where: { id: inspectionId },
      data: {
        managementCompanyId: managementCompany.id,
        buildingId: building.id,
        unitId: unit.id,
        inspectorId: inspector ? inspector.id : null,
        inspectionStatusId: status.id,
        inspectionResultId: result ? result.id : null,
        inspectionDate,
        expirationDate,
        reportUrl: parsed.data.reportUrl || null,
        notes: parsed.data.notes || null
      }
    });
  } catch (error) {
    return { error: "Unable to update inspection." };
  }

  return {};
}

export async function archiveInspectionAction(
  id: string
): Promise<InspectionActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive inspections." };
  }

  const inspection = await db.inspection.findUnique({
    where: { id }
  });

  if (!inspection || inspection.companyId !== membership.companyId) {
    return { error: "Inspection not found." };
  }

  await db.inspection.update({
    where: { id },
    data: { archivedAt: new Date() }
  });

  return {};
}

export async function restoreInspectionAction(
  id: string
): Promise<InspectionActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore inspections." };
  }

  const inspection = await db.inspection.findUnique({
    where: { id }
  });

  if (!inspection || inspection.companyId !== membership.companyId) {
    return { error: "Inspection not found." };
  }

  await db.inspection.update({
    where: { id },
    data: { archivedAt: null }
  });

  return {};
}
