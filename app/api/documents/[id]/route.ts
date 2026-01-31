import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentMembership, canEditWorkspace } from "@/lib/team";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { membership } = await getCurrentMembership();
    if (!membership || !canEditWorkspace(membership.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify document belongs to company
    const document = await db.document.findFirst({
      where: {
        id,
        companyId: membership.companyId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Try to delete from Supabase storage
    if (supabase && document.fileUrl.includes("supabase")) {
      // Extract storage path from URL
      const urlParts = document.fileUrl.split(`${STORAGE_BUCKET}/`);
      if (urlParts.length > 1) {
        const storagePath = urlParts[1];
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      }
    }

    // Delete database record
    await db.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { membership } = await getCurrentMembership();
    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await db.document.findFirst({
      where: {
        id,
        companyId: membership.companyId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Document fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
