"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { buildingSchema } from "@/lib/validators";

export type BuildingActionState = {
  error?: string;
};

export async function createBuildingAction(
  managementCompanyId: string,
  values: unknown
): Promise<BuildingActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create buildings." };
  }

  const parsed = buildingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const managementCompany = await db.managementCompany.findUnique({
    where: { id: managementCompanyId }
  });

  if (!managementCompany || managementCompany.companyId !== membership.companyId) {
    return { error: "Management company not found." };
  }

  let buildingId: string | null = null;
  try {
    const building = await db.building.create({
      data: {
        companyId: membership.companyId,
        managementCompanyId,
        name: parsed.data.name,
        address: parsed.data.address,
        localPhone: parsed.data.localPhone || null,
        jurisdiction: parsed.data.jurisdiction || null,
        notes: parsed.data.notes || null
      }
    });
    buildingId = building.id;
  } catch (error) {
    return { error: "Unable to create building. Check for duplicates." };
  }

  redirect(`/app/buildings/${buildingId}`);
}

export async function updateBuildingAction(
  buildingId: string,
  values: unknown
): Promise<BuildingActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update buildings." };
  }

  const parsed = buildingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const building = await db.building.findUnique({
    where: { id: buildingId }
  });

  if (!building || building.companyId !== membership.companyId) {
    return { error: "Building not found." };
  }

  try {
    await db.building.update({
      where: { id: buildingId },
      data: {
        name: parsed.data.name,
        address: parsed.data.address,
        localPhone: parsed.data.localPhone || null,
        jurisdiction: parsed.data.jurisdiction || null,
        notes: parsed.data.notes || null
      }
    });
  } catch (error) {
    return { error: "Unable to update building. Check for duplicates." };
  }

  return {};
}

export async function archiveBuildingAction(
  buildingId: string
): Promise<BuildingActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive buildings." };
  }

  const building = await db.building.findUnique({
    where: { id: buildingId }
  });

  if (!building || building.companyId !== membership.companyId) {
    return { error: "Building not found." };
  }

  // Cascade archive to units
  await db.$transaction([
    db.building.update({
      where: { id: buildingId },
      data: { archivedAt: new Date() }
    }),
    db.unit.updateMany({
      where: { buildingId },
      data: { archivedAt: new Date() }
    })
  ]);

  return {};
}

export async function restoreBuildingAction(
  buildingId: string
): Promise<BuildingActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore buildings." };
  }

  const building = await db.building.findUnique({
    where: { id: buildingId }
  });

  if (!building || building.companyId !== membership.companyId) {
    return { error: "Building not found." };
  }

  // Restore building and its units
  await db.$transaction([
    db.building.update({
      where: { id: buildingId },
      data: { archivedAt: null }
    }),
    db.unit.updateMany({
      where: { buildingId },
      data: { archivedAt: null }
    })
  ]);

  return {};
}

export async function deleteBuildingAction(
  buildingId: string
): Promise<BuildingActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to delete buildings." };
  }

  const building = await db.building.findUnique({
    where: { id: buildingId },
    include: { _count: { select: { units: true } } }
  });

  if (!building || building.companyId !== membership.companyId) {
    return { error: "Building not found." };
  }

  if (building._count.units > 0) {
    return { error: "Cannot delete building with units. Delete all units first." };
  }

  await db.building.delete({ where: { id: buildingId } });

  redirect("/app/management-companies");
}

export async function canDeleteBuilding(buildingId: string): Promise<boolean> {
  const count = await db.unit.count({ where: { buildingId } });
  return count === 0;
}
