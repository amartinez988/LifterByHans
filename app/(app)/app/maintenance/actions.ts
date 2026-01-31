"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { maintenanceSchema } from "@/lib/validators";

export type MaintenanceActionState = {
  error?: string;
};

function formatMaintenanceCode(value: number) {
  return `M-${value.toString().padStart(6, "0")}`;
}

export async function createMaintenanceAction(
  values: unknown
): Promise<MaintenanceActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create maintenance." };
  }

  const parsed = maintenanceSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const [managementCompany, building, unit, mechanic] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: parsed.data.managementCompanyId } }),
    db.building.findUnique({ where: { id: parsed.data.buildingId } }),
    db.unit.findUnique({ where: { id: parsed.data.unitId } }),
    parsed.data.mechanicId ? db.mechanic.findUnique({ where: { id: parsed.data.mechanicId } }) : null
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
    (mechanic && mechanic.companyId !== membership.companyId)
  ) {
    return { error: "Invalid maintenance relationships." };
  }

  // Append T12:00:00 to parse as local noon, avoiding timezone date shift
  const maintenanceDate = new Date(parsed.data.maintenanceDate + "T12:00:00");
  if (Number.isNaN(maintenanceDate.getTime())) {
    return { error: "Invalid maintenance date." };
  }

  let maintenanceId: string | null = null;
  try {
    await db.$transaction(async (tx) => {
      const seq = await tx.maintenanceSequence.upsert({
        where: { companyId: membership.companyId },
        create: { companyId: membership.companyId, nextNumber: 2 },
        update: { nextNumber: { increment: 1 } }
      });

      const maintenanceCode = formatMaintenanceCode(seq.nextNumber - 1);

      const maintenance = await tx.maintenance.create({
        data: {
          companyId: membership.companyId,
          maintenanceCode,
          managementCompanyId: managementCompany.id,
          buildingId: building.id,
          unitId: unit.id,
          mechanicId: mechanic ? mechanic.id : null,
          status: parsed.data.status ?? "OPEN",
          maintenanceDate,
          notes: parsed.data.notes || null
        }
      });

      maintenanceId = maintenance.id;
    });
  } catch (error) {
    return { error: "Unable to create maintenance. Check for duplicates." };
  }

  redirect(`/app/maintenance/${maintenanceId}`);
}

export async function updateMaintenanceAction(
  maintenanceId: string,
  values: unknown
): Promise<MaintenanceActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update maintenance." };
  }

  const parsed = maintenanceSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.maintenance.findUnique({
    where: { id: maintenanceId }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Maintenance record not found." };
  }

  const [managementCompany, building, unit, mechanic] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: parsed.data.managementCompanyId } }),
    db.building.findUnique({ where: { id: parsed.data.buildingId } }),
    db.unit.findUnique({ where: { id: parsed.data.unitId } }),
    parsed.data.mechanicId ? db.mechanic.findUnique({ where: { id: parsed.data.mechanicId } }) : null
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
    (mechanic && mechanic.companyId !== membership.companyId)
  ) {
    return { error: "Invalid maintenance relationships." };
  }

  // Append T12:00:00 to parse as local noon, avoiding timezone date shift
  const maintenanceDate = new Date(parsed.data.maintenanceDate + "T12:00:00");
  if (Number.isNaN(maintenanceDate.getTime())) {
    return { error: "Invalid maintenance date." };
  }

  try {
    await db.maintenance.update({
      where: { id: maintenanceId },
      data: {
        managementCompanyId: managementCompany.id,
        buildingId: building.id,
        unitId: unit.id,
        mechanicId: mechanic ? mechanic.id : null,
        status: parsed.data.status ?? "OPEN",
        maintenanceDate,
        notes: parsed.data.notes || null
      }
    });
  } catch (error) {
    return { error: "Unable to update maintenance." };
  }

  return {};
}

export async function archiveMaintenanceAction(
  id: string
): Promise<MaintenanceActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive maintenance." };
  }

  const maintenance = await db.maintenance.findUnique({
    where: { id }
  });

  if (!maintenance || maintenance.companyId !== membership.companyId) {
    return { error: "Maintenance record not found." };
  }

  await db.maintenance.update({
    where: { id },
    data: { archivedAt: new Date() }
  });

  return {};
}

export async function restoreMaintenanceAction(
  id: string
): Promise<MaintenanceActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore maintenance." };
  }

  const maintenance = await db.maintenance.findUnique({
    where: { id }
  });

  if (!maintenance || maintenance.companyId !== membership.companyId) {
    return { error: "Maintenance record not found." };
  }

  await db.maintenance.update({
    where: { id },
    data: { archivedAt: null }
  });

  return {};
}
