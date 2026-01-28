import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

type InvitePageProps = {
  params: { token: string };
};

export default async function InvitePage({ params }: InvitePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${params.token}`)}`);
  }

  const invite = await db.companyInvite.findUnique({
    where: { token: params.token },
    include: { company: true }
  });

  if (!invite) {
    return (
      <Card className="mx-auto mt-10 max-w-xl">
        <CardHeader>
          <CardTitle>Invite not found</CardTitle>
          <CardDescription>The invite link is invalid.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/app">Return to app</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (invite.acceptedAt) {
    return (
      <Card className="mx-auto mt-10 max-w-xl">
        <CardHeader>
          <CardTitle>Invite already used</CardTitle>
          <CardDescription>This invite link has already been accepted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/app">Go to app</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (invite.expiresAt <= new Date()) {
    return (
      <Card className="mx-auto mt-10 max-w-xl">
        <CardHeader>
          <CardTitle>Invite expired</CardTitle>
          <CardDescription>Ask the team owner for a new invite.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/app">Return to app</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (session.user.email && session.user.email !== invite.email) {
    return (
      <Card className="mx-auto mt-10 max-w-xl">
        <CardHeader>
          <CardTitle>Email mismatch</CardTitle>
          <CardDescription>
            This invite was sent to {invite.email}. Log in with that email to accept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/app">Return to app</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const existingMembership = await db.companyMember.findFirst({
    where: {
      companyId: invite.companyId,
      userId: session.user.id
    }
  });

  if (existingMembership) {
    redirect("/app");
  }

  await db.$transaction([
    db.companyMember.create({
      data: {
        companyId: invite.companyId,
        userId: session.user.id,
        role: invite.role
      }
    }),
    db.companyInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() }
    })
  ]);

  redirect("/app");
}
