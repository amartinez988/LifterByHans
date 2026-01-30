"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function generatePortalLink(
  managementCompanyId: string,
  contactEmail: string,
  contactName: string,
  daysValid: number = 30
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const membership = await db.companyMember.findFirst({
    where: { userId: session.user.id },
    include: { company: true },
  });

  if (!membership) {
    return { error: "No company membership found" };
  }

  // Verify the management company belongs to this company
  const managementCompany = await db.managementCompany.findFirst({
    where: {
      id: managementCompanyId,
      companyId: membership.companyId,
    },
    include: {
      company: true,
    },
  });

  if (!managementCompany) {
    return { error: "Management company not found" };
  }

  // Generate a secure token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);

  // Create the portal access
  const portalAccess = await db.portalAccess.create({
    data: {
      token,
      managementCompanyId,
      contactEmail,
      contactName,
      expiresAt,
    },
  });

  // Generate the portal URL
  const baseUrl = process.env.NEXTAUTH_URL || "https://uplio.app";
  const portalUrl = `${baseUrl}/portal/${token}`;

  // Send email notification
  try {
    await sendEmail({
      to: contactEmail,
      subject: `Portal Access - ${managementCompany.name}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Customer Portal Access</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Hi ${contactName},
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              You've been granted access to view the service status for <strong>${managementCompany.name}</strong>.
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Click the button below to access your portal:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${portalUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Access Your Portal
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              This link will expire on ${expiresAt.toLocaleDateString()}. If you need a new link, please contact your service provider.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Sent by ${membership.company.name} via Uplio
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send portal email:", error);
    // Don't fail the action if email fails
  }

  revalidatePath(`/app/management-companies/${managementCompanyId}`);

  return { 
    success: true, 
    portalUrl,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function revokePortalAccess(portalAccessId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const membership = await db.companyMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) {
    return { error: "No company membership found" };
  }

  // Find the portal access and verify ownership
  const portalAccess = await db.portalAccess.findFirst({
    where: { id: portalAccessId },
    include: {
      managementCompany: true,
    },
  });

  if (!portalAccess || portalAccess.managementCompany.companyId !== membership.companyId) {
    return { error: "Portal access not found" };
  }

  await db.portalAccess.update({
    where: { id: portalAccessId },
    data: { isActive: false },
  });

  revalidatePath(`/app/management-companies/${portalAccess.managementCompanyId}`);

  return { success: true };
}

export async function getPortalAccessList(managementCompanyId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const membership = await db.companyMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) {
    return { error: "No company membership found" };
  }

  const portalAccesses = await db.portalAccess.findMany({
    where: {
      managementCompanyId,
      managementCompany: {
        companyId: membership.companyId,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { data: portalAccesses };
}
