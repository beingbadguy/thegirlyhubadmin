"use client";
import { FormEvent, useState } from "react";
import { Plus, Tag } from "lucide-react";
import { AdminShell, Empty, PageTitle, Status } from "../admin-shared";
import { api, getApiError } from "../api-client";
import { useApiResource } from "../use-api-resource";
import { formatDate } from "../admin-data";
import { Pagination, usePagination } from "../pagination";

type ApiCoupon = {
  _id: string;
  name: string;
  code: string;
  discount: number | string;
  isActive: boolean;
  createdAt: string;
};

type CouponResponse = { coupons: ApiCoupon[] };

export default function OthersPage() {
  const resource = useApiResource<CouponResponse>("/api/coupon", {
    coupons: [],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const coupons = resource.data.coupons || [];
  const { page, pageCount, setPage, visibleItems } = usePagination(coupons);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !code.trim() || !discount || Number(discount) <= 0) {
      setError("Enter a name, code, and discount greater than zero.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/api/coupon", {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        discount: Number(discount),
      });
      await resource.refresh();
      setName("");
      setCode("");
      setDiscount("");
    } catch (requestError) {
      setError(getApiError(requestError, "Coupon creation failed."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AdminShell active="/others">
      <PageTitle
        title="Coupons"
        description="Create and manage discounts for your store."
      />
      <div className="others-grid">
        <div className="panel coupon-form">
          <div className="panel-head">
            <h2>Create a coupon</h2>
            <Tag size={18} />
          </div>
          <form onSubmit={submit}>
            <label>
              Coupon name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              Coupon code
              <input
                required
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
              />
            </label>
            <label>
              Discount amount (%)
              <input
                required
                type="number"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
            </label>
            {error && <p className="login-error">{error}</p>}
            <button className="button" disabled={busy}>
              <Plus size={16} /> Create coupon
            </button>
          </form>
        </div>
        <div className="panel coupon-list">
          <h2>Existing coupons</h2>
          {resource.error ? (
            <Empty text={resource.error} />
          ) : resource.loading ? (
            <Empty text="Loading coupons..." />
          ) : !coupons.length ? (
            <Empty text="No coupons found" />
          ) : (
            visibleItems.map((coupon) => (
              <div className="coupon-row" key={coupon._id}>
                <Tag size={17} />
                <span>
                  <b>{coupon.name}</b>
                  <small>
                    {coupon.code} · {formatDate(coupon.createdAt)}
                  </small>
                </span>
                <strong>{coupon.discount}%</strong>
                <Status value={coupon.isActive ? "active" : "cancelled"} />
              </div>
            ))
          )}
          {!resource.loading && !resource.error && coupons.length > 0 && (
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </AdminShell>
  );
}
