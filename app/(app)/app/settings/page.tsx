import { redirect } from "next/navigation";
import Link from "next/link";
import { Upload, Download, Bell } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import { NotificationPreferences } from "./notification-preferences";
import { getNotificationPreferencesAction } from "./actions";

export default async function SettingsPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Settings</p>
        <h2 className="font-display text-3xl text-ink">Workspace settings</h2>
        <p className="text-sm text-ink/70">Manage imports, exports, and configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Bulk import data from CSV files. Import Management Companies, Buildings, Units, Mechanics, Contacts, and Jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/app/settings/import">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Open Import Wizard
            </Button>
          </Link>
        </CardContent>
      </Card>

      <NotificationPreferencesCard />

      {/* Future settings sections */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Export your workspace data. Coming soon.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

async function NotificationPreferencesCard() {
  const result = await getNotificationPreferencesAction();
  
  if (result.error || !result.data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Choose which email notifications you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationPreferences initialPreferences={result.data} />
      </CardContent>
    </Card>
  );
}
