import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentMembership, canEditWorkspace } from "@/lib/team";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { membership } = await getCurrentMembership();
    if (!membership || !canEditWorkspace(membership.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const unitId = formData.get("unitId") as string | null;
    const documentType = (formData.get("documentType") as string) || "OTHER";
    const title = (formData.get("title") as string) || "Untitled";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${membership.companyId}/${unitId || "general"}/${timestamp}-${safeFileName}`;

    let fileUrl: string;

    // Try Supabase storage if available
    if (supabase) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Supabase storage error:", error);
        return NextResponse.json(
          { error: "Failed to upload file to storage" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);
      
      fileUrl = urlData.publicUrl;
    } else {
      // Fallback: Store a placeholder URL
      // In production, configure SUPABASE_SERVICE_KEY or use another storage provider
      console.warn("Supabase storage not configured. Using placeholder URL.");
      fileUrl = `/api/documents/placeholder/${storagePath}`;
    }

    // Save document record to database
    const document = await db.document.create({
      data: {
        companyId: membership.companyId,
        unitId: unitId || null,
        documentType: documentType as any,
        title,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: membership.userId,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
