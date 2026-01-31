"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type ImportResult = {
  error?: string;
  imported?: number;
  skipped?: number;
};

// ============================================
// Management Companies Import
// ============================================

type MCImportRow = {
  name: string;
  accountNumber?: string;
  website?: string;
  mainPhone?: string;
  emergencyPhone?: string;
  notes?: string;
};

export async function importManagementCompaniesAction(
  rows: MCImportRow[]
): Promise<ImportResult> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to import data." };
  }

  if (!rows || rows.length === 0) {
    return { error: "No data to import." };
  }

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.name?.trim()) {
      skipped++;
      continue;
    }

    try {
      await db.managementCompany.upsert({
        where: {
          companyId_name: {
            companyId: membership.companyId,
            name: row.name.trim(),
          },
        },
        create: {
          companyId: membership.companyId,
          name: row.name.trim(),
          accountNumber: row.accountNumber?.trim() || null,
          website: row.website?.trim() || null,
          mainPhone: row.mainPhone?.trim() || null,
          emergencyPhone: row.emergencyPhone?.trim() || null,
          notes: row.notes?.trim() || null,
        },
        update: {
          accountNumber: row.accountNumber?.trim() || null,
          website: row.website?.trim() || null,
          mainPhone: row.mainPhone?.trim() || null,
          emergencyPhone: row.emergencyPhone?.trim() || null,
          notes: row.notes?.trim() || null,
        },
      });
      imported++;
    } catch (error) {
      console.error("Failed to import MC:", row.name, error);
      skipped++;
    }
  }

  revalidatePath("/app/settings/import");
  revalidatePath("/app/management-companies");
  return { imported, skipped };
}

// ============================================
// Buildings Import
// ============================================

type BuildingImportRow = {
  managementCompany: string;
  name: string;
  address: string;
  localPhone?: string;
  jurisdiction?: string;
  notes?: string;
};

export async function importBuildingsAction(
  rows: BuildingImportRow[]
): Promise<ImportResult> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to import data." };
  }

  if (!rows || rows.length === 0) {
    return { error: "No data to import." };
  }

  // Get management companies for lookup
  const mcs = await db.managementCompany.findMany({
    where: { companyId: membership.companyId, archivedAt: null },
    select: { id: true, name: true },
  });
  const mcMap = new Map(mcs.map(mc => [mc.name.toLowerCase(), mc.id]));

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.name?.trim() || !row.managementCompany?.trim() || !row.address?.trim()) {
      skipped++;
      continue;
    }

    const mcId = mcMap.get(row.managementCompany.toLowerCase().trim());
    if (!mcId) {
      skipped++;
      continue;
    }

    try {
      await db.building.upsert({
        where: {
          companyId_managementCompanyId_name: {
            companyId: membership.companyId,
            managementCompanyId: mcId,
            name: row.name.trim(),
          },
        },
        create: {
          companyId: membership.companyId,
          managementCompanyId: mcId,
          name: row.name.trim(),
          address: row.address.trim(),
          localPhone: row.localPhone?.trim() || null,
          jurisdiction: row.jurisdiction?.trim() || null,
          notes: row.notes?.trim() || null,
        },
        update: {
          address: row.address.trim(),
          localPhone: row.localPhone?.trim() || null,
          jurisdiction: row.jurisdiction?.trim() || null,
          notes: row.notes?.trim() || null,
        },
      });
      imported++;
    } catch (error) {
      console.error("Failed to import building:", row.name, error);
      skipped++;
    }
  }

  revalidatePath("/app/settings/import");
  revalidatePath("/app/buildings");
  return { imported, skipped };
}

// ============================================
// Units Import
// ============================================

type UnitImportRow = {
  managementCompany: string;
  building: string;
  identifier: string;
  description?: string;
  serialNumber?: string;
  category: string;
  status: string;
  equipmentType: string;
  brand: string;
  underContract?: boolean;
  notes?: string;
};

