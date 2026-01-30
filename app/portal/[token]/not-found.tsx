import Link from "next/link";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PortalNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning-50">
            <AlertTriangle className="h-10 w-10 text-warning-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Portal Access Not Found
        </h1>
        <p className="text-slate-600 mb-8">
          This portal link is invalid or has expired. Please contact your service provider 
          to request a new portal access link.
        </p>
        <div className="flex justify-center gap-3">
          <Image src="/icon.svg" alt="Uplio" width={24} height={24} className="rounded" />
          <span className="text-slate-500">Powered by Uplio</span>
        </div>
      </div>
    </div>
  );
}
