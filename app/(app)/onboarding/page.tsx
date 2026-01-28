import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const existingMembership = await db.companyMember.findFirst({
    where: { userId: session.user.id }
  });

  if (existingMembership) {
    redirect("/app");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create your company workspace</CardTitle>
          <CardDescription>
            Give your company a name. You can refine details after launch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
