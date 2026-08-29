"use client";

import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { formatDateTime } from "../admin-data";
import type { OrderStatusValue, StatusHistoryEntry } from "./order-types";
import { ORDERED_FLOW, STATUS_META } from "./order-types";

interface Props {
  currentStatus: OrderStatusValue;
  history?: StatusHistoryEntry[];
}

export function OrderTimeline({ currentStatus, history = [] }: Props) {
  const isCancelled = currentStatus === "cancelled";

  // Build a map of status → timestamp from history
  const historyMap: Partial<Record<OrderStatusValue, string>> = {};
  for (const entry of history) {
    historyMap[entry.status] = entry.timestamp;
  }

  // Current step index in the main flow (cancelled falls outside)
  const currentIndex = ORDERED_FLOW.indexOf(currentStatus);

  return (
    <div className="order-timeline">
      {/* Main flow steps */}
      {ORDERED_FLOW.map((status, idx) => {
        const meta = STATUS_META[status];
        const isDone = isCancelled ? false : currentIndex > idx;
        const isActive = !isCancelled && currentIndex === idx;
        const ts = historyMap[status];

        return (
          <div
            key={status}
            className={`timeline-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
          >
            {/* Connector line */}
            {idx > 0 && (
              <div className={`timeline-line ${isDone || isActive ? "filled" : ""}`} />
            )}

            {/* Node */}
            <div className="timeline-node">
              {isDone ? (
                <CheckCircle2 size={18} strokeWidth={2.5} />
              ) : (
                <Circle size={18} strokeWidth={2} />
              )}
            </div>

            {/* Label */}
            <div className="timeline-label">
              <span className="timeline-status-name">{meta.label}</span>
              {ts && (
                <span className="timeline-time">{formatDateTime(ts)}</span>
              )}
              {isActive && !ts && (
                <span className="timeline-time timeline-now">Current status</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Cancelled node — only shown when order is cancelled */}
      {isCancelled && (
        <div className="timeline-step cancelled active">
          <div className="timeline-node cancelled-node">
            <XCircle size={18} strokeWidth={2.5} />
          </div>
          <div className="timeline-label">
            <span className="timeline-status-name">Cancelled</span>
            {historyMap["cancelled"] && (
              <span className="timeline-time">{formatDateTime(historyMap["cancelled"])}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
