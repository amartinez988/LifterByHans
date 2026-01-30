"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { forgotPasswordAction } from "./actions";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    setError(null);
    startTransition(async () => {
      const result = await forgotPasswordAction(values.email);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-success-200 bg-success-50 p-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-success-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-success-900">Check your email</h3>
            <p className="mt-1 text-sm text-success-700">
              If an account exists for that email, we&apos;ve sent a password reset link. 
              The link will expire in 1 hour.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending} loading={isPending}>
        Send reset link
      </Button>
    </form>
  );
}