export async function importUnitsAction(
  rows: UnitImportRow[]
): Promise<ImportResult> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to import data." };
  }

  if (!rows || rows.length === 0) {
    return { error: "No data to import." };
  }

  // Get lookups
  const [mcs, buildings, categories, statuses, equipmentTypes, brands] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true },
    }),
    db.building.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true, managementCompanyId: true },
    }),
    db.unitCategory.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
    }),
    db.unitStatus.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
    }),
    db.unitEquipmentType.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
    }),
    db.unitBrand.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
    }),
  ]);

  const mcMap = new Map(mcs.map(mc => [mc.name.toLowerCase(), mc.id]));
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
  const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s.id]));
  const equipmentTypeMap = new Map(equipmentTypes.map(e => [e.name.toLowerCase(), e.id]));
  const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b.id]));

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.identifier?.trim() || !row.managementCompany?.trim() || !row.building?.trim()) {
      skipped++;
      continue;
    }

    const mcId = mcMap.get(row.managementCompany.toLowerCase().trim());
    if (!mcId) {
      skipped++;
      continue;
    }

    const building = buildings.find(
      b => b.name.toLowerCase() === row.building.toLowerCase().trim() && 
           b.managementCompanyId === mcId
    );
    if (!building) {
      skipped++;
      continue;
    }

    const categoryId = categoryMap.get(row.category?.toLowerCase().trim() || "");
    const statusId = statusMap.get(row.status?.toLowerCase().trim() || "");
    const equipmentTypeId = equipmentTypeMap.get(row.equipmentType?.toLowerCase().trim() || "");
    const brandId = brandMap.get(row.brand?.toLowerCase().trim() || "");

    if (!categoryId || !statusId || !equipmentTypeId || !brandId) {
      skipped++;
      continue;
    }

    try {
      await db.unit.upsert({
        where: {
          companyId_buildingId_identifier: {
            companyId: membership.companyId,
            buildingId: building.id,
            identifier: row.identifier.trim(),
          },
        },
        create: {
          companyId: membership.companyId,
          buildingId: building.id,
          identifier: row.identifier.trim(),
          description: row.description?.trim() || null,
          serialNumber: row.serialNumber?.trim() || null,
          unitCategoryId: categoryId,
          unitStatusId: statusId,
          equipmentTypeId: equipmentTypeId,
          brandId: brandId,
          underContract: row.underContract ?? false,
          notes: row.notes?.trim() || null,
        },
        update: {
          description: row.description?.trim() || null,
          serialNumber: row.serialNumber?.trim() || null,
          unitCategoryId: categoryId,
          unitStatusId: statusId,
          equipmentTypeId: equipmentTypeId,
          brandId: brandId,
          underContract: row.underContract ?? false,
          notes: row.notes?.trim() || null,
        },
      });
      imported++;
    } catch (error) {
      console.error("Failed to import unit:", row.identifier, error);
      skipped++;
    }
  }

  revalidatePath("/app/settings/import");
  revalidatePath("/app/units");
  return { imported, skipped };
}

// ============================================
// Mechanics Import
// ============================================

type MechanicImportRow = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

export async function importMechanicsAction(
  rows: MechanicImportRow[]
): Promise<ImportResult> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to import data." };
  }

  if (!rows || rows.length === 0) {
    return { error: "No data to import." };
  }

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.firstName?.trim() || !row.lastName?.trim()) {
      skipped++;
      continue;
    }

    try {
      // Check if mechanic with same email exists
      if (row.email?.trim()) {
        const existing = await db.mechanic.findFirst({
          where: {
            companyId: membership.companyId,
            email: row.email.trim(),
          },
        });

        if (existing) {
          await db.mechanic.update({
            where: { id: existing.id },
            data: {
              firstName: row.firstName.trim(),
              lastName: row.lastName.trim(),
              phone: row.phone?.trim() || null,
            },
          });
          imported++;
          continue;
        }
      }

      await db.mechanic.create({
        data: {
          companyId: membership.companyId,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
        },
      });
      imported++;
    } catch (error) {
      console.error("Failed to import mechanic:", row.firstName, row.lastName, error);
      skipped++;
    }
  }

  revalidatePath("/app/settings/import");
  revalidatePath("/app/mechanics");
  return { imported, skipped };
}

// ============================================
// Contacts Import
// ============================================

type ContactImportRow = {
  managementCompany: string;
  category: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
  notes?: string;
};

export async function importContactsAction(
  rows: ContactImportRow[]
): Promise<ImportResult> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to import data." };
  }

  if (!rows || rows.length === 0) {
    return { error: "No data to import." };
  }

  const [mcs, categories] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true },
    }),
    db.contactCategory.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
    }),
  ]);

  const mcMap = new Map(mcs.map(mc => [mc.name.toLowerCase(), mc.id]));
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.firstName?.trim() || !row.lastName?.trim() || !row.managementCompany?.trim()) {
      skipped++;
      continue;
    }

    const mcId = mcMap.get(row.managementCompany.toLowerCase().trim());
    if (!mcId) {
      skipped++;
      continue;
    }

    let categoryId = categoryMap.get(row.category?.toLowerCase().trim() || "");
    
    // Auto-create category if it doesn't exist
    if (!categoryId && row.category?.trim()) {
      try {
        const newCategory = await db.contactCategory.create({
          data: {
            companyId: membership.companyId,
            name: row.category.trim(),
          },
        });
        categoryId = newCategory.id;
        categoryMap.set(row.category.toLowerCase().trim(), categoryId);
      } catch {
        skipped++;
        continue;
      }
    }

    if (!categoryId) {
      skipped++;
      continue;
    }

    try {
      await db.contact.create({
        data: {
          companyId: membership.companyId,
          managementCompanyId: mcId,
          contactCategoryId: categoryId,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          isPrimary: row.isPrimary ?? false,
          notes: row.notes?.trim() || null,
        },
      });
      imported++;
    } catch (error) {
      console.error("Failed to import contact:", row.firstName, row.lastName, error);
      skipped++;
    }
  }

  revalidatePath("/app/settings/import");
  revalidatePath("/app/contacts");
  return { imported, skipped };
}

