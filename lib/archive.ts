export type ArchiveFilterValue = "active" | "archived" | "all";

// Helper function to get archive filter where clause for Prisma queries
export function getArchiveWhereClause(filter: ArchiveFilterValue | string | undefined) {
  const filterValue = (filter as ArchiveFilterValue) || "active";

  switch (filterValue) {
    case "archived":
      return { archivedAt: { not: null } };
    case "all":
      return {};
    case "active":
    default:
      return { archivedAt: null };
  }
}

// Helper function for isActive-based filtering (mechanics, inspectors)
export function getActiveWhereClause(filter: ArchiveFilterValue | string | undefined) {
  const filterValue = (filter as ArchiveFilterValue) || "active";

  switch (filterValue) {
    case "archived":
      return { isActive: false };
    case "all":
      return {};
    case "active":
    default:
      return { isActive: true };
  }
}
