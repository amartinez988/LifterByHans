"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { assignMechanicAction } from "../jobs/actions";

type QuickAssignProps = {
  jobId: string;
  mechanics: { id: string; firstName: string; lastName: string }[];
};

export function QuickAssign({ jobId, mechanics }: QuickAssignProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAssign = (mechanicId: string) => {
    if (!mechanicId) return;
    setError(null);
    startTransition(async () => {
      const result = await assignMechanicAction(jobId, mechanicId);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        className="text-xs rounded-lg border border-ink/20 bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ink/20"
        onChange={(e) => handleAssign(e.target.value)}
        disabled={isPending}
        defaultValue=""
      >
        <option value="" disabled>Assign</option>
        {mechanics.map((m) => (
          <option key={m.id} value={m.id}>
            {m.firstName} {m.lastName}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
