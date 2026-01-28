"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { managementCompanySchema } from "@/lib/validators";
import {
  createManagementCompanyAction,
  updateManagementCompanyAction
} from "./actions";

type ManagementCompanyValues = z.infer<typeof managementCompanySchema>;

type CompanyFormProps = {
  initialValues?: Partial<ManagementCompanyValues>;
  companyId?: string;
  readOnly?: boolean;
};

export default function CompanyForm({
  initialValues,
  companyId,
  readOnly
}: CompanyFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ManagementCompanyValues>({
    resolver: zodResolver(managementCompanySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      accountNumber: initialValues?.accountNumber ?? "",
      website: initialValues?.website ?? "",
      mainPhone: initialValues?.mainPhone ?? "",
      emergencyPhone: initialValues?.emergencyPhone ?? "",
      notes: initialValues?.notes ?? ""
    }
  });

  const onSubmit = (values: ManagementCompanyValues) => {
    if (readOnly) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = companyId
        ? await updateManagementCompanyAction(companyId, values)
        : await createManagementCompanyAction(values);
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
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account number</Label>
          <Input
            id="accountNumber"
            disabled={readOnly}
            {...form.register("accountNumber")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" disabled={readOnly} {...form.register("website")} />
          {form.formState.errors.website ? (
            <p className="text-xs text-ember">{form.formState.errors.website.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mainPhone">Main phone</Label>
          <Input id="mainPhone" disabled={readOnly} {...form.register("mainPhone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Emergency phone</Label>
          <Input
            id="emergencyPhone"
            disabled={readOnly}
            {...form.register("emergencyPhone")}
          />
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
          {isPending ? "Saving..." : companyId ? "Save changes" : "Create company"}
        </Button>
      )}
    </form>
  );
}
