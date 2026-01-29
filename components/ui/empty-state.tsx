import Link from "next/link";
import {
  Building2,
  Users,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  UserCheck,
  FileSearch,
  Phone,
  LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateType =
  | "companies"
  | "buildings"
  | "units"
  | "contacts"
  | "mechanics"
  | "maintenance"
  | "jobs"
  | "inspectors"
  | "inspections"
  | "emergency-calls"
  | "search";

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const emptyStateConfigs: Record<EmptyStateType, EmptyStateConfig> = {
  companies: {
    icon: Building2,
    title: "No management companies yet",
    description: "Start by adding a property management company to track their buildings and contacts.",
    actionLabel: "Add company",
    actionHref: "/app/management-companies/new"
  },
  buildings: {
    icon: Building2,
    title: "No buildings yet",
    description: "Add buildings to organize your elevator units by location.",
    actionLabel: "Add building",
    actionHref: "/app/buildings/new"
  },
  units: {
    icon: Wrench,
    title: "No units yet",
    description: "Add elevator units to track maintenance, inspections, and service history.",
    actionLabel: "Add unit",
    actionHref: "/app/units/new"
  },
  contacts: {
    icon: Users,
    title: "No contacts yet",
    description: "Add contacts to keep track of property managers and building staff.",
    actionLabel: "Add contact",
    actionHref: "/app/contacts/new"
  },
  mechanics: {
    icon: Wrench,
    title: "No mechanics yet",
    description: "Add your service technicians to assign them to jobs and maintenance.",
    actionLabel: "Add mechanic",
    actionHref: "/app/mechanics/new"
  },
  maintenance: {
    icon: ClipboardCheck,
    title: "No maintenance records yet",
    description: "Create maintenance records to track service history for your units.",
    actionLabel: "Add maintenance",
    actionHref: "/app/maintenance/new"
  },
  jobs: {
    icon: Calendar,
    title: "No jobs scheduled",
    description: "Schedule service jobs to manage your team's workload.",
    actionLabel: "Schedule job",
    actionHref: "/app/jobs/new"
  },
  inspectors: {
    icon: UserCheck,
    title: "No inspectors yet",
    description: "Add inspector profiles to track who performs your unit inspections.",
    actionLabel: "Add inspector",
    actionHref: "/app/inspectors/new"
  },
  inspections: {
    icon: FileSearch,
    title: "No inspections yet",
    description: "Record inspections to maintain compliance and track certification status.",
    actionLabel: "Add inspection",
    actionHref: "/app/inspections/new"
  },
  "emergency-calls": {
    icon: Phone,
    title: "No emergency calls",
    description: "Emergency call records will appear here when logged.",
    actionLabel: "Log emergency call",
    actionHref: "/app/emergency-calls/new"
  },
  search: {
    icon: FileSearch,
    title: "No results found",
    description: "Try adjusting your search terms or clearing filters.",
  }
};

interface EmptyStateProps {
  type: EmptyStateType;
  searchTerm?: string;
  showAction?: boolean;
  customTitle?: string;
  customDescription?: string;
  customActionLabel?: string;
  customActionHref?: string;
}

export function EmptyState({
  type,
  searchTerm,
  showAction = true,
  customTitle,
  customDescription,
  customActionLabel,
  customActionHref
}: EmptyStateProps) {
  const config = emptyStateConfigs[type];
  const Icon = config.icon;
  
  const title = searchTerm
    ? `No results for "${searchTerm}"`
    : customTitle || config.title;
  
  const description = searchTerm
    ? "Try adjusting your search terms or clearing the search."
    : customDescription || config.description;
  
  const actionLabel = customActionLabel || config.actionLabel;
  const actionHref = customActionHref || config.actionHref;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">{description}</p>
      {showAction && actionHref && !searchTerm && (
        <Button asChild size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
