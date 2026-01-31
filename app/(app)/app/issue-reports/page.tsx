import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquareWarning, Clock, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentMembership, canEditWorkspace } from "@/lib/team";
import { Card, CardContent } from "@/components/ui/card";
import { IssueReportActions } from "./issue-report-actions";

const issueTypeLabels: Record<string, { label: string; emoji: string }> = {
  stuck: { label: "Elevator stuck", emoji: "🚫" },
  noise: { label: "Strange noise", emoji: "🔊" },
  door: { label: "Door issue", emoji: "🚪" },
  button: { label: "Button not working", emoji: "🔘" },
  light: { label: "Light out", emoji: "💡" },
  other: { label: "Other issue", emoji: "❓" },
};

const statusColors: Record<string, string> = {
  NEW: "bg-red-100 text-red-700",
  ACKNOWLEDGED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  DISMISSED: "bg-slate-100 text-slate-700",
};

export default async function IssueReportsPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const canEdit = canEditWorkspace(membership.role);

  const reports = await db.issueReport.findMany({
    where: { companyId: membership.companyId },
    include: {
      unit: {
        include: {
          building: {
            include: {
              managementCompany: true,
            },
          },
        },
      },
    },
    orderBy: { reportedAt: "desc" },
    take: 50,
  });

  const newCount = reports.filter(r => r.status === "NEW").length;
  const inProgressCount = reports.filter(r => r.status === "IN_PROGRESS" || r.status === "ACKNOWLEDGED").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600 flex items-center gap-2">
          <MessageSquareWarning className="h-4 w-4" />
          Customer Reports
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900">Issue Reports</h1>
        <p className="mt-1 text-slate-500">
          Issues reported via QR code scans from elevator users.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">{newCount}</p>
              <p className="text-sm text-red-600">New Reports</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{inProgressCount}</p>
              <p className="text-sm text-blue-600">In Progress</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <CheckCircle2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
              <p className="text-sm text-slate-600">Total Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <Card>
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquareWarning className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No issue reports yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                When users scan the QR code on an elevator and report an issue, it will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((report) => {
                const issueInfo = issueTypeLabels[report.issueType] || { label: report.issueType, emoji: "❓" };
                
                return (
                  <div key={report.id} className="p-4 hover:bg-slate-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Emoji Icon */}
                        <div className="text-2xl flex-shrink-0">{issueInfo.emoji}</div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-900">{issueInfo.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[report.status]}`}>
                              {report.status.replace("_", " ")}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                            <Link 
                              href={`/app/units/${report.unitId}`}
                              className="font-medium hover:text-brand-600 hover:underline"
                            >
                              {report.unit.identifier}
                            </Link>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {report.unit.building.name}
                            </span>
                          </div>
                          
                          {report.description && (
                            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                              {report.description}
                            </p>
                          )}
                          
                          {report.contactInfo && (
                            <p className="mt-1 text-xs text-slate-500">
                              Contact: {report.contactInfo}
                            </p>
                          )}
                          
                          <p className="mt-2 text-xs text-slate-400">
                            Reported {new Date(report.reportedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {canEdit && (
                        <IssueReportActions
                          reportId={report.id}
                          currentStatus={report.status}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
