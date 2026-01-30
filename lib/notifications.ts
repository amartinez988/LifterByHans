import { db } from "@/lib/db";

export type NotificationType = 
  | "jobStatusUpdates"
  | "emergencyAlerts"
  | "inspectionReminders"
  | "weeklySummary";

/**
 * Check if a user wants to receive a specific type of notification.
 * Returns true by default if no preferences are set.
 */
export async function shouldSendNotification(
  userId: string,
  companyId: string,
  notificationType: NotificationType
): Promise<boolean> {
  const membership = await db.companyMember.findUnique({
    where: {
      companyId_userId: {
        companyId,
        userId,
      },
    },
    include: {
      notificationPreferences: true,
    },
  });

  if (!membership) {
    return false; // User not a member of this company
  }

  const prefs = membership.notificationPreferences;

  // Default to true if no preferences set
  if (!prefs) {
    return true;
  }

  return prefs[notificationType];
}

/**
 * Get all users who should receive a notification for a company.
 * Filters by role and notification preference.
 */
export async function getNotificationRecipients(
  companyId: string,
  notificationType: NotificationType,
  roles: ("OWNER" | "ADMIN" | "MEMBER")[] = ["OWNER", "ADMIN"]
): Promise<{ userId: string; email: string; name: string }[]> {
  const members = await db.companyMember.findMany({
    where: {
      companyId,
      role: { in: roles },
    },
    include: {
      user: true,
      notificationPreferences: true,
    },
  });

  return members
    .filter((member) => {
      const prefs = member.notificationPreferences;
      // Default to true if no preferences set
      return prefs ? prefs[notificationType] : true;
    })
    .map((member) => ({
      userId: member.userId,
      email: member.user.email,
      name: member.user.name,
    }));
}
