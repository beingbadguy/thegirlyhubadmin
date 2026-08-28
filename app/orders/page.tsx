"use client";

import {
  formatCurrency,
  formatDate,
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
  const resource = useApiResource<Order[] | { orders: Order[] }>(
    "/api/orders",
    [],
  );
  const orders = Array.isArray(resource.data)
    ? resource.data
    : resource.data.orders || [];
  const pagination = usePagination(orders);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.put(`/api/orders/${id}`, { status });
      await resource.refresh();
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
    </AdminShell>
  );
}
