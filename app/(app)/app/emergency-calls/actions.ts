"use server";

import { redirect } from "next/navigation";
import { render } from "@react-email/render";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { EmergencyCallAlertEmail } from "@/lib/email-templates";
import { getNotificationRecipients } from "@/lib/notifications";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";
import { emergencyCallSchema } from "@/lib/validators";

export type EmergencyCallActionState = {
  error?: string;
};

function formatEmergencyCode(value: number) {
  return `E-${value.toString().padStart(6, "0")}`;
}

function parseDateTime(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export async function createEmergencyCallAction(
  values: unknown
): Promise<EmergencyCallActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to create emergency calls." };
  }

  const parsed = emergencyCallSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const [managementCompany, building, unit, mechanic, status] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: parsed.data.managementCompanyId } }),
    db.building.findUnique({ where: { id: parsed.data.buildingId } }),
    db.unit.findUnique({ where: { id: parsed.data.unitId } }),
    parsed.data.mechanicId ? db.mechanic.findUnique({ where: { id: parsed.data.mechanicId } }) : null,
    db.emergencyCallStatus.findUnique({ where: { id: parsed.data.emergencyCallStatusId } })
  ]);

  if (
    !managementCompany ||
    managementCompany.companyId !== membership.companyId ||
    !building ||
    building.companyId !== membership.companyId ||
    building.managementCompanyId !== managementCompany.id ||
    !unit ||
    unit.companyId !== membership.companyId ||
    unit.buildingId !== building.id ||
    (mechanic && mechanic.companyId !== membership.companyId) ||
    !status ||
    status.companyId !== membership.companyId
  ) {
    return { error: "Invalid emergency call relationships." };
  }

  const callInAt = parseDateTime(parsed.data.callInAt);
  if (!callInAt) {
    return { error: "Invalid call-in time." };
  }

  const completedAt = parseDateTime(parsed.data.completedAt);

  let emergencyId: string | null = null;
  let emergencyCode: string | null = null;
  try {
    await db.$transaction(async (tx) => {
      const seq = await tx.emergencyCallSequence.upsert({
        where: { companyId: membership.companyId },
        create: { companyId: membership.companyId, nextNumber: 2 },
        update: { nextNumber: { increment: 1 } }
      });

      emergencyCode = formatEmergencyCode(seq.nextNumber - 1);

      const emergency = await tx.emergencyCall.create({
        data: {
          companyId: membership.companyId,
          emergencyCode,
          ticketNumber: parsed.data.ticketNumber || null,
          managementCompanyId: managementCompany.id,
          buildingId: building.id,
          unitId: unit.id,
          mechanicId: mechanic ? mechanic.id : null,
          emergencyCallStatusId: status.id,
          callInAt,
          completedAt,
          issueDescription: parsed.data.issueDescription,
          notes: parsed.data.notes || null
        }
      });

      emergencyId = emergency.id;
    });

    // Send email alerts to primary contacts and company members who opted in
    const [primaryContacts, notificationRecipients, company] = await Promise.all([
      db.contact.findMany({
        where: {
          managementCompanyId: managementCompany.id,
          isPrimary: true,
          email: { not: null },
          archivedAt: null,
        }
      }),
      getNotificationRecipients(membership.companyId, "emergencyAlerts"),
      db.company.findUnique({
        where: { id: membership.companyId },
      })
    ]);

    // Collect all recipients (primary contacts + opted-in members)
    const recipients: { email: string; name: string }[] = [];
    const seenEmails = new Set<string>();

    for (const contact of primaryContacts) {
      if (contact.email && !seenEmails.has(contact.email)) {
        seenEmails.add(contact.email);
        recipients.push({ 
          email: contact.email, 
          name: `${contact.firstName} ${contact.lastName}` 
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
          EmergencyCallAlertEmail({
            recipientName: recipient.name,
            companyName: company?.name ?? "Your Company",
            emergencyCode: emergencyCode!,
            buildingName: building.name,
            buildingAddress: building.address,
            unitIdentifier: unit.identifier,
            issueDescription: parsed.data.issueDescription,
            callInTime: callInAt.toLocaleString(),
            assignedMechanic: mechanic 
              ? `${mechanic.firstName} ${mechanic.lastName}` 
              : undefined,
          })
        );

        await sendEmail({
          to: recipient.email,
          subject: `🚨 Emergency Call Alert: ${emergencyCode} - ${building.name}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send emergency alert email:", emailError);
      }
    }
  } catch (error) {
    return { error: "Unable to create emergency call. Check for duplicates." };
  }

  redirect(`/app/emergency-calls/${emergencyId}`);
}

export async function updateEmergencyCallAction(
  emergencyId: string,
  values: unknown
): Promise<EmergencyCallActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to update emergency calls." };
  }

  const parsed = emergencyCallSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const existing = await db.emergencyCall.findUnique({
    where: { id: emergencyId }
  });

  if (!existing || existing.companyId !== membership.companyId) {
    return { error: "Emergency call not found." };
  }

  const [managementCompany, building, unit, mechanic, status] = await Promise.all([
    db.managementCompany.findUnique({ where: { id: parsed.data.managementCompanyId } }),
    db.building.findUnique({ where: { id: parsed.data.buildingId } }),
    db.unit.findUnique({ where: { id: parsed.data.unitId } }),
    parsed.data.mechanicId ? db.mechanic.findUnique({ where: { id: parsed.data.mechanicId } }) : null,
    db.emergencyCallStatus.findUnique({ where: { id: parsed.data.emergencyCallStatusId } })
  ]);

  if (
    !managementCompany ||
    managementCompany.companyId !== membership.companyId ||
    !building ||
    building.companyId !== membership.companyId ||
    building.managementCompanyId !== managementCompany.id ||
    !unit ||
    unit.companyId !== membership.companyId ||
    unit.buildingId !== building.id ||
    (mechanic && mechanic.companyId !== membership.companyId) ||
    !status ||
    status.companyId !== membership.companyId
  ) {
    return { error: "Invalid emergency call relationships." };
  }

  const callInAt = parseDateTime(parsed.data.callInAt);
  if (!callInAt) {
    return { error: "Invalid call-in time." };
  }

  const completedAt = parseDateTime(parsed.data.completedAt);

  try {
    await db.emergencyCall.update({
      where: { id: emergencyId },
      data: {
        ticketNumber: parsed.data.ticketNumber || null,
        managementCompanyId: managementCompany.id,
        buildingId: building.id,
        unitId: unit.id,
        mechanicId: mechanic ? mechanic.id : null,
        emergencyCallStatusId: status.id,
        callInAt,
        completedAt,
        issueDescription: parsed.data.issueDescription,
        notes: parsed.data.notes || null
      }
    });
  } catch (error) {
    return { error: "Unable to update emergency call." };
  }

  return {};
}

export async function archiveEmergencyCallAction(
  id: string
): Promise<EmergencyCallActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to archive emergency calls." };
  }

  const emergencyCall = await db.emergencyCall.findUnique({
    where: { id }
  });

  if (!emergencyCall || emergencyCall.companyId !== membership.companyId) {
    return { error: "Emergency call not found." };
  }

  await db.emergencyCall.update({
    where: { id },
    data: { archivedAt: new Date() }
  });

  return {};
}

export async function restoreEmergencyCallAction(
  id: string
): Promise<EmergencyCallActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to restore emergency calls." };
  }

  const emergencyCall = await db.emergencyCall.findUnique({
    where: { id }
  });

  if (!emergencyCall || emergencyCall.companyId !== membership.companyId) {
    return { error: "Emergency call not found." };
  }

  await db.emergencyCall.update({
    where: { id },
    data: { archivedAt: null }
  });

  return {};
}
