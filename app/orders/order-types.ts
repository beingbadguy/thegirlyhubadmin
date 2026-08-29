// All status values the backend accepts
export type OrderStatusValue =
  | "processing"
  | "reviewing"
  | "preparing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export interface StatusHistoryEntry {
  status: OrderStatusValue;
  timestamp: string;
  note?: string;
}

// Valid next statuses for each current status
export const STATUS_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  processing: ["reviewing", "cancelled"],
  reviewing:  ["preparing", "cancelled"],
  preparing:  ["shipped",   "cancelled"],
  shipped:    ["delivered"],
  delivered:  ["completed"],
  completed:  [],
  cancelled:  [],
};

export const STATUS_META: Record<
  OrderStatusValue,
  { label: string; color: string; bg: string; icon: string }
> = {
  processing: { label: "Processing",  color: "#6b6b6b", bg: "#f0f0ed", icon: "⏳" },
  reviewing:  { label: "Reviewing",   color: "#b45309", bg: "#fef3c7", icon: "🔍" },
  preparing:  { label: "Preparing",   color: "#c2410c", bg: "#ffedd5", icon: "📦" },
  shipped:    { label: "Shipped",     color: "#1d4ed8", bg: "#dbeafe", icon: "🚚" },
  delivered:  { label: "Delivered",   color: "#15803d", bg: "#dcfce7", icon: "✅" },
  completed:  { label: "Completed",   color: "#166534", bg: "#bbf7d0", icon: "🎉" },
  cancelled:  { label: "Cancelled",   color: "#b91c1c", bg: "#fee2e2", icon: "✕"  },
};

export const ORDERED_FLOW: OrderStatusValue[] = [
  "processing",
  "reviewing",
  "preparing",
  "shipped",
  "delivered",
  "completed",
];
