"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import {
  updateNotificationPreferencesAction,
  NotificationPreferencesData,
} from "./actions";

type NotificationPreferencesProps = {
  initialPreferences: NotificationPreferencesData;
};

const notificationOptions = [
  {
    key: "jobStatusUpdates" as const,
    label: "Job Status Updates",
    description: "Get notified when job statuses change (scheduled, en route, completed, etc.)",
  },
  {
    key: "emergencyAlerts" as const,
    label: "Emergency Alerts",
    description: "Receive immediate alerts when new emergency calls are logged",
  },
  {
    key: "inspectionReminders" as const,
    label: "Inspection Reminders",
    description: "Get reminded about upcoming inspection expirations (7, 14, 30 days)",
  },
  {
    key: "weeklySummary" as const,
    label: "Weekly Summary",
    description: "Receive a weekly summary of operations every Monday",
  },
];

export function NotificationPreferences({
  initialPreferences,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof NotificationPreferencesData) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateNotificationPreferencesAction(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const allEnabled = Object.values(preferences).every(Boolean);
  const allDisabled = Object.values(preferences).every((v) => !v);

  const toggleAll = () => {
    const newValue = !allEnabled;
    setPreferences({
      jobStatusUpdates: newValue,
      emergencyAlerts: newValue,
      inspectionReminders: newValue,
      weeklySummary: newValue,
    });
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAll}
          className="text-xs"
        >
          {allEnabled ? (
            <>
              <BellOff className="mr-2 h-3 w-3" />
              Disable All
            </>
          ) : (
            <>
              <Bell className="mr-2 h-3 w-3" />
              Enable All
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-0.5">
              <Label htmlFor={option.key} className="text-base cursor-pointer">
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            <Switch
              id={option.key}
              checked={preferences[option.key]}
              onCheckedChange={() => handleToggle(option.key)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
        {saved && (
          <span className="text-sm text-green-600">✓ Saved successfully</span>
        )}
      </div>
    </div>
  );
}
