"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inspectorSchema } from "@/lib/validators";
import { createInspectorAction, updateInspectorAction } from "./actions";

type InspectorValues = z.infer<typeof inspectorSchema>;

type InspectorFormProps = {
  inspectorId?: string;
  initialValues?: Partial<InspectorValues>;
  readOnly?: boolean;
};

export default function InspectorForm({
  inspectorId,
  initialValues,
  readOnly
}: InspectorFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<InspectorValues>({
    resolver: zodResolver(inspectorSchema),
    defaultValues: {
      firstName: initialValues?.firstName ?? "",
      lastName: initialValues?.lastName ?? "",
      companyName: initialValues?.companyName ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      isActive: initialValues?.isActive ?? true
    }
  });

  const onSubmit = (values: InspectorValues) => {
    if (readOnly) return;
    setError(null);
    startTransition(async () => {
      const result = inspectorId
        ? await updateInspectorAction(inspectorId, values)
        : await createInspectorAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" disabled={readOnly} {...form.register("firstName")} />
          {form.formState.errors.firstName ? (
            <p className="text-xs text-ember">{form.formState.errors.firstName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" disabled={readOnly} {...form.register("lastName")} />
          {form.formState.errors.lastName ? (
            <p className="text-xs text-ember">{form.formState.errors.lastName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyName">Company</Label>
          <Input id="companyName" disabled={readOnly} {...form.register("companyName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" disabled={readOnly} {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-ember">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" disabled={readOnly} {...form.register("phone")} />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="isActive"
            type="checkbox"
            disabled={readOnly}
            className="h-4 w-4 rounded border-ink/20"
            {...form.register("isActive")}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      {readOnly ? null : (
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : inspectorId ? "Save inspector" : "Create inspector"}
        </Button>
      )}
    </form>
  );
}
