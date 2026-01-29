import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import JobForm from "../job-form";
import JobStatusActions from "./job-status-actions";
import {
  archiveJobAction,
  restoreJobAction
} from "../actions";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  EN_ROUTE: "bg-yellow-100 text-yellow-800",
  ON_SITE: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-500"
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const job = await db.scheduledJob.findUnique({
    where: { id },
    include: {
      managementCompany: true,
      building: true,
      unit: true,
      mechanic: true,
      maintenance: true
    }
  });

  if (!job || job.companyId !== membership.companyId) {
    redirect("/app/jobs");
  }

  const [managementCompanies, buildings, units, mechanics] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.building.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, managementCompanyId: true }
    }),
    db.unit.findMany({
      where: { companyId: membership.companyId },
      orderBy: { identifier: "asc" },
      select: { id: true, identifier: true, buildingId: true }
    }),
    db.mechanic.findMany({
      where: { companyId: membership.companyId, isActive: true },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true }
    })
  ]);

  const canEdit = canEditWorkspace(membership.role);
  const isArchived = !!job.archivedAt;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Jobs", href: "/app/jobs" },
          { label: job.jobCode }
        ]}
      />
      <PageHeader
        title={`Job ${job.jobCode}`}
        subtitle={`${job.managementCompany.name} - ${job.building.name}${job.unit ? ` - ${job.unit.identifier}` : ""}`}
        isArchived={isArchived}
        entityName="Job"
        entityId={job.id}
        showActions={canEdit}
        actions={[
          { type: "archive", action: archiveJobAction },
          { type: "restore", action: restoreJobAction }
        ]}
      />

      {/* Status & Schedule Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[job.status]}`}>
                  {job.status.replace("_", " ")}
                </span>
                <span className="text-sm text-ink/60">
                  {job.priority !== "NORMAL" && (
                    <span className={job.priority === "URGENT" ? "text-red-600 font-semibold" : job.priority === "HIGH" ? "text-orange-600" : "text-ink/40"}>
                      {job.priority} priority
                    </span>
                  )}
                </span>
              </div>
              <p className="text-sm text-ink/70">
                Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}
                {job.scheduledStartTime && ` at ${job.scheduledStartTime}`}
                {job.scheduledEndTime && ` - ${job.scheduledEndTime}`}
              </p>
              {job.mechanic && (
                <p className="text-sm text-ink/70">
                  Assigned to: {job.mechanic.firstName} {job.mechanic.lastName}
                </p>
              )}
              {job.completedAt && (
                <p className="text-sm text-green-700">
                  Completed: {new Date(job.completedAt).toLocaleString()}
                </p>
              )}
            </div>
            {!isArchived && (
              <JobStatusActions
                jobId={job.id}
                currentStatus={job.status}
                hasUnit={!!job.unitId}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Linked Maintenance */}
      {job.maintenance && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Linked Maintenance Record</p>
                <p className="text-xs text-ink/60">{job.maintenance.maintenanceCode}</p>
              </div>
              <Link
                href={`/app/maintenance/${job.maintenance.id}`}
                className="rounded-full bg-ink/10 px-3 py-1 text-xs text-ink hover:bg-ink/20 transition"
              >
                View
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Details Form */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-ink mb-4">Job details</h3>
          <JobForm
            jobId={job.id}
            managementCompanies={managementCompanies}
            buildings={buildings}
            units={units}
            mechanics={mechanics}
            readOnly={!canEdit || isArchived}
            initialValues={{
              title: job.title,
              description: job.description ?? "",
              managementCompanyId: job.managementCompanyId,
              buildingId: job.buildingId,
              unitId: job.unitId ?? "",
              mechanicId: job.mechanicId ?? "",
              scheduledDate: job.scheduledDate.toISOString().slice(0, 10),
              scheduledStartTime: job.scheduledStartTime ?? "",
              scheduledEndTime: job.scheduledEndTime ?? "",
              status: job.status,
              priority: job.priority,
              jobType: job.jobType,
              notes: job.notes ?? ""
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
