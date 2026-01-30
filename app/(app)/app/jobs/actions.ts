"use server";

import { redirect } from "next/navigation";
import { render } from "@react-email/render";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { JobStatusUpdateEmail } from "@/lib/email-templates";
import { getNotificationRecipients } from "@/lib/notifications";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { scheduledJobSchema } from "@/lib/validators";

export type JobActionState = {
  error?: string;
};

function formatJobCode(value: number) {
  return `J-${value.toString().padStart(6, "0")}`;
}

export async function createJobAction(
  values: unknown
): Promise<JobActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create jobs." };
  }

  const parsed = scheduledJobSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const [managementCompany, building, unit, mechanic] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: parsed.data.managementCompanyId } }),
    db.building.findUnique({ where: { id: parsed.data.buildingId } }),
    parsed.data.unitId ? db.unit.findUnique({ where: { id: parsed.data.unitId } }) : null,
    parsed.data.mechanicId ? db.mechanic.findUnique({ where: { id: parsed.data.mechanicId } }) : null
  ]);

  if (
    !managementCompany ||
    managementCompany.companyId !== membership.companyId ||
    !building ||
    building.companyId !== membership.companyId ||
    building.managementCompanyId !== managementCompany.id ||
    (unit && (unit.companyId !== membership.companyId || unit.buildingId !== building.id)) ||
    (mechanic && mechanic.companyId !== membership.companyId)
  ) {
    return { error: "Invalid job relationships." };
  }

  const scheduledDate = new Date(parsed.data.scheduledDate);
  if (Number.isNaN(scheduledDate.getTime())) {
    return { error: "Invalid scheduled date." };
  }

  let jobId: string | null = null;
  try {
    await db.$transaction(async (tx) => {
      const seq = await tx.jobSequence.upsert({
        where: { companyId: membership.companyId },
        create: { companyId: membership.companyId, nextNumber: 2 },
        update: { nextNumber: { increment: 1 } }
      });

      const jobCode = formatJobCode(seq.nextNumber - 1);

      const job = await tx.scheduledJob.create({
        data: {
          companyId: membership.companyId,
          jobCode,
          title: parsed.data.title,
          description: parsed.data.description || null,
          managementCompanyId: managementCompany.id,
          buildingId: building.id,
          unitId: unit ? unit.id : null,
          mechanicId: mechanic ? mechanic.id : null,
          scheduledDate,
          scheduledStartTime: parsed.data.scheduledStartTime || null,
          scheduledEndTime: parsed.data.scheduledEndTime || null,
          status: parsed.data.status ?? "SCHEDULED",
          priority: parsed.data.priority ?? "NORMAL",
          jobType: parsed.data.jobType ?? "MAINTENANCE",
          notes: parsed.data.notes || null
        }
      });

      jobId = job.id;
    });
  } catch (error) {
    return { error: "Unable to create job. Check for duplicates." };
  }

  redirect(`/app/jobs/${jobId}`);
}

export async function updateJobAction(
  jobId: string,
  values: unknown
): Promise<JobActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update jobs." };
  }

  const parsed = scheduledJobSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.scheduledJob.findUnique({
    where: { id: jobId }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Job not found." };
  }

  const [managementCompany, building, unit, mechanic] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: parsed.data.managementCompanyId } }),
    db.building.findUnique({ where: { id: parsed.data.buildingId } }),
    parsed.data.unitId ? db.unit.findUnique({ where: { id: parsed.data.unitId } }) : null,
    parsed.data.mechanicId ? db.mechanic.findUnique({ where: { id: parsed.data.mechanicId } }) : null
  ]);

  if (
    !managementCompany ||
    managementCompany.companyId !== membership.companyId ||
    !building ||
    building.companyId !== membership.companyId ||
    building.managementCompanyId !== managementCompany.id ||
    (unit && (unit.companyId !== membership.companyId || unit.buildingId !== building.id)) ||
    (mechanic && mechanic.companyId !== membership.companyId)
  ) {
    return { error: "Invalid job relationships." };
  }

  const scheduledDate = new Date(parsed.data.scheduledDate);
  if (Number.isNaN(scheduledDate.getTime())) {
    return { error: "Invalid scheduled date." };
  }

  try {
    await db.scheduledJob.update({
      where: { id: jobId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        managementCompanyId: managementCompany.id,
        buildingId: building.id,
        unitId: unit ? unit.id : null,
        mechanicId: mechanic ? mechanic.id : null,
        scheduledDate,
        scheduledStartTime: parsed.data.scheduledStartTime || null,
        scheduledEndTime: parsed.data.scheduledEndTime || null,
        status: parsed.data.status ?? "SCHEDULED",
        priority: parsed.data.priority ?? "NORMAL",
        jobType: parsed.data.jobType ?? "MAINTENANCE",
        notes: parsed.data.notes || null
      }
    });
  } catch (error) {
    return { error: "Unable to update job." };
  }

  return {};
}

