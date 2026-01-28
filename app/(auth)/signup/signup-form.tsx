"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSchema } from "@/lib/validators";
import { signUpAction } from "../actions";

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignupForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = (values: SignUpValues) => {
    setError(null);
    startTransition(async () => {
      const result = await signUpAction(values, callbackUrl);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-xs text-ember">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-xs text-ember">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-xs text-ember">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
