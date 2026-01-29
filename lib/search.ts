import { Prisma } from "@prisma/client";

/**
 * Build a case-insensitive search condition for multiple fields
 */
export function buildSearchCondition(
  query: string | undefined,
  fields: string[]
): Prisma.Sql | undefined {
  if (!query?.trim()) return undefined;
  
  const searchTerm = `%${query.trim()}%`;
  
  // Build OR conditions for each field
  const conditions = fields.map(field => {
    return Prisma.sql`${Prisma.raw(field)} ILIKE ${searchTerm}`;
  });
  
  return Prisma.sql`(${Prisma.join(conditions, " OR ")})`;
}

/**
 * Generic search filter for Prisma that works with contains
 */
export function getSearchFilter(
  query: string | undefined,
  fields: string[]
): Record<string, unknown> | undefined {
  if (!query?.trim()) return undefined;
  
  const searchTerm = query.trim();
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: "insensitive"
      }
    }))
  };
}
