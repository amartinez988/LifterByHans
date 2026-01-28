import { redirect } from "next/navigation";

import CopyButton from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canManageTeam, getCurrentMembership } from "@/lib/team";

import InviteForm from "./invite-form";
import { removeMemberAction, revokeInviteAction, updateMemberRoleAction } from "./actions";

export default async function TeamPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canManageTeam(membership.role)) {
    redirect("/app");
  }

  const [members, invites] = await Promise.all([
    db.companyMember.findMany({
      where: { companyId: membership.companyId },
      include: { user: true },
      orderBy: { createdAt: "asc" }
    }),
    db.companyInvite.findMany({
      where: { companyId: membership.companyId },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000";
  const now = new Date();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Team</p>
        <h2 className="font-display text-3xl text-ink">Workspace members</h2>
        <p className="text-sm text-ink/70">
          Invite teammates with secure links and keep roles aligned.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite new member</CardTitle>
          <CardDescription>
            Create a one-time invite link for an admin or member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current members</CardTitle>
          <CardDescription>{members.length} active seats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{member.user.name}</p>
                <p className="text-sm text-ink/60">{member.user.email}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
                  {member.role}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {member.role !== "OWNER" ? (
                  <>
                    <form action={updateMemberRoleAction.bind(null, member.id, "ADMIN")}>
                      <Button type="submit" variant="outline" size="sm">
                        Make admin
                      </Button>
                    </form>
                    <form action={updateMemberRoleAction.bind(null, member.id, "MEMBER")}>
                      <Button type="submit" variant="outline" size="sm">
                        Make member
                      </Button>
                    </form>
                    {member.userId !== membership.userId ? (
                      <form action={removeMemberAction.bind(null, member.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          Remove
                        </Button>
                      </form>
                    ) : null}
                  </>
                ) : (
                  <span className="text-xs uppercase tracking-[0.3em] text-ink/60">
                    Protected
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending invites</CardTitle>
          <CardDescription>
            Manage active links or revoke stale invitations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invites.length === 0 ? (
            <p className="text-sm text-ink/60">No invites yet.</p>
          ) : (
            invites.map((invite) => {
              const isExpired = invite.expiresAt <= now;
              const isAccepted = Boolean(invite.acceptedAt);
              const status = isAccepted ? "Accepted" : isExpired ? "Expired" : "Pending";
              const inviteLink = `${baseUrl}/invite/${invite.token}`;

              return (
                <div
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{invite.email}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
                      {invite.role} - {status}
                    </p>
                    <p className="text-xs text-ink/60">
                      Expires {invite.expiresAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isAccepted && !isExpired ? <CopyButton text={inviteLink} /> : null}
                    {!isAccepted ? (
                      <form action={revokeInviteAction.bind(null, invite.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          Revoke
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
