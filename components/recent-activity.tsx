"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Calendar,
  Wrench,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

type ActivityItem = {
  id: string;
  type: "inspection" | "maintenance" | "emergency" | "issue_report";
  title: string;
  subtitle: string;
  status?: string;
  date: Date;
  link?: string;
};

interface RecentActivityProps {
  activities: ActivityItem[];
}

const typeIcons = {
  inspection: Calendar,
  maintenance: Wrench,
  emergency: Phone,
  issue_report: AlertCircle,
};

const typeColors = {
  inspection: "bg-blue-100 text-blue-600",
  maintenance: "bg-green-100 text-green-600",
  emergency: "bg-red-100 text-red-600",
  issue_report: "bg-amber-100 text-amber-600",
};

const statusBadges: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  COMPLETED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  OPEN: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
  IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
  NEW: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle },
  RESOLVED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
          <Activity className="h-5 w-5 text-brand-500" />
          Recent Activity
        </h3>
        <div className="text-center py-8 text-slate-500">
          <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
        <Activity className="h-5 w-5 text-brand-500" />
        Recent Activity
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = typeIcons[activity.type];
          const colorClass = typeColors[activity.type];
          const statusConfig = activity.status ? statusBadges[activity.status] : null;
          const StatusIcon = statusConfig?.icon;

          const content = (
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-900 truncate">{activity.title}</p>
                  {statusConfig && StatusIcon && (
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                      <StatusIcon className="h-3 w-3" />
                      {activity.status?.replace("_", " ")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">{activity.subtitle}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                </p>
              </div>
            </div>
          );

          if (activity.link) {
            return (
              <Link key={activity.id} href={activity.link} className="block">
                {content}
              </Link>
            );
          }

          return <div key={activity.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
