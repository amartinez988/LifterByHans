import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./login-form";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { callbackUrl?: string };
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link className="text-sm text-ink/70 hover:text-ink" href="/">
          ? Back to home
        </Link>
        <Link
          className="text-sm text-ink/70 hover:text-ink"
          href={searchParams?.callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}` : "/signup"}
        >
          Create account
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Log in to continue setting up your LIFTER workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={searchParams?.callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
