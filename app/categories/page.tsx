"use client";
import Image from "next/image";
import { Edit3, FolderHeart, Search, Trash2, X } from "lucide-react";
import { AdminShell, Empty, PageTitle } from "../admin-shared";
import { api, getApiError } from "../api-client";
import { useApiResource } from "../use-api-resource";
import { ChangeEvent, FormEvent, useState } from "react";
import type { Category } from "../admin-data";
import { Pagination, usePagination } from "../pagination";

type ApiCategory = Category & {
  _id?: string;
  categoryImage?: string;
};

export default function CategoriesPage() {
  const resource = useApiResource<
    ApiCategory[] | { categories: ApiCategory[] }
  >("/api/category?page=1&limit=100", []);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const apiCategories = Array.isArray(resource.data)
    ? resource.data
    : resource.data.categories || [];
  const categories = apiCategories.map((category) => ({
    ...category,
    id: category._id || category.id,
    image: category.categoryImage || category.image,
  }));
  const rows = categories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );
  const { page, pageCount, setPage, visibleItems } = usePagination(rows);
  const remove = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/api/category/${id}`);
      await resource.refresh();
    } catch (error) {
      alert(getApiError(error, "Category deletion failed."));
    }
  };
  return (
    <AdminShell active="/categories">
      <PageTitle
        title="Categories"
        description="Organise products so customers can find their favourites."
        action={
          <a className="button" href="/addcategory">
            Add category
          </a>
        }
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-[#e9e8e5] bg-white px-3 text-[#999] shadow-sm">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search categories"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resource.error ? (
          <Empty text={resource.error} />
        ) : resource.loading ? (
          <Empty text="Loading categories..." />
        ) : (
          visibleItems.map((category) => (
            <div
              className="min-h-[300px] overflow-hidden rounded-xl border border-[#e9e8e5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              key={category.id}
            >
              <div
                className="relative h-52 overflow-hidden rounded-t-xl bg-[#f7f7f4]"
                style={{ background: category.image || "#ead4a7" }}
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={`${category.name} category`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <FolderHeart size={27} />
                )}
                <span className="absolute bottom-3 left-4 z-10 rounded-full bg-[#292929cc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Category
                </span>
              </div>
              <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 py-3">
                <div>
                  <b>{category.name}</b>
                  <span className="mt-1 block text-xs text-[#999]">
                    {category.productCount
                      ? `${category.productCount} products`
                      : "Browse collection"}
                  </span>
                </div>
                <button
                  className="rounded-md p-2 text-[#888] transition hover:bg-[#fbe7ed] hover:text-[#db4d79]"
                  onClick={() => setEditing(category)}
                  aria-label={`Edit ${category.name}`}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="rounded-md p-2 text-[#888] transition hover:bg-[#fbecec] hover:text-[#c95656]"
                  onClick={() => void remove(category.id)}
                  aria-label="Delete category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
        {!resource.loading && !resource.error && !rows.length && (
          <Empty text="No categories found" />
        )}
      </div>
      {!resource.loading && !resource.error && rows.length > 0 && (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      )}
      {editing && (
        <CategoryEditor
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            await resource.refresh();
            setEditing(null);
          }}
        />
      )}
    </AdminShell>
  );
}

function CategoryEditor({
  category,
  onClose,
  onSaved,
}: {
  category: Category;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(category.image || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      form.delete("image");
      if (file) form.set("image", file);
      await api.put(`/api/category/${category.id}`, form);
      await onSaved();
    } catch (requestError) {
      setError(getApiError(requestError, "Category update failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => !busy && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="category-editor-title">Edit category</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close category editor"
          >
            <X size={18} />
          </button>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-semibold text-[#5f5f5b]">
            Category name
            <input name="name" required defaultValue={category.name} />
          </label>
          <label className="grid cursor-pointer gap-2 text-sm font-semibold text-[#5f5f5b]">
            Category image <span className="text-xs font-normal text-[#999]">Optional — leave unchanged to keep the current image.</span>
            {preview && (
              <Image
                className="upload-preview"
                src={preview}
                alt="Category preview"
                width={320}
                height={190}
                unoptimized
              />
            )}
            <input type="file" name="image" accept="image/*" onChange={chooseImage} />
          </label>
          {error && <p className="login-error">{error}</p>}
          <div className="form-actions">
            <button className="button soft" type="button" onClick={onClose} disabled={busy}>
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
