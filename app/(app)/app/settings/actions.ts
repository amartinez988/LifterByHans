"use server";

import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

type JobImportData = {
  title: string;
  managementCompanyId: string;
  buildingId: string;
  unitId: string | null;
  mechanicId: string | null;
  scheduledDate: string;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  priority: string;
  jobType: string;
  notes: string | null;
};

type BulkImportResult = {
  error?: string;
  imported?: number;
};

function formatJobCode(value: number) {
  return `J-${value.toString().padStart(6, "0")}`;
}

export async function bulkImportJobsAction(
  jobs: JobImportData[]
): Promise<BulkImportResult> {
  const { membership } = await getCurrentMembership();
  if (!membership || !canEditWorkspace(membership.role)) {
    return { error: "You do not have permission to import jobs." };
  }

  if (!jobs || jobs.length === 0) {
    return { error: "No jobs to import." };
  }

  // Validate all referenced entities belong to this company
  const managementCompanyIds = [...new Set(jobs.map(j => j.managementCompanyId))];
  const buildingIds = [...new Set(jobs.map(j => j.buildingId))];
  const unitIds = [...new Set(jobs.filter(j => j.unitId).map(j => j.unitId!))];
  const mechanicIds = [...new Set(jobs.filter(j => j.mechanicId).map(j => j.mechanicId!))];

  const [mcs, bldgs, unts, mechs] = await Promise.all([
    db.managementCompany.findMany({
      where: { id: { in: managementCompanyIds }, companyId: membership.companyId }
    }),
    db.building.findMany({
      where: { id: { in: buildingIds }, companyId: membership.companyId }
    }),
    unitIds.length > 0
      ? db.unit.findMany({
          where: { id: { in: unitIds }, companyId: membership.companyId }
        })
      : [],
    mechanicIds.length > 0
      ? db.mechanic.findMany({
          where: { id: { in: mechanicIds }, companyId: membership.companyId }
        })
      : []
  ]);

  // Verify all IDs are valid
  const validMcIds = new Set(mcs.map(m => m.id));
  const validBldgIds = new Set(bldgs.map(b => b.id));
  const validUnitIds = new Set(unts.map(u => u.id));
  const validMechIds = new Set(mechs.map(m => m.id));

  for (const job of jobs) {
    if (!validMcIds.has(job.managementCompanyId)) {
      return { error: `Invalid management company ID: ${job.managementCompanyId}` };
    }
    if (!validBldgIds.has(job.buildingId)) {
      return { error: `Invalid building ID: ${job.buildingId}` };
    }
    if (job.unitId && !validUnitIds.has(job.unitId)) {
      return { error: `Invalid unit ID: ${job.unitId}` };
    }
    if (job.mechanicId && !validMechIds.has(job.mechanicId)) {
      return { error: `Invalid mechanic ID: ${job.mechanicId}` };
    }
  }

  // Bulk create jobs in a transaction
  let importedCount = 0;

  try {
    await db.$transaction(async (tx) => {
      // Get and update sequence
      const seq = await tx.jobSequence.upsert({
        where: { companyId: membership.companyId },
        create: { companyId: membership.companyId, nextNumber: 1 },
        update: {}
      });

      let nextNumber = seq.nextNumber;

      for (const job of jobs) {
        const jobCode = formatJobCode(nextNumber);

        await tx.scheduledJob.create({
          data: {
            companyId: membership.companyId,
            jobCode,
            title: job.title,
            description: null,
            managementCompanyId: job.managementCompanyId,
            buildingId: job.buildingId,
            unitId: job.unitId,
            mechanicId: job.mechanicId,
            scheduledDate: new Date(job.scheduledDate),
            scheduledStartTime: job.scheduledStartTime,
            scheduledEndTime: job.scheduledEndTime,
            status: "SCHEDULED",
            priority: job.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
            jobType: job.jobType as "MAINTENANCE" | "INSPECTION" | "EMERGENCY" | "CALLBACK" | "OTHER",
            notes: job.notes
          }
        });

        nextNumber++;
        importedCount++;
      }

      // Update sequence
      await tx.jobSequence.update({
        where: { companyId: membership.companyId },
        data: { nextNumber }
      });
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return { error: "Failed to import jobs. Please check data and try again." };
  }

  return { imported: importedCount };
}
