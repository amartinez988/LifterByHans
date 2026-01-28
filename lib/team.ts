import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getCurrentMembership() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const membership = await db.companyMember.findFirst({
    where: { userId: session.user.id },
    include: {
      company: true,
      user: true
    }
  });

  return { session, membership };
}

export function canManageTeam(role?: string | null) {
  return role === "OWNER" || role === "ADMIN";
}

export function canEditWorkspace(role?: string | null) {
  return role === "OWNER" || role === "ADMIN";
}
