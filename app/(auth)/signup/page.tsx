import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SignupForm from "./signup-form";

export default function SignupPage({
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
          href={searchParams?.callbackUrl ? `/login?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}` : "/login"}
        >
          Log in
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create your owner account</CardTitle>
          <CardDescription>
            Start with a secure login. Company setup comes next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm callbackUrl={searchParams?.callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
