"use server";

import crypto from "crypto";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_EXPIRY_HOURS = 1;

export async function forgotPasswordAction(email: string): Promise<{ error?: string }> {
  // Always return success to prevent email enumeration
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    // Don't reveal if email exists
    return {};
  }

  // Delete any existing reset tokens for this email
  await db.passwordResetToken.deleteMany({
    where: { email: email.toLowerCase() }
  });

  // Create new reset token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + RESET_EXPIRY_HOURS);

  await db.passwordResetToken.create({
    data: {
      email: email.toLowerCase(),
      token,
      expiresAt
    }
  });

  // Send email
  try {
    await sendPasswordResetEmail(email, token);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { error: "Failed to send email. Please try again." };
  }

  return {};
}
