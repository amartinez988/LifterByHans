"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  updateJobStatusAction,
  completeJobAndCreateMaintenanceAction
} from "../actions";

type JobStatusActionsProps = {
  jobId: string;
  currentStatus: string;
  hasUnit: boolean;
};

export default function JobStatusActions({
  jobId,
  currentStatus,
  hasUnit
}: JobStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCompleteOptions, setShowCompleteOptions] = useState(false);

  const handleStatusChange = (newStatus: "SCHEDULED" | "EN_ROUTE" | "ON_SITE" | "COMPLETED" | "CANCELLED") => {
    setError(null);
    startTransition(async () => {
      const result = await updateJobStatusAction(jobId, newStatus);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleCompleteWithMaintenance = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeJobAndCreateMaintenanceAction(jobId);
      if (result?.error) {
        setError(result.error);
      } else if (result.maintenanceId) {
        router.push(`/app/maintenance/${result.maintenanceId}`);
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentStatus === "SCHEDULED" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("EN_ROUTE")}
            disabled={isPending}
          >
            Start Travel
          </Button>
        )}

        {currentStatus === "EN_ROUTE" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("ON_SITE")}
            disabled={isPending}
          >
            Arrive On Site
          </Button>
        )}

        {currentStatus === "ON_SITE" && (
          <>
            {!showCompleteOptions ? (
              <Button
                size="sm"
                onClick={() => setShowCompleteOptions(true)}
                disabled={isPending}
              >
                Complete Job
              </Button>
            ) : (
              <div className="flex flex-col gap-2 p-3 bg-ink/5 rounded-xl">
                <p className="text-xs text-ink/70">Create maintenance record?</p>
                <div className="flex gap-2">
                  {hasUnit ? (
                    <Button
                      size="sm"
                      onClick={handleCompleteWithMaintenance}
                      disabled={isPending}
                    >
                      Yes, create record
                    </Button>
                  ) : (
                    <p className="text-xs text-ink/50">Unit required for maintenance</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleStatusChange("COMPLETED");
                      setShowCompleteOptions(false);
                    }}
                    disabled={isPending}
                  >
                    No, just complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCompleteOptions(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {currentStatus !== "COMPLETED" && currentStatus !== "CANCELLED" && (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={() => handleStatusChange("CANCELLED")}
            disabled={isPending}
          >
            Cancel Job
          </Button>
        )}

        {(currentStatus === "COMPLETED" || currentStatus === "CANCELLED") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("SCHEDULED")}
            disabled={isPending}
          >
            Reopen Job
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
