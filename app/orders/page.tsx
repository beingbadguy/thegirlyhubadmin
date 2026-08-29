"use client";

import { ExternalLink, Eye, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  normalizeOrder,
  type Order,
} from "../admin-data";
import { AdminShell, Empty, PageTitle } from "../admin-shared";
import { Pagination, usePagination } from "../pagination";
import { useApiResource } from "../use-api-resource";
import type { OrderStatusValue } from "./order-types";
import { ORDERED_FLOW, STATUS_META, STATUS_TRANSITIONS } from "./order-types";
import { OrderTimeline } from "./order-timeline";
import { StatusModal } from "./status-modal";

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as OrderStatusValue] ?? {
    label: status,
    color: "#6b6b6b",
    bg: "#f0f0ed",
    icon: "·",
  };
  return (
    <span
      className="order-status-badge"
      style={{ color: meta.color, background: meta.bg }}
    >
      {meta.icon} {meta.label}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);

  const resource = useApiResource<any>("/api/orders", []);
  const rawOrders = Array.isArray(resource.data)
    ? resource.data
    : resource.data?.orders || [];
  const orders: Order[] = rawOrders.map(normalizeOrder);
  const pagination = usePagination<Order>(orders);

  /** Called by StatusModal on successful update */
  const handleStatusUpdated = (
    id: string,
    newStatus: OrderStatusValue,
    awb?: string,
  ) => {
    resource.refresh();
    if (viewingOrder?.id === id) {
      setViewingOrder((prev) =>
        prev
          ? {
            ...prev,
            status: newStatus,
            raw: { ...prev.raw, awbNumber: awb ?? prev.raw?.awbNumber },
          }
          : null,
      );
    }
    setUpdatingOrder(null);
  };

  return (
    <AdminShell active="/orders">
      <PageTitle
        title="Orders"
        description="Track and fulfil every customer order."
        action={
          <button
            className="button soft icon-button-label"
            onClick={() => resource.refresh()}
            disabled={resource.loading}
          >
            <RefreshCw size={14} className={resource.loading ? "spin" : ""} />
            Refresh
          </button>
        }
      />

      <div className="panel table-panel">
        {resource.error ? (
          <Empty text={resource.error} />
        ) : resource.loading ? (
          <Empty text="Loading orders…" />
        ) : orders.length === 0 ? (
          <Empty text="No orders yet." />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.visibleItems.map((order) => {
                  const canUpdate =
                    (STATUS_TRANSITIONS[order.status as OrderStatusValue] ?? []).length > 0;
                  const raw = order.raw || {};

                  return (
                    <tr key={order.id}>
                      <td>
                        <b>{order.id}</b>
                        <small className="cell-sub">
                          {order.items} item{order.items !== 1 ? "s" : ""} · {order.delivery} · {raw.paymentMethod === "online" ? <span style={{ color: "#16a34a", fontWeight: 600 }}>Paid</span> : <span style={{ color: "#d97706", fontWeight: 600 }}>COD</span>}
                        </small>
                      </td>
                      <td>
                        <b>{order.customer}</b>
                        <small className="cell-sub">{order.email}</small>
                      </td>
                      <td>{formatDate(order.date)}</td>
                      <td>
                        <b>{formatCurrency(order.total)}</b>
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            onClick={() => setViewingOrder(order)}
                            aria-label={`View order ${order.id}`}
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                          {canUpdate && (
                            <button
                              className="button soft btn-xs"
                              onClick={() => setUpdatingOrder(order)}
                              title="Update status"
                            >
                              Update
                            </button>
                          )}
                          {raw.trackingLink && (
                            <a
                              href={raw.trackingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-button"
                              title="View tracking"
                              aria-label="View tracking link"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              page={pagination.page}
              pageCount={pagination.pageCount}
              onPageChange={pagination.setPage}
            />
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onUpdateStatus={() => {
            setUpdatingOrder(viewingOrder);
            setViewingOrder(null);
          }}
        />
      )}

      {/* Update Status Modal */}
      {updatingOrder && (
        <StatusModal
          order={updatingOrder}
          onClose={() => setUpdatingOrder(null)}
          onUpdated={handleStatusUpdated}
        />
      )}
    </AdminShell>
  );
}

// ─── Order Details Modal ──────────────────────────────────────────────────────
function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: () => void;
}) {
  const raw = order.raw || {};
  const products = raw.products || [];
  const history = raw.statusHistory || [];
  const canUpdate =
    (STATUS_TRANSITIONS[order.status as OrderStatusValue] ?? []).length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal order-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="modal-head">
          <div>
            <h2 id="order-details-title">Order Details</h2>
            <span className="modal-sub font-mono">#{order.id}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {canUpdate && (
              <button className="button btn-sm" onClick={onUpdateStatus}>
                Update Status
              </button>
            )}
            <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="order-details-body">
          {/* ── Top status + total bar ── */}
          <div className="order-details-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusBadge status={order.status} />
              <span className="text-muted" style={{ fontSize: 12 }}>
                Placed {formatDateTime(raw.createdAt || raw.date)}
              </span>
            </div>
            <strong style={{ color: "var(--pink)", fontSize: 16 }}>
              {formatCurrency(order.total)}
            </strong>
          </div>

          {/* ── Timeline ── */}
          <section className="order-section">
            <h3 className="order-section-title">Status Timeline</h3>
            <OrderTimeline
              currentStatus={order.status as OrderStatusValue}
              history={history}
            />
          </section>

          {/* Tracking link if available */}
          {raw.trackingLink && (
            <a
              href={raw.trackingLink}
              target="_blank"
              rel="noreferrer"
              className="tracking-view-btn"
            >
              <ExternalLink size={13} /> View Tracking — {raw.awbNumber || ""}
            </a>
          )}

          {/* ── Info grid ── */}
          <div className="order-info-grid">
            {/* Customer */}
            <section className="order-info-card">
              <h3 className="order-section-title">Customer</h3>
              <dl className="info-list">
                <dt>Name</dt>
                <dd>{raw.userId?.name || order.customer || "Guest"}</dd>
                <dt>Email</dt>
                <dd>{raw.userId?.email || order.email || "N/A"}</dd>
                <dt>Role</dt>
                <dd>
                  <span className="pill">{raw.userId?.role || "user"}</span>
                </dd>
              </dl>
            </section>

            {/* Shipping */}
            <section className="order-info-card">
              <h3 className="order-section-title">Shipping</h3>
              <dl className="info-list">
                <dt>Recipient</dt>
                <dd>{raw.recipientName || order.customer || "N/A"}</dd>
                <dt>Phone</dt>
                <dd>{raw.phone || "N/A"}</dd>
                <dt>Address</dt>
                <dd>{raw.address || "N/A"}</dd>
                <dt>City / State</dt>
                <dd>{[raw.city, raw.state].filter(Boolean).join(", ") || "N/A"}</dd>
                <dt>PIN</dt>
                <dd>{raw.zip || "N/A"}</dd>
                <dt>Delivery</dt>
                <dd className="capitalize">{raw.deliveryType || "Normal"}</dd>
              </dl>
            </section>

            {/* Payment */}
            <section className="order-info-card">
              <h3 className="order-section-title">Payment</h3>
              <dl className="info-list">
                <dt>Method</dt>
                <dd>
                  <span className="pill">{raw.paymentMethod || "COD"}</span>
                </dd>
                <dt>Transaction ID</dt>
                <dd>{raw.paymentId || "N/A"}</dd>
                <dt>Coupon</dt>
                <dd>
                  {raw.couponCode ? (
                    <code className="coupon-code">{raw.couponCode}</code>
                  ) : (
                    "None"
                  )}
                </dd>
                <dt>Notes</dt>
                <dd>{raw.orderNotes || "—"}</dd>
              </dl>
            </section>
          </div>

          {/* ── Items ── */}
          <section className="order-section">
            <h3 className="order-section-title">
              Items Ordered
              <span className="order-section-count">{products.length}</span>
            </h3>
            <div className="order-items-table-wrap">
              <table style={{ margin: 0, width: "100%" }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                    <th style={{ textAlign: "center", width: 70 }}>Qty</th>
                    <th style={{ textAlign: "right", width: 110 }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item: any, idx: number) => {
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const subtotal = price * qty;
                    return (
                      <tr
                        key={item._id || idx}
                        style={{
                          borderBottom:
                            idx < products.length - 1
                              ? "1px solid var(--line)"
                              : "none",
                        }}
                      >
                        <td style={{ padding: "12px 14px" }}>
                          <div className="order-product-cell">
                            <img
                              src={
                                item.image ||
                                "https://res.cloudinary.com/datiquz4o/image/upload/v1744712803/basicsproduct/hdnmonwcw1gcbafan158.jpg"
                              }
                              alt={item.title || "Product"}
                              className="order-product-thumb"
                            />
                            <div>
                              <b style={{ fontSize: 13 }}>{item.title}</b>
                              {item.size && (
                                <span className="pill pill-xs mt-1">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            textAlign: "right",
                            verticalAlign: "middle",
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(price)}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            textAlign: "center",
                            verticalAlign: "middle",
                            color: "var(--muted)",
                          }}
                        >
                          {qty}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            textAlign: "right",
                            verticalAlign: "middle",
                            fontWeight: 700,
                          }}
                        >
                          {formatCurrency(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
