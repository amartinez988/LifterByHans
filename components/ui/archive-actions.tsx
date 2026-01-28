"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type ArchiveActionsProps = {
  isArchived: boolean;
  entityName: string;
  entityId: string;
  archiveAction: (id: string) => Promise<{ error?: string }>;
  restoreAction: (id: string) => Promise<{ error?: string }>;
  deleteAction?: (id: string) => Promise<{ error?: string }>;
  canDelete?: boolean;
  deleteDisabledReason?: string;
  archiveCascadeMessage?: string;
  redirectAfterDelete?: string;
};

export function ArchiveActions({
  isArchived,
  entityName,
  entityId,
  archiveAction,
  restoreAction,
  deleteAction,
  canDelete = false,
  deleteDisabledReason,
  archiveCascadeMessage,
  redirectAfterDelete,
}: ArchiveActionsProps) {
  const router = useRouter();
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    setError(null);
    startTransition(async () => {
      const result = await archiveAction(entityId);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowArchiveModal(false);
        router.refresh();
      }
    });
  };

  const handleRestore = () => {
    setError(null);
    startTransition(async () => {
      const result = await restoreAction(entityId);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowRestoreModal(false);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!deleteAction) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAction(entityId);
      if (result?.error) {
        setError(result.error);
        setShowDeleteModal(false);
      } else {
        setShowDeleteModal(false);
        if (redirectAfterDelete) {
          router.push(redirectAfterDelete);
        } else {
          router.refresh();
        }
      }
    });
  };

  const archiveDescription = archiveCascadeMessage
    ? `${archiveCascadeMessage} You can restore it later.`
    : `Are you sure you want to archive this ${entityName.toLowerCase()}? It will be hidden from active views but can be restored later.`;

  if (!isArchived) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowArchiveModal(true)}
        >
          Archive
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <ConfirmModal
          open={showArchiveModal}
          onClose={() => setShowArchiveModal(false)}
          onConfirm={handleArchive}
          title={`Archive ${entityName}`}
          description={archiveDescription}
          confirmText="Archive"
          isPending={isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRestoreModal(true)}
        >
          Restore
        </Button>
        {deleteAction && (
          <Button
            variant="outline"
            size="sm"
            disabled={!canDelete}
            title={!canDelete ? deleteDisabledReason : undefined}
            onClick={() => canDelete && setShowDeleteModal(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 disabled:border-ink/10 disabled:text-ink/40"
          >
            Delete
          </Button>
        )}
      </div>
      {!canDelete && deleteDisabledReason && (
        <p className="text-xs text-ink/50">{deleteDisabledReason}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <ConfirmModal
        open={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestore}
        title={`Restore ${entityName}`}
        description={`Are you sure you want to restore this ${entityName.toLowerCase()}? It will be visible in active views again.`}
        confirmText="Restore"
        isPending={isPending}
      />

      {deleteAction && (
        <ConfirmModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title={`Delete ${entityName} Permanently`}
          description={`This action cannot be undone. This will permanently delete the ${entityName.toLowerCase()} from the database.`}
          confirmText="Delete Permanently"
          variant="destructive"
          isPending={isPending}
        />
      )}
    </div>
  );
}
