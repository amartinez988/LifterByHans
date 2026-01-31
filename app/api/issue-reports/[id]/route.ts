import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentMembership, canEditWorkspace } from "@/lib/team";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { membership } = await getCurrentMembership();
    if (!membership || !canEditWorkspace(membership.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, resolution } = body;

    // Verify report belongs to company
    const report = await db.issueReport.findFirst({
      where: {
        id,
        companyId: membership.companyId,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Update the report
    const updatedReport = await db.issueReport.update({
      where: { id },
      data: {
        status,
        resolution: resolution || undefined,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
        resolvedBy: status === "RESOLVED" ? membership.userId : undefined,
      },
    });

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error("Issue report update error:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { membership } = await getCurrentMembership();
    if (!membership || !canEditWorkspace(membership.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify report belongs to company
    const report = await db.issueReport.findFirst({
      where: {
        id,
        companyId: membership.companyId,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await db.issueReport.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Issue report delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
