"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  normalizeOrder,
  type Order,
  type OrderStatus,
} from "../admin-data";
import { AdminShell, Empty, PageTitle } from "../admin-shared";
import { api, getApiError } from "../api-client";
import { Pagination, usePagination } from "../pagination";
import { useApiResource } from "../use-api-resource";

const statuses: OrderStatus[] = [
  "processing",
  "reviewing",
  "preparing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

export default function OrdersPage() {
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const resource = useApiResource<any[] | { orders: any[] }>(
    "/api/orders",
    [],
  );
  const rawOrders = Array.isArray(resource.data)
    ? resource.data
    : resource.data.orders || [];
  const orders = rawOrders.map(normalizeOrder);
  const pagination = usePagination(orders);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.put(`/api/orders/${id}`, { status });
      await resource.refresh();
      if (viewingOrder && viewingOrder.id === id) {
        setViewingOrder((prev) => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      alert(getApiError(error, "Order status update failed."));
    }
  };

  return (
    <AdminShell active="/orders">
      <PageTitle title="Orders" description="Track and fulfil every customer order." />
      <div className="panel table-panel">
        {resource.error ? (
          <Empty text={resource.error} />
        ) : resource.loading ? (
          <Empty text="Loading orders..." />
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
                {pagination.visibleItems.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <b>{order.id}</b>
                      <small className="cell-sub">
                        {order.items} items · {order.delivery}
                      </small>
                    </td>
                    <td>
                      <b>{order.customer}</b>
                      <small className="cell-sub">{order.email}</small>
                    </td>
                    <td>{formatDate(order.date)}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <select
                        disabled={resource.loading}
                        value={order.status}
                        onChange={(event) =>
                          void updateStatus(
                            order.id,
                            event.target.value as OrderStatus,
                          )
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          onClick={() => setViewingOrder(order)}
                          aria-label={`View order ${order.id}`}
                          title="View order details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </AdminShell>
  );
}

function OrderDetailsModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const raw = order.raw || {};
  const products = raw.products || [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        style={{ width: "min(850px, 95%)", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="modal-head">
          <div>
            <h2 id="order-details-title" className="font-bold text-lg">Order Details</h2>
            <span className="font-mono text-xs text-[#888]">ID: {order.id}</span>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 mt-5">
          {/* Top summary row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efefec] pb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                order.status === "completed" || order.status === "delivered"
                  ? "bg-[#e2f1e3] text-[#4b8c5d]"
                  : order.status === "cancelled"
                  ? "bg-[#fbecec] text-[#c95656]"
                  : "bg-[#fbe7ed] text-[#db4d79]"
              }`}>
                {order.status}
              </span>
              <span className="text-xs text-[#999]">
                Placed on {formatDateTime(raw.createdAt || raw.date)}
              </span>
            </div>
            <strong className="text-[#db4d79] text-base">{formatCurrency(order.total)}</strong>
          </div>

          {/* Info blocks layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-[#efefec] pb-5">
            {/* Customer Section */}
            <div className="grid gap-2 content-start">
              <h3 className="text-xs font-bold text-[#292929] uppercase tracking-wider">Customer</h3>
              <div className="grid gap-1 text-xs text-[#6e6e69]">
                <span><b>Name:</b> {raw.userId?.name || order.customer || "Guest"}</span>
                <span><b>Email:</b> {raw.userId?.email || order.email || "N/A"}</span>
                <span><b>Role:</b> <span className="uppercase text-[10px] font-bold bg-[#f1f1ed] px-1 py-0.5 rounded">{raw.userId?.role || "user"}</span></span>
                <span><b>User ID:</b> <small className="font-mono bg-[#f6f6f3] px-1 rounded">{raw.userId?._id || "N/A"}</small></span>
              </div>
            </div>

            {/* Address Section */}
            <div className="grid gap-2 content-start">
              <h3 className="text-xs font-bold text-[#292929] uppercase tracking-wider">Shipping Address</h3>
              <div className="grid gap-1 text-xs text-[#6e6e69]">
                <span><b>Recipient:</b> {raw.recipientName || order.customer || "N/A"}</span>
                <span><b>Phone:</b> {raw.phone || "N/A"}</span>
                <span><b>Street:</b> {raw.address || "N/A"}</span>
                <span><b>Landmark:</b> {raw.landmark || "N/A"}</span>
                <span><b>City/State:</b> {raw.city || "N/A"}, {raw.state || "N/A"}</span>
                <span><b>ZIP Code:</b> {raw.zip || "N/A"}</span>
                <span><b>Delivery Type:</b> <span className="capitalize">{raw.deliveryType || "normal"}</span></span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="grid gap-2 content-start">
              <h3 className="text-xs font-bold text-[#292929] uppercase tracking-wider">Payment Details</h3>
              <div className="grid gap-1 text-xs text-[#6e6e69]">
                <span><b>Method:</b> <span className="uppercase text-[10px] font-bold bg-[#f1f1ed] px-1 py-0.5 rounded">{raw.paymentMethod || "COD"}</span></span>
                <span><b>Transaction ID:</b> {raw.paymentId || "N/A"}</span>
                <span><b>Coupon Applied:</b> {raw.couponCode ? <code className="bg-[#fce7ee] text-[#db4d79] px-1 rounded font-bold">{raw.couponCode}</code> : "None"}</span>
                <span><b>Notes:</b> {raw.orderNotes || "No notes"}</span>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="grid gap-3">
            <h3 className="text-xs font-bold text-[#292929] uppercase tracking-wider">Items Ordered ({products.length})</h3>
            <div className="border border-[#e9e8e5] rounded-xl overflow-hidden bg-white shadow-sm">
              <table style={{ margin: 0, width: "100%" }}>
                <thead>
                  <tr style={{ background: "#fcfcfa", borderBottom: "1px solid #e9e8e5" }}>
                    <th style={{ padding: "10px 14px", fontSize: "11px", textAlign: "left" }}>Product</th>
                    <th style={{ padding: "10px 14px", fontSize: "11px", textAlign: "right" }}>Price</th>
                    <th style={{ padding: "10px 14px", fontSize: "11px", textAlign: "center", width: "80px" }}>Qty</th>
                    <th style={{ padding: "10px 14px", fontSize: "11px", textAlign: "right", width: "120px" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item: any, idx: number) => {
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const subtotal = price * qty;
                    return (
                      <tr key={item._id || idx} style={{ borderBottom: idx < products.length - 1 ? "1px solid #efefec" : "none" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image || "https://res.cloudinary.com/datiquz4o/image/upload/v1744712803/basicsproduct/hdnmonwcw1gcbafan158.jpg"}
                              alt={item.title || "Product item"}
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "6px",
                                border: "1px solid #e9e8e5",
                                objectFit: "contain",
                                background: "#fcfcfa",
                              }}
                            />
                            <div>
                              <b style={{ fontSize: "12px", display: "block" }}>{item.title}</b>
                              {item.size && (
                                <span className="text-[10px] bg-[#f1f1ed] px-1.5 py-0.5 rounded text-[#777] font-bold uppercase mt-1 inline-block">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", verticalAlign: "middle" }} className="tabular-nums font-semibold">
                          {formatCurrency(price)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", verticalAlign: "middle" }} className="tabular-nums font-medium text-[#777]">
                          {qty}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", verticalAlign: "middle" }} className="tabular-nums font-bold">
                          {formatCurrency(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
