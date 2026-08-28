"use client";
import Image from "next/image";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, getApiError } from "../api-client";
import { ChangeEvent, useState } from "react";
import { AdminShell, Button, PageTitle } from "../admin-shared";

export default function AddCategoryPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setFileError("");
    setPreview(URL.createObjectURL(selected));
  };
  const removeImage = () => {
    setFile(null);
    setPreview("");
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFileError("");
    if (!file) {
      setFileError("Please choose a category image.");
      setBusy(false);
      return;
    }
    try {
      const form = new FormData(event.currentTarget);
      form.set("image", file);
      await api.post("/api/category", form);
      router.replace("/categories");
    } catch (requestError) {
      setError(getApiError(requestError, "Category creation failed."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AdminShell active="/categories">
      <PageTitle
        title="Add a category"
        description="Create a new way for shoppers to browse."
      />
      <form
        className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_360px]"
        onSubmit={submit}
      >
        <div className="grid content-start gap-5 rounded-xl border border-[#e9e8e5] bg-white p-6 shadow-sm">
          <label className="grid gap-2 text-sm font-semibold text-[#5f5f5b]">
            Category name
            <input
              className="min-h-12 rounded-lg border border-[#e9e8e5] px-3 outline-none transition placeholder:text-[#aaa] focus:border-[#db4d79] focus:ring-4 focus:ring-[#fce7ee]"
              name="name"
              required
              placeholder="e.g. New arrivals"
            />
          </label>
          {error && <p className="login-error">{error}</p>}
        </div>
        <div className="grid content-start gap-4">
          <div className="rounded-xl border border-[#e9e8e5] bg-white p-6 text-center shadow-sm">
            {preview ? (
              <Image
                className="mx-auto mb-4 h-48 w-full max-w-xs rounded-lg border border-[#e9e8e5] bg-[#f7f7f4] object-contain"
                src={preview}
                alt="Category preview"
                width={220}
                height={147}
                unoptimized
              />
            ) : (
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#fbe7ed] text-2xl text-[#db4d79]">
                +
              </div>
            )}
            <h2 className="font-[Space_Grotesk] text-lg font-bold">
              Category image
            </h2>
            <p className="my-2 text-xs text-[#999]">
              JPG, PNG or WEBP up to 5MB.
            </p>
            <label className="mx-auto inline-flex cursor-pointer items-center rounded-lg border border-[#e9e8e5] bg-white px-4 py-3 text-sm font-semibold text-[#292929] transition hover:border-[#db4d79] hover:text-[#db4d79]">
              {preview ? "Change image" : "Choose image"}
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={chooseImage}
              />
            </label>
            {preview && (
              <button
                type="button"
                className="mt-3 block w-full border-0 bg-transparent text-xs text-[#b34e5f]"
                onClick={removeImage}
              >
                Remove image
              </button>
            )}
            {fileError && <p className="login-error">{fileError}</p>}
          </div>
          <div className="flex justify-end gap-2 rounded-xl border border-[#e9e8e5] bg-white p-4 shadow-sm">
            <Button variant="soft" href="/categories">
              Cancel
            </Button>
            <button
              className="rounded-lg bg-[#292929] px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-60"
              disabled={busy}
            >
              {busy ? "Creating..." : "Create category"}
            </button>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
