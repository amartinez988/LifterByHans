"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mechanicLevelSchema, mechanicSchema } from "@/lib/validators";
import { createMechanicAction, createMechanicLevelAction, updateMechanicAction } from "./actions";

type MechanicValues = z.infer<typeof mechanicSchema>;

type MechanicFormProps = {
  mechanicId?: string;
  initialValues?: Partial<MechanicValues>;
  levels: { id: string; name: string }[];
  readOnly?: boolean;
};

export default function MechanicForm({
  mechanicId,
  initialValues,
  levels,
  readOnly
}: MechanicFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [levelList, setLevelList] = useState(levels);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [levelError, setLevelError] = useState<string | null>(null);
  const [levelPending, setLevelPending] = useState(false);
  const [levelForm, setLevelForm] = useState({ name: "", description: "" });

  const form = useForm<MechanicValues>({
    resolver: zodResolver(mechanicSchema),
    defaultValues: {
      mechanicLevelId: initialValues?.mechanicLevelId ?? "",
      firstName: initialValues?.firstName ?? "",
      lastName: initialValues?.lastName ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      isActive: initialValues?.isActive ?? true
    }
  });

  const onSubmit = (values: MechanicValues) => {
    if (readOnly) return;
    setError(null);
    startTransition(async () => {
      const result = mechanicId
        ? await updateMechanicAction(mechanicId, values)
        : await createMechanicAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleCreateLevel = async () => {
    const parsed = mechanicLevelSchema.safeParse(levelForm);
    if (!parsed.success) {
      setLevelError(parsed.error.errors[0]?.message ?? "Invalid level.");
      return;
    }
    setLevelError(null);
    setLevelPending(true);
    const result = await createMechanicLevelAction(parsed.data);
    setLevelPending(false);
    if (result?.error) {
      setLevelError(result.error);
      return;
    }
    if (result?.level) {
      setLevelList((prev) => [...prev, result.level!]);
      form.setValue("mechanicLevelId", result.level.id);
      setLevelForm({ name: "", description: "" });
      setShowLevelForm(false);
    }
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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="mechanicLevelId">Mechanic level</Label>
          <select
            id="mechanicLevelId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("mechanicLevelId")}
          >
            <option value="">Select level</option>
            {levelList.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          {form.formState.errors.mechanicLevelId ? (
            <p className="text-xs text-ember">
              {form.formState.errors.mechanicLevelId.message}
            </p>
          ) : null}
          {!readOnly ? (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.3em] text-ink/60"
              onClick={() => setShowLevelForm((prev) => !prev)}
            >
              + Create new level
            </button>
          ) : null}
          {showLevelForm && !readOnly ? (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-haze p-3">
              <div className="space-y-2">
                <Label htmlFor="new-level-name">Name</Label>
                <Input
                  id="new-level-name"
                  value={levelForm.name}
                  onChange={(event) =>
                    setLevelForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-level-description">Description</Label>
                <Input
                  id="new-level-description"
                  value={levelForm.description}
                  onChange={(event) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      description: event.target.value
                    }))
                  }
                />
              </div>
              {levelError ? <p className="text-sm text-ember">{levelError}</p> : null}
              <Button type="button" variant="outline" size="sm" onClick={handleCreateLevel}>
                {levelPending ? "Creating..." : "Create level"}
              </Button>
            </div>
          ) : null}
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
          {isPending ? "Saving..." : mechanicId ? "Save mechanic" : "Create mechanic"}
        </Button>
      )}
    </form>
  );
}
