"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { setTesterStatus, extendTrial, createTrialSubscription } from "@/lib/subscription";

// List of admin email addresses
const ADMIN_EMAILS = [
  "a.martinez988@gmail.com", // Add your email here
  // Add more admin emails as needed
];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export async function setTesterStatusAction(
  companyId: string,
  isTester: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await setTesterStatus(companyId, isTester);
    revalidatePath("/app/admin");
    return { success: true };
  } catch (error) {
    console.error("Set tester status error:", error);
    return { success: false, error: String(error) };
  }
}

export async function extendTrialAction(
  companyId: string,
  days: number
): Promise<{ success: boolean; newTrialEndsAt?: string; error?: string }> {
  try {
    await requireAdmin();
    
    if (days < 1 || days > 365) {
      return { success: false, error: "Days must be between 1 and 365" };
    }

    const newTrialEndsAt = await extendTrial(companyId, days);
    revalidatePath("/app/admin");
    return { success: true, newTrialEndsAt: newTrialEndsAt.toISOString() };
  } catch (error) {
    console.error("Extend trial error:", error);
    return { success: false, error: String(error) };
  }
}

export async function createSubscriptionAction(
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    // Check if subscription already exists
    const existing = await db.subscription.findUnique({
      where: { companyId },
    });

    if (existing) {
      return { success: false, error: "Subscription already exists" };
    }

    await createTrialSubscription(companyId);
    revalidatePath("/app/admin");
    return { success: true };
  } catch (error) {
    console.error("Create subscription error:", error);
    return { success: false, error: String(error) };
  }
}
