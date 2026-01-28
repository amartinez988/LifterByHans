"use server";

import bcrypt from "bcrypt";

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { signInSchema, signUpSchema } from "@/lib/validators";

export type AuthActionState = {
  error?: string;
};

export async function signUpAction(
  values: unknown,
  callbackUrl?: string | null
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account already exists for that email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      name,
      email,
      passwordHash
    }
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/onboarding"
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AuthError") {
      return { error: "Unable to sign in. Please try again." };
    }
    throw error;
  }

  return {};
}

export async function signInAction(
  values: unknown,
  callbackUrl?: string | null
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const { email, password } = parsed.data;

  // Check if user exists before attempting sign in
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "No account found with that email address." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/app"
    });
  } catch (error) {
    // NextAuth throws NEXT_REDIRECT on successful sign in, which we should propagate
    if (error instanceof Error && error.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    // Handle all authentication errors (CredentialsSignin, AuthError, etc.)
    if (error instanceof Error) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return {};
}