// ============================================
// Jobs Import (updated from existing)
// ============================================

type JobImportRow = {
  title: string;
  managementCompany: string;
  building: string;
  unit?: string;
  mechanic?: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
  jobType?: string;
  notes?: string;
};

export async function importJobsAction(
  rows: JobImportRow[]
): Promise<ImportResult> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to import data." };
  }

  if (!rows || rows.length === 0) {
    return { error: "No data to import." };
  }

  const [mcs, buildings, units, mechanics] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true },
    }),
    db.building.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true, managementCompanyId: true },
    }),
    db.unit.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, identifier: true, buildingId: true },
    }),
    db.mechanic.findMany({
      where: { companyId: membership.companyId, isActive: true },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const mcMap = new Map(mcs.map(mc => [mc.name.toLowerCase(), mc.id]));

  const VALID_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];
  const VALID_JOB_TYPES = ["MAINTENANCE", "INSPECTION", "EMERGENCY", "CALLBACK", "OTHER"];

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.title?.trim() || !row.managementCompany?.trim() || !row.building?.trim() || !row.scheduledDate?.trim()) {
      skipped++;
      continue;
    }

    const mcId = mcMap.get(row.managementCompany.toLowerCase().trim());
    if (!mcId) {
      skipped++;
      continue;
    }

    const building = buildings.find(
      b => b.name.toLowerCase() === row.building.toLowerCase().trim() && 
           b.managementCompanyId === mcId
    );
    if (!building) {
      skipped++;
      continue;
    }

    let unitId: string | null = null;
    if (row.unit?.trim()) {
      const unit = units.find(
        u => u.identifier.toLowerCase() === row.unit!.toLowerCase().trim() && 
             u.buildingId === building.id
      );
      unitId = unit?.id || null;
    }

    let mechanicId: string | null = null;
    if (row.mechanic?.trim()) {
      const mechanic = mechanics.find(m => {
        const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
        return fullName === row.mechanic!.toLowerCase().trim();
      });
      mechanicId = mechanic?.id || null;
    }

    // Append T12:00:00 to parse as local noon, avoiding timezone date shift
    const scheduledDate = new Date(row.scheduledDate + "T12:00:00");
    if (isNaN(scheduledDate.getTime())) {
      skipped++;
      continue;
    }

    const priority = VALID_PRIORITIES.includes(row.priority?.toUpperCase() || "") 
      ? row.priority!.toUpperCase() 
      : "NORMAL";
    const jobType = VALID_JOB_TYPES.includes(row.jobType?.toUpperCase() || "") 
      ? row.jobType!.toUpperCase() 
      : "MAINTENANCE";

    try {
      const seq = await db.jobSequence.upsert({
        where: { companyId: membership.companyId },
        create: { companyId: membership.companyId, nextNumber: 2 },
        update: { nextNumber: { increment: 1 } },
      });

      const jobCode = `J-${(seq.nextNumber - 1).toString().padStart(6, "0")}`;

      await db.scheduledJob.create({
        data: {
          companyId: membership.companyId,
          jobCode,
          title: row.title.trim(),
          managementCompanyId: mcId,
          buildingId: building.id,
          unitId,
          mechanicId,
          scheduledDate,
          scheduledStartTime: row.startTime?.trim() || null,
          scheduledEndTime: row.endTime?.trim() || null,
          priority: priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
          jobType: jobType as "MAINTENANCE" | "INSPECTION" | "EMERGENCY" | "CALLBACK" | "OTHER",
          notes: row.notes?.trim() || null,
        },
      });
      imported++;
    } catch (error) {
      console.error("Failed to import job:", row.title, error);
      skipped++;
    }
  }

  revalidatePath("/app/settings/import");
  revalidatePath("/app/jobs");
  return { imported, skipped };
}
