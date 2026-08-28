"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../admin-data";
import { AdminShell, Button, Empty, PageTitle } from "../admin-shared";
import { Pagination, usePagination } from "../pagination";
import { ProductEditor } from "../product-editor";
import { useProductStore } from "../product-store";
import type { ProductRecord } from "../product-types";
import { ConfirmDialog, SkeletonRows, Toast } from "../ui";
import Image from "next/image";
import image from "next/image";

export default function ProductsPage() {
  const store = useProductStore();
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [edit, setEdit] = useState<ProductRecord | null>(null);
  const [remove, setRemove] = useState<ProductRecord | null>(null);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const categories = useMemo(
    () =>
      Array.from(new Set(store.products.map((product) => product.category))),
    [store.products],
  );
  const filteredProducts = store.products.filter((product) => {
    const matchesQuery = product.title
      .toLowerCase()
      .includes(debouncedQuery.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    const matchesStatus =
      status === "all" ||
      (status === "active" ? product.active : !product.active);
    return matchesQuery && matchesCategory && matchesStatus;
  });
  const pagination = usePagination(filteredProducts);

  const resetToFirstPage = () => pagination.setPage(1);
  const confirmDelete = async () => {
    if (!remove) return;
    await store.deleteProduct(remove);
    setRemove(null);
  };

  return (
    <AdminShell active="/products">
      <PageTitle
        title="Products"
        description="Manage your catalogue and inventory."
        action={
          <Button href="/addproduct">
            <Plus size={17} /> Add product
          </Button>
        }
      />
      <div className="filter-toolbar">
        <label className="search-box flex items-center gap-2 rounded-lg border border-[#e9e8e5] bg-white px-3 text-[#999] shadow-sm focus-within:border-[#db4d79] focus-within:ring-4 focus-within:ring-[#fce7ee] transition max-w-sm">
          <Search size={17} />
          <input
            className="w-full bg-transparent py-2.5 outline-none border-0 text-sm"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetToFirstPage();
            }}
            placeholder="Search products"
          />
        </label>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            resetToFirstPage();
          }}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            resetToFirstPage();
          }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="result-count">{filteredProducts.length} products</span>
      </div>

      {store.error && <Toast message={store.error} />}
      {store.loading ? (
        <div className="panel">
          <SkeletonRows />
        </div>
      ) : (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.visibleItems.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <div className="product-swatch rounded-lg overflow-hidden border border-[#e9e8e5] bg-[#fcfcfa] flex items-center justify-center flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-pink-600">G</span>
                        )}
                      </div>
                      <b>{product.title}</b>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <b>{formatCurrency(product.price)}</b>{" "}
                    <del>{formatCurrency(product.originalPrice)}</del>
                  </td>
                  <td className={product.stock < 10 ? "low-stock" : ""}>
                    {product.stock}
                  </td>
                  <td>
                    <button
                      disabled={store.mutationId === product.id}
                      className={`switch ${product.active ? "on" : ""}`}
                      onClick={() => void store.toggleProduct(product)}
                      aria-label={`Toggle ${product.title} status`}
                    >
                      <i />
                    </button>
                    <span className="active-label">
                      {product.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        onClick={() => setEdit(product)}
                        aria-label={`Edit ${product.title}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => setRemove(product)}
                        aria-label={`Delete ${product.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination.visibleItems.length === 0 && (
            <Empty text="No products match these filters" />
          )}
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
          />
        </div>
      )}

      {edit && (
        <div className="modal-backdrop">
          <div className="modal product-modal">
            <div className="modal-head">
              <h2>Edit product</h2>
              <button
                className="icon-button"
                onClick={() => setEdit(null)}
                aria-label="Close editor"
              >
                ×
              </button>
            </div>
            <ProductEditor
              product={edit}
              categories={categories}
              onDone={() => {
                setEdit(null);
                void fetchProducts();
              }}
            />
          </div>
        </div>
      )}
      {remove && (
        <ConfirmDialog
          title="Delete product?"
          description={`This will permanently remove ${remove.title}.`}
          onConfirm={() => void confirmDelete()}
          onClose={() => setRemove(null)}
          busy={store.mutationId === remove.id}
        />
      )}
    </AdminShell>
  );
}
