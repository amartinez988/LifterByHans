"use client";

import Link from "next/link";
import { Phone, ChevronRight } from "lucide-react";

interface EmergencyCardProps {
  emergency: {
    id: string;
    unit: {
      identifier: string;
      building: {
        name: string;
        localPhone: string | null;
      };
    };
  };
}

export function EmergencyCard({ emergency }: EmergencyCardProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
      <Link href="/app/emergency-calls" className="flex-1">
        <p className="font-medium text-slate-900">{emergency.unit.identifier}</p>
        <p className="text-sm text-slate-500">{emergency.unit.building.name}</p>
      </Link>
      <div className="flex items-center gap-2">
        {emergency.unit.building.localPhone && (
          <a
            href={`tel:${emergency.unit.building.localPhone}`}
            className="p-2 bg-danger-100 rounded-lg"
          >
            <Phone className="h-4 w-4 text-danger-600" />
          </a>
        )}
        <Link href="/app/emergency-calls">
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
