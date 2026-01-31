import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { auth } from "@/auth";

import { CompanyList } from "./company-list";

// List of admin email addresses
const ADMIN_EMAILS = [
  "a.martinez988@gmail.com", // Add your email here
  // Add more admin emails as needed
];

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/app");
  }

  // Get all companies with their subscriptions and owner info
  const companies = await db.company.findMany({
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      subscription: true,
      _count: {
        select: {
          members: true,
          units: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const stats = {
    totalCompanies: companies.length,
    trialing: companies.filter(c => c.subscription?.status === "TRIALING").length,
    active: companies.filter(c => c.subscription?.status === "ACTIVE").length,
    testers: companies.filter(c => c.subscription?.isTester).length,
    noSubscription: companies.filter(c => !c.subscription).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Admin</p>
        <h2 className="font-display text-3xl text-ink">Subscription Management</h2>
        <p className="text-sm text-ink/70">Manage company subscriptions, testers, and trials.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.totalCompanies}</p>
            <p className="text-sm text-muted-foreground">Total Companies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-warning-600">{stats.trialing}</p>
            <p className="text-sm text-muted-foreground">Trialing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-success-600">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-accent-600">{stats.testers}</p>
            <p className="text-sm text-muted-foreground">Testers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-slate-400">{stats.noSubscription}</p>
            <p className="text-sm text-muted-foreground">No Subscription</p>
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
          <CardDescription>
            Click on a company to manage their subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyList companies={companies} />
        </CardContent>
      </Card>
    </div>
  );
}