export async function updateJobStatusAction(
  jobId: string,
  status: "SCHEDULED" | "EN_ROUTE" | "ON_SITE" | "COMPLETED" | "CANCELLED"
): Promise<JobActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership) {
    return { error: "Not authenticated." };
  }

  const existing = await db.scheduledJob.findUnique({
    where: { id: jobId },
    include: {
      building: true,
      unit: true,
      mechanic: true,
      managementCompany: true,
      company: true,
    }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Job not found." };
  }

  const oldStatus = existing.status;

  // Members can only update status on jobs assigned to them (by mechanic match)
  // For now, allow all members to update status. Role-based mechanic matching can be added later.
  
  const updateData: { status: typeof status; completedAt?: Date | null } = { status };
  
  if (status === "COMPLETED") {
    updateData.completedAt = new Date();
  } else if (existing.status === "COMPLETED") {
    // Moving away from COMPLETED status, clear the completedAt timestamp
    updateData.completedAt = null;
  }

  try {
    await db.scheduledJob.update({
      where: { id: jobId },
      data: updateData
    });

    // Send email notifications to:
    // 1. Primary contacts of the management company
    // 2. Company members who have opted in for job status updates
    const [primaryContacts, notificationRecipients] = await Promise.all([
      db.contact.findMany({
        where: {
          managementCompanyId: existing.managementCompanyId,
          isPrimary: true,
          email: { not: null },
          archivedAt: null,
        }
      }),
      getNotificationRecipients(existing.companyId, "jobStatusUpdates")
    ]);

    // Combine recipients, avoiding duplicates
    const allRecipients: { email: string; name: string }[] = [];
    const seenEmails = new Set<string>();

    for (const contact of primaryContacts) {
      if (contact.email && !seenEmails.has(contact.email)) {
        seenEmails.add(contact.email);
        allRecipients.push({
          email: contact.email,
          name: `${contact.firstName} ${contact.lastName}`,
        });
      }
    }

    for (const recipient of notificationRecipients) {
      if (!seenEmails.has(recipient.email)) {
        seenEmails.add(recipient.email);
        allRecipients.push(recipient);
      }
    }

    for (const recipient of allRecipients) {
      try {
        const emailHtml = await render(
          JobStatusUpdateEmail({
            recipientName: recipient.name,
            companyName: existing.company.name,
            jobCode: existing.jobCode,
            jobTitle: existing.title,
            oldStatus: oldStatus,
            newStatus: status,
            buildingName: existing.building.name,
            buildingAddress: existing.building.address,
            unitIdentifier: existing.unit?.identifier,
            mechanicName: existing.mechanic 
              ? `${existing.mechanic.firstName} ${existing.mechanic.lastName}` 
              : undefined,
            scheduledDate: existing.scheduledDate.toLocaleDateString(),
            notes: existing.notes ?? undefined,
          })
        );

        await sendEmail({
          to: recipient.email,
          subject: `Job ${existing.jobCode} - Status Update: ${status.replace("_", " ")}`,
          html: emailHtml,
        });
      } catch (emailError) {
        // Log but don't fail the action if email fails
        console.error("Failed to send job status email:", emailError);
      }
    }
  } catch (error) {
    return { error: "Unable to update job status." };
  }

  return {};
}

export async function assignMechanicAction(
  jobId: string,
  mechanicId: string | null
): Promise<JobActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to assign mechanics." };
  }

  const existing = await db.scheduledJob.findUnique({
    where: { id: jobId }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Job not found." };
  }

  if (mechanicId) {
    const mechanic = await db.mechanic.findUnique({ where: { id: mechanicId } });
    if (!mechanic || mechanic.companyId !== membership.companyId) {
      return { error: "Mechanic not found." };
    }
  }

  try {
    await db.scheduledJob.update({
      where: { id: jobId },
      data: { mechanicId }
    });
  } catch (error) {
    return { error: "Unable to assign mechanic." };
  }

  return {};
}

export async function archiveJobAction(
  id: string
): Promise<JobActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive jobs." };
  }

  const job = await db.scheduledJob.findUnique({
    where: { id }
  });

  if (!job || job.companyId !== membership.companyId) {
    return { error: "Job not found." };
  }

  await db.scheduledJob.update({
    where: { id },
    data: { archivedAt: new Date() }
  });

  return {};
}

export async function restoreJobAction(
  id: string
): Promise<JobActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore jobs." };
  }

  const job = await db.scheduledJob.findUnique({
    where: { id }
  });

  if (!job || job.companyId !== membership.companyId) {
    return { error: "Job not found." };
  }

  await db.scheduledJob.update({
    where: { id },
    data: { archivedAt: null }
  });

  return {};
}

export async function completeJobAndCreateMaintenanceAction(
  jobId: string
): Promise<JobActionState & { maintenanceId?: string }> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to complete jobs." };
  }

  const job = await db.scheduledJob.findUnique({
    where: { id: jobId },
    include: {
      building: true,
      unit: true
    }
  });

  if (!job || job.companyId !== membership.companyId) {
    return { error: "Job not found." };
  }

  if (!job.unitId) {
    return { error: "Job must have a unit assigned to create maintenance record." };
  }

  let maintenanceId: string | null = null;

  try {
    await db.$transaction(async (tx) => {
      // Get maintenance sequence
      const seq = await tx.maintenanceSequence.upsert({
        where: { companyId: membership.companyId },
        create: { companyId: membership.companyId, nextNumber: 2 },
        update: { nextNumber: { increment: 1 } }
      });

      const maintenanceCode = `M-${(seq.nextNumber - 1).toString().padStart(6, "0")}`;

      // Create maintenance record
      const maintenance = await tx.maintenance.create({
        data: {
          companyId: membership.companyId,
          maintenanceCode,
          managementCompanyId: job.managementCompanyId,
          buildingId: job.buildingId,
          unitId: job.unitId!,
          mechanicId: job.mechanicId,
          status: "COMPLETED",
          maintenanceDate: new Date(),
          notes: [job.description, job.notes].filter(Boolean).join("\n\n") || null
        }
      });

      maintenanceId = maintenance.id;

      // Update job with maintenance link and completed status
      await tx.scheduledJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          maintenanceId: maintenance.id
        }
      });
    });
  } catch (error) {
    return { error: "Unable to complete job and create maintenance record." };
  }

  return { maintenanceId: maintenanceId! };
}
