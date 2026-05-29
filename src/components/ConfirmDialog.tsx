'use client';

import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as a destructive (red) action. */
  destructive?: boolean;
  /** Disables buttons and shows a pending label while the action runs. */
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible, branded confirmation dialog — a styled replacement for the
 * native window.confirm(). Supports Escape-to-close, backdrop-click cancel,
 * focus-on-open and role="dialog"/aria-modal so keyboard users aren't stranded.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Bekräfta',
  cancelLabel = 'Avbryt',
  destructive = false,
  pending = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !pending) onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl bg-surface-default p-6 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-text-default">
          {title}
        </h2>
        {body && <p className="mt-2 text-sm text-text-subtle">{body}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-border-default bg-surface-default px-4 py-2 text-sm font-medium text-text-default transition hover:bg-surface-subtle disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-text-inverse transition disabled:opacity-50 ${
              destructive
                ? 'bg-status-negative hover:opacity-90'
                : 'bg-brand-default hover:bg-brand-emphasis'
            }`}
          >
            {pending ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
