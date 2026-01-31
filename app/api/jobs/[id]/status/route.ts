import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentMembership } from "@/lib/team";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES = ["SCHEDULED", "EN_ROUTE", "ON_SITE", "COMPLETED", "CANCELLED"];

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { membership } = await getCurrentMembership();
    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Verify job belongs to company
    const job = await db.scheduledJob.findFirst({
      where: {
        id,
        companyId: membership.companyId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update the job
    const updatedJob = await db.scheduledJob.update({
      where: { id },
      data: {
        status,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
        ...(status === "EN_ROUTE" ? { startedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("Job status update error:", error);
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 }
    );
  }
}
