"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Navigation2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
  Play,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  scheduledDate: Date;
  status: string;
  priority: string;
  notes: string | null;
  unit: {
    id: string;
    identifier: string;
    building: {
      id: string;
      name: string;
      address: string;
      localPhone: string | null;
    };
  } | null;
  jobType: string | null;
  mechanic: {
    firstName: string;
    lastName: string;
  } | null;
}

interface JobCardProps {
  job: Job;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  EN_ROUTE: "bg-amber-100 text-amber-700 border-amber-200",
  ON_SITE: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-100 text-blue-600",
  HIGH: "bg-amber-100 text-amber-600",
  URGENT: "bg-red-100 text-red-600",
};

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fullAddress = job.unit?.building.address || "";

  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
    : null;

  async function updateStatus(newStatus: string) {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to update job status:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  function getNextStatus(currentStatus: string): string | null {
    switch (currentStatus) {
      case "SCHEDULED":
        return "EN_ROUTE";
      case "EN_ROUTE":
        return "ON_SITE";
      case "ON_SITE":
        return "COMPLETED";
      default:
        return null;
    }
  }

  function getActionLabel(currentStatus: string): string {
    switch (currentStatus) {
      case "SCHEDULED":
        return "Start Route";
      case "EN_ROUTE":
        return "Arrive On Site";
      case "ON_SITE":
        return "Complete Job";
      default:
        return "Update";
    }
  }

  function getActionIcon(currentStatus: string) {
    switch (currentStatus) {
      case "SCHEDULED":
        return Navigation2;
      case "EN_ROUTE":
        return MapPin;
      case "ON_SITE":
        return CheckCircle;
      default:
        return Play;
    }
  }

  const nextStatus = getNextStatus(job.status);
  const ActionIcon = getActionIcon(job.status);

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
      job.priority === "URGENT" ? "border-red-300" : "border-slate-200"
    }`}>
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusColors[job.status]}`}>
                {job.status.replace("_", " ")}
              </span>
              {job.priority !== "NORMAL" && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[job.priority]}`}>
                  {job.priority}
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-slate-900 mt-2">{job.unit?.identifier || "No Unit"}</h3>
            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.unit?.building.name || "Unknown Building"}
            </p>
            
            {job.jobType && (
              <p className="text-sm text-slate-500 mt-1">{job.jobType}</p>
            )}
            
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
              <Clock className="h-3 w-3" />
              {job.scheduledDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            {job.unit?.building.localPhone && (
              <a
                href={`tel:${job.unit.building.localPhone}`}
                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                <Phone className="h-4 w-4 text-slate-600" />
              </a>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
              >
                <Navigation2 className="h-4 w-4 text-blue-600" />
              </a>
            )}
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-slate-500 mt-3 hover:text-slate-700"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Less details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              More details
            </>
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 bg-slate-50">
          {fullAddress && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Address</p>
              <p className="text-sm text-slate-700">{fullAddress}</p>
            </div>
          )}
          
          {job.notes && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-slate-700">{job.notes}</p>
            </div>
          )}

          {job.mechanic && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Assigned To</p>
              <p className="text-sm text-slate-700">
                {job.mechanic.firstName} {job.mechanic.lastName}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {nextStatus && (
        <div className="px-4 pb-4">
          <Button
            onClick={() => updateStatus(nextStatus)}
            disabled={isUpdating}
            className="w-full"
            variant={job.status === "ON_SITE" ? "default" : "outline"}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ActionIcon className="h-4 w-4 mr-2" />
            )}
            {getActionLabel(job.status)}
          </Button>
        </div>
      )}
    </div>
  );
}
