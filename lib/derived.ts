export type InspectionComplianceStatus = "VALID" | "EXPIRING_SOON" | "OVERDUE" | "MISSING";
export type EmergencyDerivedStatus = "OPEN" | "CLOSED";
export type MaintenanceActivityStatus = "OPEN" | "RECENT" | "STALE";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

export function getInspectionComplianceStatus(
  expirationDate: Date | null | undefined,
  hasInspection: boolean,
  now = new Date()
): InspectionComplianceStatus {
  if (!hasInspection || !expirationDate) {
    return "MISSING";
  }

  const today = startOfDay(now);
  const exp = startOfDay(expirationDate);
  const soonThreshold = addDays(today, 30);

  if (exp > soonThreshold) {
    return "VALID";
  }
  if (exp >= today) {
    return "EXPIRING_SOON";
  }
  return "OVERDUE";
}

export function getEmergencyDerivedStatus(completedAt?: Date | null): EmergencyDerivedStatus {
  return completedAt ? "CLOSED" : "OPEN";
}

export function getMaintenanceActivityStatus(
  maintenanceDate: Date,
  status: "OPEN" | "COMPLETED"
): MaintenanceActivityStatus {
  if (status === "OPEN") {
    return "OPEN";
  }

  const now = new Date();
  const diffMs = now.getTime() - maintenanceDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 7) {
    return "RECENT";
  }
  if (diffDays > 30) {
    return "STALE";
  }
  return "RECENT";
}
