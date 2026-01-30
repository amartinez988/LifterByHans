"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { resetPasswordAction } from "./actions";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"]
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  const onSubmit = (values: ResetPasswordValues) => {
    setError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(token, values.password);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-success-200 bg-success-50 p-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-success-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-success-900">Password updated!</h3>
            <p className="mt-1 text-sm text-success-700">
              Your password has been reset. Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending} loading={isPending}>
        Reset password
      </Button>
    </form>
  );
}
