"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, DragEvent, FormEvent, useState, useEffect, useRef } from "react";
import { z } from "zod";
import { api, getApiError } from "./api-client";
import { compressImage } from "@/utils/image";
import { SpinnerButton, Toast } from "./ui";
import type { ProductRecord } from "./product-types";

const productSchema = z
  .object({
    title: z.string().trim().min(2, "Product name is required"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().positive("Enter the original price"),
    discountedPrice: z.coerce.number().nonnegative("Enter the discounted price"),
    countInStock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
    category: z.string().min(1, "Choose a category"),
    info: z.string().trim().min(10, "Long information must be at least 10 characters"),
    weight: z.coerce.number().positive("Weight must be positive").optional().or(z.literal("")),
    brand: z.string().trim().optional(),
  })
  .refine((data) => data.discountedPrice <= data.price, {
    path: ["discountedPrice"],
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
  const [fetchedCategories, setFetchedCategories] = useState<string[]>(categories);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(product?.images || []);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const createdUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    api.get<any>("/api/category")
      .then((res) => {
        if (!mounted) return;
        const cats = Array.isArray(res.data)
          ? res.data
          : res.data?.categories || [];
        const activeCatNames = cats
          .filter((c: any) => c.isActive !== false && c.isDeleted !== true)
          .map((c: any) => c.name);
        const merged = Array.from(new Set([...categories, ...activeCatNames]));
        setFetchedCategories(merged);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
    return () => {
      mounted = false;
    };
  }, [categories]);

  useEffect(() => {
    return () => {
      // Clean up all object URLs created by this component on unmount
      createdUrls.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const selected = Array.from(list).filter((file) =>
      file.type.startsWith("image/"),
    );
    const newPreviews = selected.map((file) => {
      const url = URL.createObjectURL(file);
      createdUrls.current.add(url);
      (file as any).previewUrl = url;
      return url;
    });
    setImages((current) => [...current, ...selected]);
    setPreviews((current) => [...current, ...newPreviews]);
  };

  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const removePreview = (index: number) => {
    const urlToRemove = previews[index];
    if (urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove);
      createdUrls.current.delete(urlToRemove);
    }
    setImages((current) =>
      current.filter((file) => (file as any).previewUrl !== urlToRemove),
    );
    setPreviews((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());

    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (previews.length === 0 && images.length === 0) {
      setErrors({ image: "At least one product image is required" });
      return;
    }

    setBusy(true);
    try {
      // Build a clean FormData from scratch so we control exactly what is sent
      const form = new FormData();

      // Append all text/number fields from the HTML form
      for (const [key, value] of new FormData(event.currentTarget).entries()) {
        // Skip any stale file inputs — we manage files manually below
        if (value instanceof File) continue;
        form.append(key, value);
      }

      // Compress new image files client-side before sending
      const compressedImages = await Promise.all(
        images.map((file) => compressImage(file))
      );

      // Append new image files selected by the admin
      compressedImages.forEach((file) => {
        form.append("images", file);
      });

      if (product) {
        // For edits: also forward existing Cloudinary URLs that the admin kept
        // (any preview that is NOT a local blob is an already-uploaded URL)
        const existingImageUrls = previews.filter(
          (url) => !url.startsWith("blob:"),
        );
        existingImageUrls.forEach((url) => {
          form.append("existingImages", url);
        });

        await api.put(`/api/product/${product.id}`, form);
      } else {
        await api.post("/api/product", form);
      }

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
          <div className="label-header">
            <span>Product name</span>
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>
          <input name="title" defaultValue={product?.title} />
        </label>
        <label>
          <div className="label-header">
            <span>Description</span>
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>
          <textarea
            name="description"
            rows={5}
            defaultValue={product?.description}
          />
        </label>
        <div className="editor-grid">
          <label>
            <div className="label-header">
              <span>Original price</span>
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.originalPrice}
            />
          </label>
          <label>
            <div className="label-header">
              <span>Discounted price</span>
              {errors.discountedPrice && <span className="field-error">{errors.discountedPrice}</span>}
            </div>
            <input
              name="discountedPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.price}
            />
          </label>
          <label>
            <div className="label-header">
              <span>Stock</span>
              {errors.countInStock && <span className="field-error">{errors.countInStock}</span>}
            </div>
            <input
              name="countInStock"
              type="number"
              min="0"
              defaultValue={product?.stock}
            />
          </label>
          <label>
            <div className="label-header">
              <span>Category</span>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>
            <select name="category" defaultValue={product?.category || ""}>
              <option value="">Choose category</option>
              {fetchedCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            <div className="label-header">
              <span>Weight (kg)</span>
              {errors.weight && <span className="field-error">{errors.weight}</span>}
            </div>
            <input
              name="weight"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.weight}
            />
          </label>
          <label>
            <div className="label-header">
              <span>Brand</span>
              {errors.brand && <span className="field-error">{errors.brand}</span>}
            </div>
            <input
              name="brand"
              type="text"
              defaultValue={product?.brand}
            />
          </label>
        </div>
        <label>
          <div className="label-header">
            <span>Long product information</span>
            {errors.info && <span className="field-error">{errors.info}</span>}
          </div>
          <textarea
            name="info"
            rows={5}
            defaultValue={product?.info}
          />
        </label>
      </div>
      <div className="editor-side">
        <div className="label-header">
          <span style={{ fontWeight: 600, color: "#6e6e69", fontSize: "12px" }}>Product images</span>
          {errors.image && <span className="field-error">{errors.image}</span>}
        </div>
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
