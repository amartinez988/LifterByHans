"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import CopyButton from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteSchema } from "@/lib/validators";
import { createInviteAction } from "./actions";

type InviteValues = z.infer<typeof inviteSchema>;

export default function InviteForm() {
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "MEMBER"
    }
  });

  const onSubmit = (values: InviteValues) => {
    setError(null);
    setInviteLink(null);
    startTransition(async () => {
      const result = await createInviteAction(values);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.inviteLink) {
        setInviteLink(result.inviteLink);
        form.reset({ email: "", role: values.role });
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-ember">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("role")}
          >
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
      </div>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      {inviteLink ? (
        <div className="rounded-2xl border border-ink/10 bg-haze p-4 text-sm text-ink">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Invite link</p>
          <p className="mt-2 break-all">{inviteLink}</p>
          <div className="mt-3">
            <CopyButton text={inviteLink} />
          </div>
        </div>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create invite"}
      </Button>
    </form>
  );
}
