"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contactCategorySchema } from "@/lib/validators";
import {
  createContactCategoryRedirectAction,
  updateContactCategoryAction
} from "./actions";

type CategoryValues = z.infer<typeof contactCategorySchema>;

type CategoryFormProps = {
  categoryId?: string;
  initialValues?: Partial<CategoryValues>;
  readOnly?: boolean;
};

export default function CategoryForm({
  categoryId,
  initialValues,
  readOnly
}: CategoryFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryValues>({
    resolver: zodResolver(contactCategorySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? ""
    }
  });

  const onSubmit = (values: CategoryValues) => {
    if (readOnly) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = categoryId
        ? await updateContactCategoryAction(categoryId, values)
        : await createContactCategoryRedirectAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" disabled={readOnly} {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-xs text-ember">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" disabled={readOnly} {...form.register("description")} />
      </div>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      {readOnly ? null : (
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : categoryId ? "Save category" : "Create category"}
        </Button>
      )}
    </form>
  );
}
