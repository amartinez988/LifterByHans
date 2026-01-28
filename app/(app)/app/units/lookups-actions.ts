"use server";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { unitLookupSchema } from "@/lib/validators";

type LookupResult = { error?: string; item?: { id: string; name: string } };

async function createLookup(
  type: "category" | "status" | "equipment" | "brand",
  values: unknown
): Promise<LookupResult> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create lookups." };
  }

  const parsed = unitLookupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  try {
    if (type === "category") {
      const record = await db.unitCategory.create({
        data: {
          companyId: membership.companyId,
          name: parsed.data.name,
          description: parsed.data.description || null
        }
      });
      return { item: { id: record.id, name: record.name } };
    }
    if (type === "status") {
      const record = await db.unitStatus.create({
        data: {
          companyId: membership.companyId,
          name: parsed.data.name,
          description: parsed.data.description || null
        }
      });
      return { item: { id: record.id, name: record.name } };
    }
    if (type === "equipment") {
      const record = await db.unitEquipmentType.create({
        data: {
          companyId: membership.companyId,
          name: parsed.data.name,
          description: parsed.data.description || null
        }
      });
      return { item: { id: record.id, name: record.name } };
    }
    const record = await db.unitBrand.create({
      data: {
        companyId: membership.companyId,
        name: parsed.data.name,
        description: parsed.data.description || null
      }
    });
    return { item: { id: record.id, name: record.name } };
  } catch (error) {
    return { error: "Unable to create lookup. Check for duplicates." };
  }
}

export async function createUnitCategoryAction(values: unknown) {
  return createLookup("category", values);
}

export async function createUnitStatusAction(values: unknown) {
  return createLookup("status", values);
}

export async function createUnitEquipmentTypeAction(values: unknown) {
  return createLookup("equipment", values);
}

export async function createUnitBrandAction(values: unknown) {
  return createLookup("brand", values);
}
