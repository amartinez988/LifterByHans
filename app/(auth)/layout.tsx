import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (session?.user) {
    const membership = await db.companyMember.findFirst({
      where: { userId: session.user.id }
    });
    if (membership) {
      redirect("/app");
    }
    redirect("/onboarding");
  }

  return <div className="min-h-screen px-6 py-12">{children}</div>;
}
