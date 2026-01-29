"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, AlertCircle } from "lucide-react";

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
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input 
          id="name" 
          placeholder="John Smith"
          icon={<User className="h-4 w-4" />}
          {...form.register("name")} 
        />
        {form.formState.errors.name && (
          <p className="text-xs text-danger-600">{form.formState.errors.name.message}</p>
        )}
      </div>
      
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
          placeholder="At least 8 characters"
          icon={<Lock className="h-4 w-4" />}
          {...form.register("password")} 
        />
        {form.formState.errors.password && (
          <p className="text-xs text-danger-600">{form.formState.errors.password.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" size="lg" loading={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
      
      <p className="text-center text-xs text-slate-500">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
