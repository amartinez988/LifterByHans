import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unitId, issueType, description, contactInfo } = body;

    if (!unitId || !issueType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get unit and company info
    const unit = await db.unit.findUnique({
      where: { id: unitId },
      include: {
        building: {
          include: {
            managementCompany: true,
          },
        },
        company: true,
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    // Create issue report in database
    const report = await db.issueReport.create({
      data: {
        companyId: unit.companyId,
        unitId: unit.id,
        issueType,
        description: description || null,
        contactInfo: contactInfo || null,
        reportedAt: new Date(),
      },
    });

    // TODO: Send notification email to company admins
    // This would be a great place to add email notifications

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      message: "Issue reported successfully" 
    });
  } catch (error) {
    console.error("Issue report error:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
