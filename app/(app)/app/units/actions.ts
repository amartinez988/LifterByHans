"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { unitSchema } from "@/lib/validators";

export type UnitActionState = {
  error?: string;
};

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export async function createUnitAction(
  buildingId: string,
  values: unknown
): Promise<UnitActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create units." };
  }

  const parsed = unitSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const building = await db.building.findUnique({
    where: { id: buildingId }
  });

  if (!building || building.companyId !== membership.companyId) {
    return { error: "Building not found." };
  }

  const [category, status, equipmentType, brand] = await Promise.all([
    db.unitCategory.findUnique({ where: { id: parsed.data.unitCategoryId } }),
    db.unitStatus.findUnique({ where: { id: parsed.data.unitStatusId } }),
    db.unitEquipmentType.findUnique({ where: { id: parsed.data.equipmentTypeId } }),
    db.unitBrand.findUnique({ where: { id: parsed.data.brandId } })
  ]);

  if (
    !category ||
    category.companyId !== membership.companyId ||
    !status ||
    status.companyId !== membership.companyId ||
    !equipmentType ||
    equipmentType.companyId !== membership.companyId ||
    !brand ||
    brand.companyId !== membership.companyId
  ) {
    return { error: "Invalid lookup selection." };
  }

  let unitId: string | null = null;
  try {
    const unit = await db.unit.create({
      data: {
        companyId: membership.companyId,
        buildingId,
        identifier: parsed.data.identifier,
        unitCategoryId: parsed.data.unitCategoryId,
        unitStatusId: parsed.data.unitStatusId,
        equipmentTypeId: parsed.data.equipmentTypeId,
        brandId: parsed.data.brandId,
        description: parsed.data.description || null,
        serialNumber: parsed.data.serialNumber || null,
        underContract: Boolean(parsed.data.underContract),
        isActive: Boolean(parsed.data.underContract) ? true : Boolean(parsed.data.isActive ?? true),
        agreementStartDate: parseDate(parsed.data.agreementStartDate),
        agreementEndDate: parseDate(parsed.data.agreementEndDate),
        phoneLineService: Boolean(parsed.data.phoneLineService),
        folderUrl: parsed.data.folderUrl || null,
        landings: parsed.data.landings ?? null,
        capacity: parsed.data.capacity ?? null,
        floorLocation: parsed.data.floorLocation ?? null,
        machineRoomLocation: parsed.data.machineRoomLocation || null,
        buildingNumber: parsed.data.buildingNumber || null,
        certificateUrl: parsed.data.certificateUrl || null,
        photoUrl: parsed.data.photoUrl || null,
        notes: parsed.data.notes || null
      }
    });
    unitId = unit.id;
  } catch (error) {
    return { error: "Unable to create unit. Check for duplicates." };
  }

  redirect(`/app/buildings/${buildingId}`);
}

export async function updateUnitAction(
  unitId: string,
  values: unknown
): Promise<UnitActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update units." };
  }

  const parsed = unitSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const unit = await db.unit.findUnique({
    where: { id: unitId }
  });

  if (!unit || unit.companyId !== membership.companyId) {
    return { error: "Unit not found." };
  }

  const [category, status, equipmentType, brand] = await Promise.all([
    db.unitCategory.findUnique({ where: { id: parsed.data.unitCategoryId } }),
    db.unitStatus.findUnique({ where: { id: parsed.data.unitStatusId } }),
    db.unitEquipmentType.findUnique({ where: { id: parsed.data.equipmentTypeId } }),
    db.unitBrand.findUnique({ where: { id: parsed.data.brandId } })
  ]);

  if (
    !category ||
    category.companyId !== membership.companyId ||
    !status ||
    status.companyId !== membership.companyId ||
    !equipmentType ||
    equipmentType.companyId !== membership.companyId ||
    !brand ||
    brand.companyId !== membership.companyId
  ) {
    return { error: "Invalid lookup selection." };
  }

  try {
    await db.unit.update({
      where: { id: unitId },
      data: {
        identifier: parsed.data.identifier,
        unitCategoryId: parsed.data.unitCategoryId,
        unitStatusId: parsed.data.unitStatusId,
        equipmentTypeId: parsed.data.equipmentTypeId,
        brandId: parsed.data.brandId,
        description: parsed.data.description || null,
        serialNumber: parsed.data.serialNumber || null,
        underContract: Boolean(parsed.data.underContract),
        isActive: Boolean(parsed.data.underContract) ? true : Boolean(parsed.data.isActive ?? true),
        agreementStartDate: parseDate(parsed.data.agreementStartDate),
        agreementEndDate: parseDate(parsed.data.agreementEndDate),
        phoneLineService: Boolean(parsed.data.phoneLineService),
        folderUrl: parsed.data.folderUrl || null,
        landings: parsed.data.landings ?? null,
        capacity: parsed.data.capacity ?? null,
        floorLocation: parsed.data.floorLocation ?? null,
        machineRoomLocation: parsed.data.machineRoomLocation || null,
        buildingNumber: parsed.data.buildingNumber || null,
        certificateUrl: parsed.data.certificateUrl || null,
        photoUrl: parsed.data.photoUrl || null,
        notes: parsed.data.notes || null
      }
    });
  } catch (error) {
    return { error: "Unable to update unit. Check for duplicates." };
  }

  return {};
}

export async function archiveUnitAction(
  unitId: string
): Promise<UnitActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive units." };
  }

  const unit = await db.unit.findUnique({
    where: { id: unitId }
  });

  if (!unit || unit.companyId !== membership.companyId) {
    return { error: "Unit not found." };
  }

  await db.unit.update({
    where: { id: unitId },
    data: { archivedAt: new Date() }
  });

  return {};
}

export async function restoreUnitAction(
  unitId: string
): Promise<UnitActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore units." };
  }

  const unit = await db.unit.findUnique({
    where: { id: unitId }
  });

  if (!unit || unit.companyId !== membership.companyId) {
    return { error: "Unit not found." };
  }

  await db.unit.update({
    where: { id: unitId },
    data: { archivedAt: null }
  });

  return {};
}

export async function deleteUnitAction(
  unitId: string
): Promise<UnitActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to delete units." };
  }

  const unit = await db.unit.findUnique({
    where: { id: unitId },
    include: {
      _count: {
        select: {
          maintenances: true,
          inspections: true,
          emergencyCalls: true
        }
      }
    }
  });

  if (!unit || unit.companyId !== membership.companyId) {
    return { error: "Unit not found." };
  }

  if (
    unit._count.maintenances > 0 ||
    unit._count.inspections > 0 ||
    unit._count.emergencyCalls > 0
  ) {
    return { error: "Cannot delete unit with maintenance, inspections, or emergency calls." };
  }

  const buildingId = unit.buildingId;
  await db.unit.delete({ where: { id: unitId } });

  redirect(`/app/buildings/${buildingId}`);
}

export async function canDeleteUnit(unitId: string): Promise<boolean> {
  const unit = await db.unit.findUnique({
    where: { id: unitId },
    include: {
      _count: {
        select: {
          maintenances: true,
          inspections: true,
          emergencyCalls: true
        }
      }
    }
  });

  if (!unit) return false;

  return (
    unit._count.maintenances === 0 &&
    unit._count.inspections === 0 &&
    unit._count.emergencyCalls === 0
  );
}
