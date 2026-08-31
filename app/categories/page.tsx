"use client";
import Image from "next/image";
import { Edit3, FolderHeart, Search, Trash2, X } from "lucide-react";
import { AdminShell, Empty, PageTitle } from "../admin-shared";
import { api, getApiError } from "../api-client";
import { useApiResource } from "../use-api-resource";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { compressImage } from "@/utils/image";
import type { Category } from "../admin-data";
import { Pagination, usePagination } from "../pagination";

type ApiCategory = Category & {
  _id?: string;
  categoryImage?: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

export default function CategoriesPage() {
  const resource = useApiResource<
    ApiCategory[] | { categories: ApiCategory[] }
  >("/api/category?page=1&limit=100", []);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const apiCategories = Array.isArray(resource.data)
    ? resource.data
    : resource.data.categories || [];
  
  // Only show categories which are active (isActive !== false)
  const categories = apiCategories
    .filter((category) => category.isActive === true)
    .map((category) => ({
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
    } catch (error: any) {
      if (error?.response?.status === 400) {
        alert("Cannot delete category because it contains active products.");
      } else {
        alert(getApiError(error, "Category deletion failed."));
      }
    }
  };

  return (
    <AdminShell active="/categories">
      <PageTitle
        title="Categories"
        description="Organise products so customers can find their favourites."
        action={
          <div className="flex gap-2">
            <button
              className="button soft"
              onClick={() => setShowTrash(true)}
              title="Deleted categories"
            >
              <Trash2 size={16} className="mr-1" /> Trash
            </button>
            <a className="button" href="/addcategory">
              Add category
            </a>
          </div>
        }
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-[#e9e8e5] bg-white px-3 text-[#999] shadow-sm focus-within:border-[#db4d79] focus-within:ring-4 focus-within:ring-[#fce7ee] transition">
          <Search size={17} />
          <input
            className="w-full bg-transparent py-2.5 outline-none border-0 text-sm"
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
                <div className="flex items-center gap-1">
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
      {showTrash && (
        <DeletedCategoriesModal
          onClose={() => setShowTrash(false)}
          onRestored={async () => {
            await resource.refresh();
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
  const [newName, setNewName] = useState(category.name);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(category.image || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setNewName(category.name);
      setPreview(category.image || "");
      setFile(null);
    }
  }, [category]);

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
      if (file) {
        const compressedFile = await compressImage(file);
        form.set("image", compressedFile);
      }
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
            <input
              name="name"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#e9e8e5] text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-[#db4d79] bg-white text-[#292929] transition font-normal"
            />
          </label>
          <div className="grid gap-2 text-sm font-semibold text-[#5f5f5b]">
            <span>Category image</span>
            <span className="text-xs font-normal text-[#999] mb-1">
              Optional — leave unchanged to keep the current image.
            </span>
            <div className="flex flex-col items-center gap-3">
              {preview && (
                <Image
                  className="upload-preview rounded-xl border border-[#e9e8e5] object-contain bg-[#fcfcfa]"
                  src={preview}
                  alt="Category preview"
                  width={320}
                  height={190}
                  unoptimized
                />
              )}
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-[#e9e8e5] bg-white px-4 py-2.5 text-xs font-semibold text-[#292929] transition hover:border-[#db4d79] hover:text-[#db4d79]">
                {preview ? "Change image" : "Choose image"}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="sr-only"
                  onChange={chooseImage}
                />
              </label>
            </div>
          </div>
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

function DeletedCategoriesModal({
  onClose,
  onRestored,
}: {
  onClose: () => void;
  onRestored: () => Promise<void>;
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchDeleted = async () => {
    setLoading(true);
    setError("");
    try {
      const [deletedRes, activeRes] = await Promise.all([
        api.get<{ categories: ApiCategory[] }>("/api/category?deleted=true&limit=100"),
        api.get<{ categories: ApiCategory[] }>("/api/category?deleted=false&limit=100"),
      ]);

      const deletedCats = deletedRes.data.categories || [];
      const inactiveCats = (activeRes.data.categories || []).filter(
        (cat) => cat.isActive === false
      );

      // Merge both lists and de-duplicate by ID
      const merged = [...deletedCats, ...inactiveCats];
      const uniqueMap = new Map<string, ApiCategory>();
      for (const cat of merged) {
        const id = cat._id || cat.id || "";
        if (id) uniqueMap.set(id, cat);
      }

      setData(Array.from(uniqueMap.values()));
    } catch (err) {
      setError(getApiError(err, "Failed to load deleted categories."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDeleted();
  }, []);

  const restore = async (id: string) => {
    setBusy(true);
    try {
      await api.put(`/api/category/${id}`, { isDeleted: false, isActive: true });
      await fetchDeleted();
      await onRestored();
    } catch (err) {
      alert(getApiError(err, "Failed to restore category."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Permanently delete this category from trash?")) return;
    setBusy(true);
    try {
      await api.delete(`/api/category/${id}`);
      await fetchDeleted();
      await onRestored();
    } catch (err) {
      alert(getApiError(err, "Failed to remove category."));
    } finally {
      setBusy(false);
    }
  };

  const limit = 5;
  const totalPages = data ? Math.ceil(data.length / limit) || 1 : 1;
  const visibleCategories = data ? data.slice((page - 1) * limit, page * limit) : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(500px, 100%)" }}
      >
        <div className="modal-head border-b border-[#efefec] pb-3">
          <h2 className="text-lg font-bold">Deleted Categories</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        
        <div className="my-4 min-h-[250px] flex flex-col justify-between">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-[#777]">
              Loading deleted categories...
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm py-4">{error}</div>
          ) : !data?.length ? (
            <div className="flex items-center justify-center py-10 text-sm text-[#777]">
              No deleted categories found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleCategories.map((cat) => {
                const catId = cat._id || cat.id || "";
                const catImage = cat.categoryImage || cat.image || "";
                return (
                  <div
                    key={catId}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#e9e8e5] bg-[#fcfcfa]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-[#e9e8e5] flex-shrink-0">
                        {catImage ? (
                          <Image
                            src={catImage}
                            alt={cat.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-pink-50 text-pink-500 font-bold text-sm">
                            {cat.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <b className="text-sm text-[#292929] block">{cat.name}</b>
                        {cat.isActive === false && cat.isDeleted !== true && (
                          <span className="text-[10px] text-[#db4d79] bg-pink-50 border border-pink-100 px-1.5 py-0.5 rounded font-normal mt-0.5 inline-block">
                            Inactive
                          </span>
                        )}
                        {cat.isDeleted === true && (
                          <span className="text-[10px] text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-normal mt-0.5 inline-block">
                            Deleted
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="button soft compact text-xs"
                        disabled={busy}
                        onClick={() => void restore(catId)}
                      >
                        Restore
                      </button>
                      <button
                        className="button soft danger compact text-xs"
                        style={{ color: "#c95656", borderColor: "#fbecec", background: "#fbecec" }}
                        disabled={busy}
                        onClick={() => void remove(catId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Pagination */}
          {data && totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 border-t border-[#efefec] pt-3">
              <button
                type="button"
                className="button soft compact text-xs"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="text-xs text-[#777]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="button soft compact text-xs"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
