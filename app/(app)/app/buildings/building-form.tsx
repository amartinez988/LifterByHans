"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildingSchema } from "@/lib/validators";
import { createBuildingAction, updateBuildingAction } from "./actions";

type BuildingValues = z.infer<typeof buildingSchema>;

type BuildingFormProps = {
  managementCompanyId?: string;
  buildingId?: string;
  initialValues?: Partial<BuildingValues>;
  readOnly?: boolean;
};

export default function BuildingForm({
  managementCompanyId,
  buildingId,
  initialValues,
  readOnly
}: BuildingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<BuildingValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      address: initialValues?.address ?? "",
      localPhone: initialValues?.localPhone ?? "",
      jurisdiction: initialValues?.jurisdiction ?? "",
      notes: initialValues?.notes ?? ""
    }
  });

  const onSubmit = (values: BuildingValues) => {
    if (readOnly) return;
    setError(null);
    startTransition(async () => {
      const result =
        buildingId && managementCompanyId
          ? await updateBuildingAction(buildingId, values)
          : managementCompanyId
            ? await createBuildingAction(managementCompanyId, values)
            : { error: "Missing management company." };
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" disabled={readOnly} {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs text-ember">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" disabled={readOnly} {...form.register("address")} />
          {form.formState.errors.address ? (
            <p className="text-xs text-ember">{form.formState.errors.address.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="localPhone">Local phone</Label>
          <Input id="localPhone" disabled={readOnly} {...form.register("localPhone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jurisdiction">Jurisdiction</Label>
          <Input id="jurisdiction" disabled={readOnly} {...form.register("jurisdiction")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            disabled={readOnly}
            className="min-h-[120px] w-full rounded-2xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("notes")}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      {readOnly ? null : (
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : buildingId ? "Save building" : "Create building"}
        </Button>
      )}
    </form>
  );
}
