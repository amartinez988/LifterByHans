"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IssueReportActionsProps {
  reportId: string;
  currentStatus: string;
}

export function IssueReportActions({ reportId, currentStatus }: IssueReportActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/issue-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to update issue report:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currentStatus === "NEW" && (
          <DropdownMenuItem onClick={() => updateStatus("ACKNOWLEDGED")}>
            <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
            Acknowledge
          </DropdownMenuItem>
        )}
        
        {(currentStatus === "NEW" || currentStatus === "ACKNOWLEDGED") && (
          <DropdownMenuItem onClick={() => updateStatus("IN_PROGRESS")}>
            <Clock className="mr-2 h-4 w-4 text-blue-500" />
            Mark In Progress
          </DropdownMenuItem>
        )}
        
        {currentStatus !== "RESOLVED" && (
          <DropdownMenuItem onClick={() => updateStatus("RESOLVED")}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Mark Resolved
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {currentStatus !== "DISMISSED" && (
          <DropdownMenuItem 
            onClick={() => updateStatus("DISMISSED")}
            className="text-slate-500"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Dismiss
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
