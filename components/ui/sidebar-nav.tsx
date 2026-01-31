"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Users,
  Tag,
  Wrench,
  UserCheck,
  UsersRound,
  ClipboardList,
  Briefcase,
  Calendar,
  Radio,
  Siren,
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart3,
  CreditCard,
  MessageSquareWarning,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    defaultOpen: true,
    items: [
      { label: "Overview", href: "/app", icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: "Analytics", href: "/app/analytics", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "Compliance", href: "/app/compliance", icon: <ShieldCheck className="h-4 w-4" /> },
      { label: "Alerts", href: "/app/alerts", icon: <AlertTriangle className="h-4 w-4" /> },
    ],
  },
  {
    title: "Assets",
    icon: <Building2 className="h-4 w-4" />,
    defaultOpen: true,
    items: [
      { label: "Companies", href: "/app/management-companies", icon: <Building2 className="h-4 w-4" /> },
      { label: "Buildings", href: "/app/buildings", icon: <Building2 className="h-4 w-4" /> },
      { label: "Units", href: "/app/units", icon: <Building2 className="h-4 w-4" /> },
    ],
  },
  {
    title: "People",
    icon: <Users className="h-4 w-4" />,
    defaultOpen: false,
    items: [
      { label: "Contacts", href: "/app/contacts", icon: <Users className="h-4 w-4" /> },
      { label: "Categories", href: "/app/contact-categories", icon: <Tag className="h-4 w-4" /> },
      { label: "Mechanics", href: "/app/mechanics", icon: <Wrench className="h-4 w-4" /> },
      { label: "Inspectors", href: "/app/inspectors", icon: <UserCheck className="h-4 w-4" /> },
      { label: "Team", href: "/app/team", icon: <UsersRound className="h-4 w-4" /> },
    ],
  },
  {
    title: "Operations",
    icon: <Briefcase className="h-4 w-4" />,
    defaultOpen: true,
    items: [
      { label: "Maintenance", href: "/app/maintenance", icon: <ClipboardList className="h-4 w-4" /> },
      { label: "Jobs", href: "/app/jobs", icon: <Briefcase className="h-4 w-4" /> },
      { label: "Schedule", href: "/app/schedule", icon: <Calendar className="h-4 w-4" /> },
      { label: "Dispatch", href: "/app/dispatch", icon: <Radio className="h-4 w-4" /> },
      { label: "Inspections", href: "/app/inspections", icon: <ClipboardList className="h-4 w-4" /> },
      { label: "Issue Reports", href: "/app/issue-reports", icon: <MessageSquareWarning className="h-4 w-4" /> },
      { label: "Technician View", href: "/app/technician", icon: <Smartphone className="h-4 w-4" /> },
    ],
  },
  {
    title: "Emergency",
    icon: <Siren className="h-4 w-4" />,
    defaultOpen: false,
    items: [
      { label: "Emergency Calls", href: "/app/emergency-calls", icon: <Siren className="h-4 w-4" /> },
    ],
  },
  {
    title: "Settings",
    icon: <Settings className="h-4 w-4" />,
    defaultOpen: false,
    items: [
      { label: "Workspace", href: "/app/settings", icon: <Settings className="h-4 w-4" /> },
      { label: "Billing", href: "/app/settings/billing", icon: <CreditCard className="h-4 w-4" /> },
    ],
  },
];

function NavGroupComponent({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? false);
  
  // Check if any item in this group is active
  const hasActiveItem = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  // Auto-open if an item is active
  const shouldBeOpen = isOpen || hasActiveItem;

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!shouldBeOpen)}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          hasActiveItem
            ? "bg-brand-50 text-brand-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <span className="flex items-center gap-2">
          {group.icon}
          {group.title}
        </span>
        {shouldBeOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {shouldBeOpen && (
        <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-3">
          {group.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 font-medium text-brand-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SidebarNav() {
  return (
    <nav className="space-y-1">
      {navGroups.map((group) => (
        <NavGroupComponent key={group.title} group={group} />
      ))}
    </nav>
  );
}
