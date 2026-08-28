"use client";
import { ShoppingBag, Users, Box, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AdminShell, PageTitle } from "../admin-shared";
import { formatCurrency, normalizeOrder, type Order, type Product } from "../admin-data";
import { useApiResource } from "../use-api-resource";

export default function DashboardPage() {
  const ordersResource = useApiResource<any[] | { orders: any[] }>(
    "/api/orders",
    [],
  );
  const productsResource = useApiResource<Product[] | { products: Product[] }>(
    "/api/product",
    [],
  );
  const usersResource = useApiResource<any[] | { users: any[] }>(
    "/api/users",
    [],
  );

  const rawOrders = Array.isArray(ordersResource.data)
    ? ordersResource.data
    : ordersResource.data.orders || [];
  const orders = rawOrders.map(normalizeOrder);
  const products = Array.isArray(productsResource.data)
    ? productsResource.data
    : productsResource.data.products || [];
  const rawUsers = Array.isArray(usersResource.data)
    ? usersResource.data
    : usersResource.data.users || [];

  const revenue = orders.reduce((total, order) => total + order.total, 0);

  const metrics = [
    ["Net revenue", formatCurrency(revenue), TrendingUp],
    ["Total orders", String(orders.length), ShoppingBag],
    ["Total customers", String(rawUsers.length), Users],
    ["Total products", String(products.length), Box],
  ] as const;

  return (
    <AdminShell active="/dashboard">
      <PageTitle
        title="Good morning, Amelia"
        description="Here is what is happening with your store today."
      />
      {(ordersResource.error || productsResource.error || usersResource.error) && (
        <p className="login-error">Unable to load live dashboard data.</p>
      )}
      <section className="metric-grid">
        {metrics.map(([label, value, Icon]) => (
          <div className="metric" key={label}>
            <div className="metric-icon pink">
              <Icon size={19} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>
              +18.4% <em>vs last month</em>
            </small>
          </div>
        ))}
      </section>
      <section className="dashboard-grid">
        <div className="panel revenue-panel">
          <div className="panel-head">
            <div>
              <h2>Revenue performance</h2>
              <p>Revenue over the last 12 months</p>
            </div>
          </div>
          <div className="chart">
            <div className="y-axis">
              <span>₹20k</span>
              <span>₹10k</span>
              <span>₹0</span>
            </div>
            <div className="bars">
              {[42, 56, 48, 68, 61, 78, 73, 88, 82, 94, 87, 100].map(
                (height, index) => (
                  <div className="bar-wrap" key={index}>
                    <div className="bar" style={{ height: `${height}%` }} />
                    <span>{index + 1}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
        <div className="panel recent-panel">
          <div className="panel-head">
            <div>
              <h2>Recent orders</h2>
              <p>Latest customer activity</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {orders.slice(0, 5).map((order) => (
              <div className="order-row" key={order.id}>
                <div className="order-icon">
                  <ShoppingBag size={17} />
                </div>
                <div className="order-main">
                  <b>{order.id}</b>
                  <span>{order.customer}</span>
                </div>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            ))}
          </div>
          {orders.length > 5 && (
            <div className="text-center pt-3 border-t border-[#efefec] mt-3">
              <Link href="/orders" className="text-xs font-semibold text-[#db4d79] hover:underline inline-flex items-center gap-1">
                View all orders <span className="text-sm">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
