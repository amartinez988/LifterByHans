import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getCurrentMembership } from "@/lib/team";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { membership } = await getCurrentMembership();
    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify unit belongs to company
    const unit = await db.unit.findFirst({
      where: {
        id,
        companyId: membership.companyId,
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Generate QR code URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://uplio.app";
    const unitUrl = `${baseUrl}/u/${unit.id}`;

    // Check if requesting SVG or PNG
    const format = request.nextUrl.searchParams.get("format") || "svg";

    if (format === "svg") {
      const svg = await QRCode.toString(unitUrl, {
        type: "svg",
        margin: 2,
        width: 256,
        color: {
          dark: "#1e293b", // slate-800
          light: "#ffffff",
        },
      });

      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        },
      });
    } else {
      const png = await QRCode.toBuffer(unitUrl, {
        type: "png",
        margin: 2,
        width: 512,
        color: {
          dark: "#1e293b",
          light: "#ffffff",
        },
      });

      return new NextResponse(new Uint8Array(png), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="qr-${unit.identifier}.png"`,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch (error) {
    console.error("QR code generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
