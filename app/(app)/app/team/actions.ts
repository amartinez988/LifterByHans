"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { canManageTeam, getCurrentMembership } from "@/lib/team";
import { inviteSchema } from "@/lib/validators";

export type InviteActionState = {
  error?: string;
  inviteLink?: string;
};

const INVITE_EXPIRY_DAYS = 7;

export async function createInviteAction(
  values: unknown
): Promise<InviteActionState> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canManageTeam(membership.role)) {
    return { error: "You do not have permission to invite members." };
  }

  const parsed = inviteSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const { email, role } = parsed.data;
  const existingMember = await db.companyMember.findFirst({
    where: {
      companyId: membership.companyId,
      user: { email }
    }
  });

  if (existingMember) {
    return { error: "That user is already part of the workspace." };
  }

  const pendingInvite = await db.companyInvite.findFirst({
    where: {
      companyId: membership.companyId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (pendingInvite) {
    return { error: "An active invite already exists for that email." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  await db.companyInvite.create({
    data: {
      companyId: membership.companyId,
      email,
      role,
      token,
      expiresAt,
      createdByUserId: membership.userId
    }
  });

  revalidatePath("/app/team");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000";
  return { inviteLink: `${baseUrl}/invite/${token}` };
}

export async function updateMemberRoleAction(
  memberId: string,
  role: "ADMIN" | "MEMBER"
): Promise<void> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canManageTeam(membership.role)) {
    return;
  }

  const target = await db.companyMember.findUnique({
    where: { id: memberId }
  });

  if (!target || target.companyId !== membership.companyId) {
    return;
  }

  if (target.role === "OWNER") {
    return;
  }

  await db.companyMember.update({
    where: { id: memberId },
    data: { role: role as "ADMIN" | "MEMBER" }
  });

  revalidatePath("/app/team");
}

export async function removeMemberAction(memberId: string): Promise<void> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canManageTeam(membership.role)) {
    return;
  }

  const target = await db.companyMember.findUnique({
    where: { id: memberId }
  });

  if (!target || target.companyId !== membership.companyId) {
    return;
  }

  if (target.userId === membership.userId) {
    return;
  }

  if (target.role === "OWNER") {
    return;
  }

  await db.companyMember.delete({
    where: { id: memberId }
  });

  revalidatePath("/app/team");
}

export async function revokeInviteAction(inviteId: string): Promise<void> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canManageTeam(membership.role)) {
    return;
  }

  const invite = await db.companyInvite.findUnique({
    where: { id: inviteId }
  });

  if (!invite || invite.companyId !== membership.companyId) {
    return;
  }

  await db.companyInvite.delete({
    where: { id: inviteId }
  });

  revalidatePath("/app/team");
}
