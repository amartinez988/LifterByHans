"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { onboardingSchema } from "@/lib/validators";
import { createCompanyAction } from "./actions";

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: ""
    }
  });

  const onSubmit = (values: OnboardingValues) => {
    setError(null);
    startTransition(async () => {
      const result = await createCompanyAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company name</Label>
        <Input id="companyName" {...form.register("companyName")} />
        {form.formState.errors.companyName ? (
          <p className="text-xs text-ember">
            {form.formState.errors.companyName.message}
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create workspace"}
      </Button>
    </form>
  );
}
