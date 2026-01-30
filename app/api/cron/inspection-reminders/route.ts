import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { InspectionReminderEmail } from "@/lib/email-templates";
import { getNotificationRecipients } from "@/lib/notifications";

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  // If no secret configured, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV === "development";
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    checked: 0,
    emailsSent: 0,
    errors: [] as string[],
  };

  try {
    // Find inspections expiring in 7, 14, or 30 days
    const reminderDays = [7, 14, 30];
    
    for (const days of reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      
      // Set to start and end of that day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find inspections expiring on that specific day
      const expiringInspections = await db.inspection.findMany({
        where: {
          expirationDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          archivedAt: null,
        },
        include: {
          company: true,
          managementCompany: true,
          building: true,
          unit: true,
        },
      });

      results.checked += expiringInspections.length;

      for (const inspection of expiringInspections) {
        // Get primary contacts for this management company
        const [primaryContacts, notificationRecipients] = await Promise.all([
          db.contact.findMany({
            where: {
              managementCompanyId: inspection.managementCompanyId,
              isPrimary: true,
              email: { not: null },
              archivedAt: null,
            },
          }),
          getNotificationRecipients(inspection.companyId, "inspectionReminders")
        ]);

        // Collect recipients, avoiding duplicates
        const recipients: { email: string; name: string }[] = [];
        const seenEmails = new Set<string>();

        for (const contact of primaryContacts) {
          if (contact.email && !seenEmails.has(contact.email)) {
            seenEmails.add(contact.email);
            recipients.push({
              email: contact.email,
              name: `${contact.firstName} ${contact.lastName}`,
            });
          }
        }

        for (const recipient of notificationRecipients) {
          if (!seenEmails.has(recipient.email)) {
            seenEmails.add(recipient.email);
            recipients.push(recipient);
          }
        }

        // Send emails
        for (const recipient of recipients) {
          try {
            const emailHtml = await render(
              InspectionReminderEmail({
                recipientName: recipient.name,
                companyName: inspection.company.name,
                unitIdentifier: inspection.unit.identifier,
                buildingName: inspection.building.name,
                buildingAddress: inspection.building.address,
                expirationDate: inspection.expirationDate!.toLocaleDateString(),
                daysUntilExpiration: days,
                inspectionCode: inspection.inspectionCode,
              })
            );

            await sendEmail({
              to: recipient.email,
              subject: `⚠️ Inspection Expiring in ${days} Days - ${inspection.unit.identifier} at ${inspection.building.name}`,
              html: emailHtml,
            });

            results.emailsSent++;
          } catch (emailError) {
            const errorMsg = `Failed to send to ${recipient.email}: ${emailError}`;
            console.error(errorMsg);
            results.errors.push(errorMsg);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Inspection reminder cron failed:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
