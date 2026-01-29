"use client";

import Link from "next/link";
import {
  Building2,
  Calendar,
  ClipboardCheck,
  Phone,
  Plus,
  Users,
  Wrench,
  FileSearch,
  UserCheck
} from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    label: "New Company",
    href: "/app/management-companies/new",
    icon: <Building2 className="h-4 w-4" />,
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100"
  },
  {
    label: "Schedule Job",
    href: "/app/jobs/new",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
  },
  {
    label: "Add Maintenance",
    href: "/app/maintenance/new",
    icon: <ClipboardCheck className="h-4 w-4" />,
    color: "bg-amber-50 text-amber-700 hover:bg-amber-100"
  },
  {
    label: "Log Emergency",
    href: "/app/emergency-calls/new",
    icon: <Phone className="h-4 w-4" />,
    color: "bg-red-50 text-red-700 hover:bg-red-100"
  },
  {
    label: "Add Inspection",
    href: "/app/inspections/new",
    icon: <FileSearch className="h-4 w-4" />,
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100"
  },
  {
    label: "Add Contact",
    href: "/app/contacts/new",
    icon: <Users className="h-4 w-4" />,
    color: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
  }
];

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Plus className="h-4 w-4 text-ink/40" />
        <h3 className="text-sm font-medium text-ink">Quick Actions</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${action.color}`}
          >
            {action.icon}
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
