"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema } from "@/lib/validators";
import { signInAction } from "../actions";

type SignInValues = z.infer<typeof signInSchema>;

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (values: SignInValues) => {
    setError(null);
    startTransition(async () => {
      const result = await signInAction(values, callbackUrl);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          {...form.register("email")} 
        />
        {form.formState.errors.email && (
          <p className="text-xs text-danger-600">{form.formState.errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="Enter your password"
          icon={<Lock className="h-4 w-4" />}
          {...form.register("password")} 
        />
        {form.formState.errors.password && (
          <p className="text-xs text-danger-600">{form.formState.errors.password.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" size="lg" loading={isPending}>
        {isPending ? "Signing in..." : "Log in"}
      </Button>
    </form>
  );
}
