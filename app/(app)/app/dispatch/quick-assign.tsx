"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { assignMechanicAction } from "../jobs/actions";

type QuickAssignProps = {
  jobId: string;
  mechanics: { id: string; firstName: string; lastName: string }[];
};

export function QuickAssign({ jobId, mechanics }: QuickAssignProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingMechanic, setPendingMechanic] = useState<{ id: string; name: string } | null>(null);

  const handleSelectChange = (mechanicId: string) => {
    if (!mechanicId) return;
    const mechanic = mechanics.find((m) => m.id === mechanicId);
    if (mechanic) {
      setPendingMechanic({ id: mechanicId, name: `${mechanic.firstName} ${mechanic.lastName}` });
    }
  };

  const handleConfirm = () => {
    if (!pendingMechanic) return;
    setError(null);
    startTransition(async () => {
      const result = await assignMechanicAction(jobId, pendingMechanic.id);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
      setPendingMechanic(null);
    });
  };

  const handleClose = () => {
    setPendingMechanic(null);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        className="text-xs rounded-lg border border-ink/20 bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ink/20"
        onChange={(e) => handleSelectChange(e.target.value)}
        disabled={isPending}
        value=""
      >
        <option value="" disabled>Assign</option>
        {mechanics.map((m) => (
          <option key={m.id} value={m.id}>
            {m.firstName} {m.lastName}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      
      <ConfirmModal
        open={!!pendingMechanic}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Assign Mechanic"
        description={`Are you sure you want to assign ${pendingMechanic?.name} to this job?`}
        confirmText="Assign"
        cancelText="Cancel"
        isPending={isPending}
      />
    </div>
  );
}
