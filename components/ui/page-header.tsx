"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type OverflowAction = {
  type: "archive" | "restore" | "delete";
  action: (id: string) => Promise<{ error?: string }>;
  disabled?: boolean;
  disabledReason?: string;
  cascadeMessage?: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  isArchived?: boolean;
  entityName: string;
  entityId: string;
  actions?: OverflowAction[];
  redirectAfterDelete?: string;
  showActions?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  isArchived = false,
  entityName,
  entityId,
  actions = [],
  redirectAfterDelete,
  showActions = true
}: PageHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  const archiveAction = actions.find((a) => a.type === "archive");
  const restoreAction = actions.find((a) => a.type === "restore");
  const deleteAction = actions.find((a) => a.type === "delete");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleArchive = () => {
    if (!archiveAction) return;
    setError(null);
    startTransition(async () => {
      const result = await archiveAction.action(entityId);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowArchiveModal(false);
        router.refresh();
      }
    });
  };

  const handleRestore = () => {
    if (!restoreAction) return;
    setError(null);
    startTransition(async () => {
      const result = await restoreAction.action(entityId);
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
      const result = await deleteAction.action(entityId);
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

  const archiveDescription = archiveAction?.cascadeMessage
    ? `${archiveAction.cascadeMessage} You can restore it later.`
    : `Are you sure you want to archive this ${entityName.toLowerCase()}? It will be hidden from active views but can be restored later.`;

  const hasOverflowItems =
    showActions &&
    ((!isArchived && archiveAction) ||
      (isArchived && restoreAction) ||
      (isArchived && deleteAction));

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">{entityName}</p>
        <h2 className="font-display text-3xl text-ink">
          {title}
          {isArchived && (
            <span className="ml-2 rounded-full bg-ink/10 px-3 py-1 text-sm font-normal text-ink/60">
              Archived
            </span>
          )}
        </h2>
        {subtitle && <p className="text-sm text-ink/70">{subtitle}</p>}
      </div>

      {hasOverflowItems && (
        <div className="relative" ref={menuRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-9 w-9 p-0"
            aria-label="Actions menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-ink/10 bg-white py-1 shadow-lg">
              {!isArchived && archiveAction && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowArchiveModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-ink/5"
                >
                  Archive
                </button>
              )}

              {isArchived && restoreAction && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowRestoreModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-ink hover:bg-ink/5"
                >
                  Restore
                </button>
              )}

              {isArchived && deleteAction && (
                <button
                  type="button"
                  disabled={deleteAction.disabled}
                  onClick={() => {
                    if (!deleteAction.disabled) {
                      setMenuOpen(false);
                      setShowDeleteModal(true);
                    }
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${
                    deleteAction.disabled
                      ? "cursor-not-allowed text-ink/40"
                      : "text-red-600 hover:bg-ink/5"
                  }`}
                  title={deleteAction.disabled ? deleteAction.disabledReason : undefined}
                >
                  Delete permanently
                  {deleteAction.disabled && (
                    <span className="ml-1 text-xs text-ink/40">
                      ({deleteAction.disabledReason})
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="w-full">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {archiveAction && (
        <ConfirmModal
          open={showArchiveModal}
          onClose={() => setShowArchiveModal(false)}
          onConfirm={handleArchive}
          title={`Archive ${entityName}`}
          description={archiveDescription}
          confirmText="Archive"
          isPending={isPending}
        />
      )}

      {restoreAction && (
        <ConfirmModal
          open={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          onConfirm={handleRestore}
          title={`Restore ${entityName}`}
          description={`Are you sure you want to restore this ${entityName.toLowerCase()}? It will be visible in active views again.`}
          confirmText="Restore"
          isPending={isPending}
        />
      )}

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
