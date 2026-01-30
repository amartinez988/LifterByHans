"use server";

import bcrypt from "bcrypt";

import { db } from "@/lib/db";

export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<{ error?: string }> {
  // Find and validate token
  const resetToken = await db.passwordResetToken.findUnique({
    where: { token }
  });

  if (!resetToken) {
    return { error: "Invalid reset link." };
  }

  if (resetToken.expiresAt < new Date()) {
    // Clean up expired token
    await db.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { error: "Reset link has expired. Please request a new one." };
  }

  // Find user
  const user = await db.user.findUnique({
    where: { email: resetToken.email }
  });

  if (!user) {
    return { error: "User not found." };
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update user password and delete token
  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { passwordHash }
    }),
    db.passwordResetToken.delete({
      where: { id: resetToken.id }
    })
  ]);

  return {};
}
