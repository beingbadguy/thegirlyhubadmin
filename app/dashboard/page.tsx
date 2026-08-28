"use client";
import { ShoppingBag, Users, Box, TrendingUp } from "lucide-react";
import { AdminShell, PageTitle } from "../admin-shared";
import { formatCurrency, type Order, type Product } from "../admin-data";
import { useApiResource } from "../use-api-resource";

export default function DashboardPage() {
  const ordersResource = useApiResource<Order[] | { orders: Order[] }>(
    "/api/orders",
    [],
  );
  const productsResource = useApiResource<Product[] | { products: Product[] }>(
    "/api/product",
    [],
  );
  const orders = Array.isArray(ordersResource.data)
    ? ordersResource.data
    : ordersResource.data.orders || [];
  const products = Array.isArray(productsResource.data)
    ? productsResource.data
    : productsResource.data.products || [];
  const revenue = orders.reduce((total, order) => total + order.total, 0);
  const metrics = [
    ["Net revenue", formatCurrency(revenue), TrendingUp],
    ["Total orders", "1,284", ShoppingBag],
    ["Total customers", "4,892", Users],
    ["Total products", String(products.length + 128), Box],
  ] as const;
  return (
    <AdminShell active="/dashboard">
      <PageTitle
        title="Good morning, Amelia"
        description="Here is what is happening with your store today."
      />
      {(ordersResource.error || productsResource.error) && (
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
          {orders.map((order) => (
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
      </section>
    </AdminShell>
  );
}
