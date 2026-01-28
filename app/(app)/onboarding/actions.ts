"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { onboardingSchema } from "@/lib/validators";

export type OnboardingActionState = {
  error?: string;
};

export async function createCompanyAction(
  values: unknown
): Promise<OnboardingActionState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return { error: "User account not found." };
  }

  const existingMembership = await db.companyMember.findFirst({
    where: { userId: user.id }
  });
  if (existingMembership) {
    return { error: "Workspace already exists." };
  }

  const company = await db.company.create({
    data: {
      name: parsed.data.companyName,
      ownerId: user.id
    }
  });

  await db.companyMember.create({
    data: {
      companyId: company.id,
      userId: user.id,
      role: "OWNER"
    }
  });

  redirect("/app");
}
