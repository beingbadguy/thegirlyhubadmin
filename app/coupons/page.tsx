"use client";
import { FormEvent, useState } from "react";
import { Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { AdminShell, Empty, PageTitle } from "../admin-shared";
import { api, getApiError } from "../api-client";
import { useApiResource } from "../use-api-resource";
import { formatDate, formatCurrency } from "../admin-data";
import { Pagination, usePagination } from "../pagination";

type ApiCoupon = {
  _id: string;
  name: string;
  code: string;
  discount: number | string;
  isActive: boolean;
  createdAt: string;
  validTill?: string | Date;
  usersAvailed?: string[];
  type?: "percentage" | "flat";
};

type CouponResponse = { coupons: ApiCoupon[] };

export default function CouponsPage() {
  const resource = useApiResource<CouponResponse>("/api/coupon", {
    coupons: [],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState<"percentage" | "flat">("flat");
  const [validTill, setValidTill] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<ApiCoupon | null>(null);

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
        validTill: validTill || null,
        isActive,
        type,
      });
      await resource.refresh();
      setName("");
      setCode("");
      setDiscount("");
      setValidTill("");
      setIsActive(true);
      setType("flat");
    } catch (requestError) {
      setError(getApiError(requestError, "Coupon creation failed."));
    } finally {
      setBusy(false);
    }
  };

  const toggleCouponActive = async (coupon: ApiCoupon) => {
    try {
      await api.put(`/api/coupon/${coupon._id}`, {
        isActive: !coupon.isActive,
      });
      await resource.refresh();
    } catch (requestError) {
      alert(getApiError(requestError, "Failed to toggle coupon status."));
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/api/coupon/${id}`);
      await resource.refresh();
    } catch (requestError) {
      alert(getApiError(requestError, "Failed to delete coupon."));
    }
  };

  return (
    <AdminShell active="/coupons">
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
              Coupon Type
              <select
                value={type}
                onChange={(event) => setType(event.target.value as "percentage" | "flat")}
              >
                <option value="flat">Flat Amount (₹)</option>
                <option value="percentage">Percentage Discount (%)</option>
              </select>
            </label>
            <label>
              Discount value ({type === "percentage" ? "%" : "₹"})
              <input
                required
                type="number"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
            </label>
            <label>
              Expiration Date (Valid Till)
              <input
                type="date"
                value={validTill}
                onChange={(event) => setValidTill(event.target.value)}
              />
            </label>
            <div className="flex items-center justify-between border-t border-[#efefec] pt-3 mt-1">
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#6e6e69" }}>Active Status</span>
              <button
                type="button"
                className={`switch ${isActive ? "on" : ""}`}
                onClick={() => setIsActive(!isActive)}
              >
                <i />
              </button>
            </div>
            {error && <p className="login-error">{error}</p>}
            <button className="button mt-2" disabled={busy}>
              <Plus size={16} /> Create coupon
            </button>
          </form>
        </div>
        <div className="panel coupon-list table-panel" style={{ overflowX: "auto" }}>
          <h2 style={{ padding: "20px 20px 0" }}>Existing coupons</h2>
          {resource.error ? (
            <Empty text={resource.error} />
          ) : resource.loading ? (
            <Empty text="Loading coupons..." />
          ) : !coupons.length ? (
            <Empty text="No coupons found" />
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Coupon</th>
                    <th>Type</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Toggle</th>
                    <th>Availed By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((coupon) => {
                    const isExpired = coupon.validTill && new Date(coupon.validTill).getTime() < Date.now();
                    const statusText = isExpired ? "Expired" : coupon.isActive ? "Active" : "Inactive";
                    const availedCount = coupon.usersAvailed?.length || 0;

                    return (
                      <tr key={coupon._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Tag size={17} className="text-[#db4d79]" />
                            <div>
                              <b className="block">{coupon.name}</b>
                              <small className="text-[#999] block font-mono">
                                {coupon.code} {coupon.validTill && `· Till ${formatDate(coupon.validTill)}`}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            coupon.type === "percentage" ? "bg-[#fce7ee] text-[#db4d79]" : "bg-[#f1f1ed] text-[#5d5d59]"
                          }`}>
                            {coupon.type === "percentage" ? "Percentage" : "Flat"}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {coupon.type === "percentage"
                              ? `${coupon.discount}%`
                              : formatCurrency(Number(coupon.discount))}
                          </strong>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            statusText === "Active"
                              ? "bg-[#e2f1e3] text-[#4b8c5d]"
                              : statusText === "Expired"
                              ? "bg-[#f6f6f3] text-[#888]"
                              : "bg-[#fbecec] text-[#c95656]"
                          }`}>
                            {statusText}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`switch ${coupon.isActive ? "on" : ""}`}
                            onClick={() => void toggleCouponActive(coupon)}
                            aria-label="Toggle coupon status"
                          >
                            <i />
                          </button>
                        </td>
                        <td>
                          <div className="relative group inline-block">
                            <span className="cursor-pointer underline decoration-dotted text-xs text-[#6e6e69]">
                              {availedCount} {availedCount === 1 ? "user" : "users"}
                            </span>
                            {availedCount > 0 && (
                              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-20 w-52 p-3 bg-white text-[#292929] border border-[#e9e8e5] text-[10px] rounded-lg shadow-xl">
                                <p className="font-bold border-b border-[#efefec] pb-1 mb-1 text-[#292929]">Availed User IDs:</p>
                                <ul className="max-h-24 overflow-y-auto font-mono list-disc list-inside text-[#6e6e69]">
                                  {coupon.usersAvailed?.map((uid, idx) => (
                                    <li key={idx} className="truncate" title={uid}>
                                      {uid}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-button"
                              onClick={() => setEditingCoupon(coupon)}
                              aria-label="Edit coupon"
                              title="Edit coupon"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="icon-button danger"
                              onClick={() => void deleteCoupon(coupon._id)}
                              aria-label="Delete coupon"
                              title="Delete coupon"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      {editingCoupon && (
        <EditCouponModal
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onSaved={async () => {
            await resource.refresh();
            setEditingCoupon(null);
          }}
        />
      )}
    </AdminShell>
  );
}

function EditCouponModal({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: ApiCoupon;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(coupon.name);
  const [code, setCode] = useState(coupon.code);
  const [discount, setDiscount] = useState(String(coupon.discount));
  const [type, setType] = useState<"percentage" | "flat">(coupon.type || "flat");
  const [validTill, setValidTill] = useState(
    coupon.validTill ? new Date(coupon.validTill).toISOString().split("T")[0] : ""
  );
  const [isActive, setIsActive] = useState(coupon.isActive);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !code.trim() || !discount || Number(discount) <= 0) {
      setError("Enter a name, code, and discount greater than zero.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.put(`/api/coupon/${coupon._id}`, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        discount: Number(discount),
        type,
        validTill: validTill || null,
        isActive,
      });
      await onSaved();
    } catch (requestError) {
      setError(getApiError(requestError, "Failed to update coupon."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        style={{ width: "min(420px, 100%)" }}
      >
        <div className="modal-head">
          <h2 className="font-bold text-lg">Edit coupon</h2>
          <button className="icon-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-form">
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
            Coupon Type
            <select
              value={type}
              onChange={(event) => setType(event.target.value as "percentage" | "flat")}
            >
              <option value="flat">Flat Amount (₹)</option>
              <option value="percentage">Percentage Discount (%)</option>
            </select>
          </label>
          <label>
            Discount value ({type === "percentage" ? "%" : "₹"})
            <input
              required
              type="number"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
            />
          </label>
          <label>
            Expiration Date (Valid Till)
            <input
              type="date"
              value={validTill}
              onChange={(event) => setValidTill(event.target.value)}
            />
          </label>
          <div className="flex items-center justify-between border-t border-[#efefec] pt-3 mt-1">
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#6e6e69" }}>Active Status</span>
            <button
              type="button"
              className={`switch ${isActive ? "on" : ""}`}
              onClick={() => setIsActive(!isActive)}
            >
              <i />
            </button>
          </div>
          {error && <p className="login-error">{error}</p>}
          <div className="form-actions mt-3">
            <button
              className="button soft"
              type="button"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="button" disabled={busy}>
              {busy ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
