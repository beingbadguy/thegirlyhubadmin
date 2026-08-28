"use client";

import { AlertCircle, Check, LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";

export function Toast({
  message,
  tone = "error",
  onClose,
}: {
  message: string;
  tone?: "error" | "success";
  onClose?: () => void;
}) {
  return (
    <div className={`toast toast-${tone}`} role="status">
      <span>
        {tone === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
      </span>
      {message}
      {onClose && (
        <button
          className="toast-close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
export function SpinnerButton({
  children,
  loading,
  type = "submit",
}: {
  children: React.ReactNode;
  loading?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button className="button" type={type} disabled={loading}>
      {loading && <LoaderCircle size={15} className="spin" />}
      {children}
    </button>
  );
}
export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onClose,
  busy,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="confirm-title">{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <p className="modal-copy">{description}</p>
        <div className="form-actions">
          <button className="button soft" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button destructive"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <LoaderCircle size={15} className="spin" />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}
export function SkeletonRows() {
  return (
    <div className="skeleton-list" aria-label="Loading">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
