"use client";

import { ExternalLink, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Order } from "../admin-data";
import { api, getApiError } from "../api-client";
import { Toast } from "../ui";
import type { OrderStatusValue } from "./order-types";
import { STATUS_META, STATUS_TRANSITIONS } from "./order-types";

interface Props {
  order: Order;
  onClose: () => void;
  onUpdated: (id: string, newStatus: OrderStatusValue, awb?: string) => void;
}

export function StatusModal({ order, onClose, onUpdated }: Props) {
  const raw = order.raw || {};
  const currentStatus = order.status as OrderStatusValue;
  const nextOptions = STATUS_TRANSITIONS[currentStatus] ?? [];

  const [selected, setSelected] = useState<OrderStatusValue | "">("");
  const [awb, setAwb]           = useState(raw.awbNumber || "");
  const [trackingLink, setTrackingLink] = useState(raw.trackingLink || "");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const firstInputRef           = useRef<HTMLSelectElement>(null);

  // Trap focus inside modal
  useEffect(() => {
    firstInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const needsAwb = selected === "shipped";

  const handleSubmit = async () => {
    if (!selected) return;
    if (needsAwb && !awb.trim()) {
      setError("AWB number is required before marking as Shipped.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await api.patch(`/api/orders/${order.id}/status`, {
        status: selected,
        ...(awb.trim() && { awbNumber: awb.trim() }),
        ...(trackingLink.trim() && { trackingLink: trackingLink.trim() }),
      });
      const label = STATUS_META[selected]?.label ?? selected;
      const isShipped = selected === "shipped";
      setSuccess(
        isShipped
          ? "Order marked as shipped and customer notified 📦"
          : `Status updated to "${label}" successfully.`
      );
      onUpdated(order.id, selected, awb.trim() || undefined);
      setTimeout(() => { onClose(); }, 1600);
    } catch (err) {
      setError(getApiError(err, "Failed to update order status."));
    } finally {
      setBusy(false);
    }
  };

  const currentMeta = STATUS_META[currentStatus];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal status-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-head">
          <div>
            <h2 id="status-modal-title">Update Order Status</h2>
            <span className="modal-sub">Order #{order.id}</span>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Current status chip */}
        <div className="status-modal-current">
          <span className="label-tiny">Current status</span>
          <span
            className="status-badge"
            style={{ color: currentMeta.color, background: currentMeta.bg }}
          >
            {currentMeta.icon} {currentMeta.label}
          </span>
        </div>

        {/* No transitions available */}
        {nextOptions.length === 0 ? (
          <div className="status-modal-terminal">
            <span>This order is in a final state and cannot be updated further.</span>
          </div>
        ) : (
          <>
            {/* Status dropdown */}
            <label className="field-group">
              <span className="field-label">Move to status</span>
              <select
                ref={firstInputRef}
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value as OrderStatusValue);
                  setError("");
                }}
                className="status-select"
              >
                <option value="">— choose next status —</option>
                {nextOptions.map((s) => {
                  const m = STATUS_META[s];
                  return (
                    <option key={s} value={s}>
                      {m.icon}  {m.label}
                    </option>
                  );
                })}
              </select>
            </label>

            {/* AWB fields — only when SHIPPED is selected */}
            {needsAwb && (
              <div className="awb-fields">
                <label className="field-group">
                  <span className="field-label">
                    AWB / Tracking number <span className="field-required">*</span>
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. BD98214107"
                    value={awb}
                    onChange={(e) => { setAwb(e.target.value); setError(""); }}
                    autoFocus
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">
                    Tracking link{" "}
                    <span className="field-optional">(optional)</span>
                  </span>
                  <input
                    type="url"
                    placeholder="https://track.bluedart.com/..."
                    value={trackingLink}
                    onChange={(e) => setTrackingLink(e.target.value)}
                  />
                </label>
              </div>
            )}

            {/* Existing tracking link — view button */}
            {raw.trackingLink && selected !== "shipped" && (
              <a
                href={raw.trackingLink}
                target="_blank"
                rel="noreferrer"
                className="tracking-view-btn"
              >
                <ExternalLink size={13} /> View current tracking
              </a>
            )}

            {/* Feedback */}
            {error   && <Toast message={error}   tone="error"   />}
            {success && <Toast message={success} tone="success" />}

            {/* Actions */}
            <div className="status-modal-actions">
              <button className="button soft" type="button" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button
                className="button"
                type="button"
                disabled={!selected || busy}
                onClick={handleSubmit}
              >
                {busy && <LoaderCircle size={14} className="spin" />}
                {busy ? "Updating…" : "Confirm Update"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
