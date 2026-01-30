"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contactSchema, contactCategorySchema } from "@/lib/validators";
import { createContactCategoryAction } from "../contact-categories/actions";
import {
  createContactAction,
  createContactStayAction,
  updateContactAction
} from "./actions";

type ContactValues = z.infer<typeof contactSchema>;

type ContactFormProps = {
  managementCompanies: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  initialValues?: Partial<ContactValues>;
  contactId?: string;
  fixedManagementCompanyId?: string;
  stayOnSubmit?: boolean;
  readOnly?: boolean;
};

export default function ContactForm({
  managementCompanies,
  categories,
  initialValues,
  contactId,
  fixedManagementCompanyId,
  stayOnSubmit,
  readOnly
}: ContactFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [categoryList, setCategoryList] = useState(categories);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryPending, setCategoryPending] = useState(false);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      managementCompanyId:
        fixedManagementCompanyId || initialValues?.managementCompanyId || "",
      contactCategoryId: initialValues?.contactCategoryId || "",
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      isPrimary: initialValues?.isPrimary || false,
      notes: initialValues?.notes || ""
    }
  });

  const onSubmit = (values: ContactValues) => {
    if (readOnly) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = contactId
        ? await updateContactAction(contactId, values)
        : stayOnSubmit
          ? await createContactStayAction(values)
          : await createContactAction(values);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (stayOnSubmit) {
        form.reset({
          ...values,
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          isPrimary: false,
          notes: ""
        });
        router.refresh();
      }
    });
  };

  const categoryDefaults = useMemo(
    () => ({ name: "", description: "" }),
    []
  );

  const handleCreateCategory = async () => {
    const values = {
      name: (document.getElementById("new-category-name") as HTMLInputElement)
        ?.value,
      description: (
        document.getElementById("new-category-description") as HTMLInputElement
      )?.value
    };

    const parsed = contactCategorySchema.safeParse(values);
    if (!parsed.success) {
      setCategoryError(parsed.error.errors[0]?.message ?? "Invalid category.");
      return;
    }

    setCategoryError(null);
    setCategoryPending(true);
    const result = await createContactCategoryAction(parsed.data);
    setCategoryPending(false);
    if (result?.error) {
      setCategoryError(result.error);
      return;
    }
    if (result?.category) {
      setCategoryList((prev) => [...prev, result.category!]);
      form.setValue("contactCategoryId", result.category.id);
      setShowCategoryForm(false);
      const nameInput = document.getElementById(
        "new-category-name"
      ) as HTMLInputElement | null;
      const descriptionInput = document.getElementById(
        "new-category-description"
      ) as HTMLInputElement | null;
      if (nameInput) {
        nameInput.value = categoryDefaults.name;
      }
      if (descriptionInput) {
        descriptionInput.value = categoryDefaults.description;
      }
    }
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        {!fixedManagementCompanyId ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="managementCompanyId">Management company</Label>
            <select
              id="managementCompanyId"
              disabled={readOnly}
              className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
              {...form.register("managementCompanyId")}
            >
              <option value="">Select company</option>
              {managementCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {form.formState.errors.managementCompanyId ? (
              <p className="text-xs text-ember">
                {form.formState.errors.managementCompanyId.message}
              </p>
            ) : null}
          </div>
        ) : null}
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
          <Label htmlFor="contactCategoryId">Contact category</Label>
          <select
            id="contactCategoryId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("contactCategoryId")}
          >
            <option value="">Select category</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {form.formState.errors.contactCategoryId ? (
            <p className="text-xs text-ember">
              {form.formState.errors.contactCategoryId.message}
            </p>
          ) : null}
        </div>
        {!readOnly ? (
          <div className="md:col-span-2">
            <button
              type="button"
              className="text-xs uppercase tracking-[0.3em] text-ink/60"
              onClick={() => setShowCategoryForm((prev) => !prev)}
            >
              + Create new category
            </button>
          </div>
        ) : null}
        {showCategoryForm && !readOnly ? (
          <div className="space-y-3 rounded-2xl border border-ink/10 bg-haze p-4 md:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Category name</Label>
              <Input id="new-category-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-description">Description</Label>
              <Input id="new-category-description" />
            </div>
            {categoryError ? (
              <p className="text-sm text-ember">{categoryError}</p>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={handleCreateCategory}>
              {categoryPending ? "Creating..." : "Create category"}
            </Button>
          </div>
        ) : null}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            disabled={readOnly}
            className="min-h-[120px] w-full rounded-2xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("notes")}
          />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="isPrimary"
            type="checkbox"
            disabled={readOnly}
            className="h-4 w-4 rounded border-ink/20"
            {...form.register("isPrimary")}
          />
          <Label htmlFor="isPrimary">Primary contact</Label>
        </div>
      </div>

      {error ? <p className="text-sm text-ember">{error}</p> : null}
      {readOnly ? null : (
        <Button type="submit" disabled={isPending} loading={isPending}>
          {contactId ? "Save contact" : "Create contact"}
        </Button>
      )}
    </form>
  );
}
