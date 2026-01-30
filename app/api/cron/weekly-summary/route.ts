import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { WeeklySummaryEmail } from "@/lib/email-templates";
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
    companiesProcessed: 0,
    emailsSent: 0,
    errors: [] as string[],
  };

  try {
    // Calculate week range (previous 7 days)
    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    // Get all companies
    const companies = await db.company.findMany({
      select: { id: true, name: true },
    });

    for (const company of companies) {
      results.companiesProcessed++;

      // Get recipients who want weekly summaries
      const recipients = await getNotificationRecipients(
        company.id,
        "weeklySummary",
        ["OWNER", "ADMIN", "MEMBER"] // All members can opt in
      );

      if (recipients.length === 0) continue;

      // Calculate stats for this company
      const [
        jobsCompleted,
        jobsScheduled,
        maintenanceCompleted,
        emergencyCalls,
        inspectionsDue,
        totalUnits,
        compliantUnits,
      ] = await Promise.all([
        // Jobs completed this week
        db.scheduledJob.count({
          where: {
            companyId: company.id,
            status: "COMPLETED",
            completedAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        // Jobs scheduled (still pending)
        db.scheduledJob.count({
          where: {
            companyId: company.id,
            status: "SCHEDULED",
            archivedAt: null,
          },
        }),
        // Maintenance completed this week
        db.maintenance.count({
          where: {
            companyId: company.id,
            status: "COMPLETED",
            maintenanceDate: { gte: weekStart, lte: weekEnd },
          },
        }),
        // Emergency calls this week
        db.emergencyCall.count({
          where: {
            companyId: company.id,
            callInAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        // Inspections due in next 30 days
        db.inspection.count({
          where: {
            companyId: company.id,
            expirationDate: {
              gte: now,
              lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
            archivedAt: null,
          },
        }),
        // Total active units
        db.unit.count({
          where: {
            companyId: company.id,
            isActive: true,
            archivedAt: null,
          },
        }),
        // Units with valid inspection (not expired)
        db.unit.count({
          where: {
            companyId: company.id,
            isActive: true,
            archivedAt: null,
            inspections: {
              some: {
                expirationDate: { gte: now },
                archivedAt: null,
              },
            },
          },
        }),
      ]);

      const complianceRate = totalUnits > 0 
        ? Math.round((compliantUnits / totalUnits) * 100) 
        : 100;

      const stats = {
        jobsCompleted,
        jobsScheduled,
        maintenanceCompleted,
        emergencyCalls,
        inspectionsDue,
        complianceRate,
      };

      // Format dates for email
      const weekStartDate = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const weekEndDate = weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // Send emails to all opted-in recipients
      for (const recipient of recipients) {
        try {
          const emailHtml = await render(
            WeeklySummaryEmail({
              recipientName: recipient.name,
              companyName: company.name,
              weekStartDate,
              weekEndDate,
              stats,
            })
          );

          await sendEmail({
            to: recipient.email,
            subject: `📊 Weekly Summary - ${company.name} (${weekStartDate} - ${weekEndDate})`,
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

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Weekly summary cron failed:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
