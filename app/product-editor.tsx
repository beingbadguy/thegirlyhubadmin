"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, DragEvent, FormEvent, useState } from "react";
import { z } from "zod";
import { api, getApiError } from "./api-client";
import { SpinnerButton, Toast } from "./ui";
import type { ProductRecord } from "./product-types";

const productSchema = z
  .object({
    title: z.string().trim().min(2, "Product name is required"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    originalPrice: z.coerce.number().positive("Enter the original price"),
    price: z.coerce.number().nonnegative("Enter the discounted price"),
    stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
    category: z.string().min(1, "Choose a category"),
  })
  .refine((data) => data.price <= data.originalPrice, {
    path: ["price"],
    message: "Discounted price cannot exceed original price",
  });

export function ProductEditor({
  product,
  categories = [],
  onDone,
}: {
  product?: ProductRecord;
  categories?: string[];
  onDone: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(product?.images || []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const selected = Array.from(list).filter((file) =>
      file.type.startsWith("image/"),
    );
    setFiles((current) => [...current, ...selected]);
    setPreviews((current) => [
      ...current,
      ...selected.map((file) => URL.createObjectURL(file)),
    ]);
  };
  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };
  const removePreview = (index: number) => {
    setFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    setPreviews((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check the form fields");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData(event.currentTarget);
      files.forEach((file) => form.append("productImage", file));
      if (product) await api.put(`/api/product/${product.id}`, form);
      else await api.post("/api/product", form);
      onDone();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to save product."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="product-editor" onSubmit={submit}>
      <div className="editor-main">
        <label>
          Product name
          <input name="title" defaultValue={product?.title} />
        </label>
        <label>
          Description
          <textarea
            name="description"
            rows={5}
            defaultValue={product?.description}
          />
        </label>
        <div className="editor-grid">
          <label>
            Original price
            <input
              name="originalPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.originalPrice}
            />
          </label>
          <label>
            Discounted price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.price}
            />
          </label>
          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={product?.stock}
            />
          </label>
          <label>
            Category
            <select name="category" defaultValue={product?.category || ""}>
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Long product information
          <textarea name="longInformation" rows={5} />
        </label>
      </div>
      <div className="editor-side">
        <label
          className="dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={drop}
        >
          <ImagePlus size={24} />
          <b>Drop product images here</b>
          <span>or click to browse · JPG, PNG or WEBP</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              addFiles(event.target.files)
            }
          />
        </label>
        {previews.length > 0 && (
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div className="preview-item" key={`${preview}-${index}`}>
                <Image
                  src={preview}
                  alt={`Product preview ${index + 1}`}
                  width={180}
                  height={180}
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <Toast message={error} />}
      </div>
      <div className="editor-actions">
        <a className="button soft" href="/products">
          Cancel
        </a>
        <SpinnerButton loading={busy}>
          {product ? "Save product" : "Create product"}
        </SpinnerButton>
      </div>
    </form>
  );
}
