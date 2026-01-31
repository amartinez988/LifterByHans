"use client";

import { useState } from "react";
import { QrCode, Download, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnitQRCodeProps {
  unitId: string;
  unitIdentifier: string;
}

export function UnitQRCode({ unitId, unitIdentifier }: UnitQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/u/${unitId}`
    : `/u/${unitId}`;

  const qrUrl = `/api/units/${unitId}/qr`;

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadQR() {
    try {
      const response = await fetch(`${qrUrl}?format=png`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${unitIdentifier}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download QR code:", error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink/60 flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          QR Code
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowQR(!showQR)}
        >
          {showQR ? "Hide" : "Show"} QR Code
        </Button>
      </div>

      {showQR && (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* QR Code Display */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`${qrUrl}?format=svg`} 
                alt={`QR code for ${unitIdentifier}`}
                className="w-32 h-32"
              />
            </div>

            {/* Actions */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">
                  Scan to View Unit Info
                </p>
                <p className="text-xs text-slate-600">
                  Anyone can scan this QR code to view unit status, report issues, and see recent activity.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy Link
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQR}
                  className="gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download PNG
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    Preview
                  </a>
                </Button>
              </div>

              <p className="text-xs text-slate-500">
                Print and attach to elevator car or machine room for easy access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
