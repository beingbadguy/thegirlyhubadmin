"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { AdminShell, Empty, PageTitle } from "../admin-shared";
import { api, getApiError } from "../api-client";
import { formatDate } from "../admin-data";
import { useApiResource } from "../use-api-resource";
import { ConfirmDialog, SpinnerButton, Toast } from "../ui";

type ApiBanner = {
  _id: string;
  image?: string;
  bannerImage?: string;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  link?: string;
  buttonLink?: string;
  displayOrder?: number | string;
  isActive?: boolean;
  createdAt?: string;
};
type Banner = {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
  image: string;
  createdAt?: string;
};

type BannerResponse = { banners?: ApiBanner[] };
const normalize = (item: ApiBanner): Banner => ({
  _id: item._id,
  image: item.image || item.bannerImage || item.imageUrl || "",
  title: item.title || "Untitled banner",
  subtitle: item.subtitle || "",
  description: item.description || "",
  buttonText: item.buttonText || "Shop now",
  buttonLink: item.link || item.buttonLink || "#",
  displayOrder: Number(item.displayOrder || 0),
  isActive: item.isActive ?? true,
  createdAt: item.createdAt,
});

export default function BannersPage() {
  const resource = useApiResource<BannerResponse>("/api/banner?admin=true", {
    banners: [],
  });
  const [editor, setEditor] = useState<Banner | null | undefined>(undefined);
  const [remove, setRemove] = useState<Banner | null>(null);
  const [busy, setBusy] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [error, setError] = useState("");
  const banners = useMemo(
    () =>
      (resource.data.banners || [])
        .map(normalize)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [resource.data.banners],
  );
  const enabled = banners.filter((banner) => banner.isActive);
  const currentPreviewIndex = Math.min(
    previewIndex,
    Math.max(0, enabled.length - 1),
  );
  const toggle = async (banner: Banner) => {
    setBusy(banner._id);
    try {
      await api.put(`/api/banner/${banner._id}`, {
        isActive: !banner.isActive,
      });
      await resource.refresh();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to update banner status."));
    } finally {
      setBusy("");
    }
  };
  const deleteBanner = async () => {
    if (!remove) return;
    setBusy(remove._id);
    try {
      await api.delete(`/api/banner/${remove._id}`);
      await resource.refresh();
      setRemove(null);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to delete banner."));
    } finally {
      setBusy("");
    }
  };
  return (
    <AdminShell active="/banners">
      <PageTitle
        title="Banners"
        description="Manage the hero banners shown in your storefront slider."
        action={
          <button className="button" onClick={() => setEditor(null)}>
            <Plus size={17} /> Add banner
          </button>
        }
      />
      {error && <Toast message={error} onClose={() => setError("")} />}
      <div className="banner-layout">
        <section>
          <div className="section-heading">
            <div>
              <h2>Storefront banners</h2>
              <p>{banners.length} banners sorted by display order</p>
            </div>
          </div>
          <div className="banner-list">
            {resource.error ? (
              <Empty text={resource.error} />
            ) : resource.loading ? (
              <div className="panel">
                <div className="skeleton-list">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : !banners.length ? (
              <div className="panel">
                <Empty text="No banners yet" />
              </div>
            ) : (
              banners.map((banner) => (
                <article className="banner-row panel" key={banner._id}>
                  <div className="banner-thumb">
                    {banner.image ? (
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        sizes="160px"
                        unoptimized
                      />
                    ) : (
                      <ImagePlus size={24} />
                    )}
                  </div>
                  <div className="banner-copy">
                    <div className="banner-title">
                      <span className="order-chip">#{banner.displayOrder}</span>
                      <h3>{banner.title}</h3>
                    </div>
                    <p>
                      {banner.subtitle || banner.description || "No subtitle"}
                    </p>
                    <small>Created {formatDate(banner.createdAt)}</small>
                  </div>
                  <div className="banner-actions">
                    <span
                      className={`banner-badge ${banner.isActive ? "enabled" : "disabled"}`}
                    >
                      {banner.isActive ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      className={`switch ${banner.isActive ? "on" : ""}`}
                      disabled={busy === banner._id}
                      onClick={() => void toggle(banner)}
                      aria-label={`Toggle ${banner.title}`}
                    >
                      <i />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => setEditor(banner)}
                      aria-label={`Edit ${banner.title}`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => setRemove(banner)}
                      aria-label={`Delete ${banner.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
        <section className="panel slider-preview">
          <div className="section-heading">
            <div>
              <h2>Slider preview</h2>
              <p>Enabled banners only</p>
            </div>
            <span className="preview-count">{enabled.length} active</span>
          </div>
          {enabled.length ? (
            <div className="hero-preview">
              {enabled[currentPreviewIndex].image && (
                <Image
                  src={enabled[currentPreviewIndex].image}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 100vw, 420px"
                  unoptimized
                />
              )}
              <div className="hero-overlay" />
              <div className="hero-copy">
                <span>{enabled[currentPreviewIndex].subtitle}</span>
                <h3>{enabled[currentPreviewIndex].title}</h3>
                <p>{enabled[currentPreviewIndex].description}</p>
                <a href={enabled[currentPreviewIndex].buttonLink}>
                  {enabled[currentPreviewIndex].buttonText}
                </a>
              </div>
              <div className="slider-controls">
                <button
                  onClick={() =>
                    setPreviewIndex(
                      (previewIndex - 1 + enabled.length) % enabled.length,
                    )
                  }
                  aria-label="Previous banner"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  onClick={() =>
                    setPreviewIndex((previewIndex + 1) % enabled.length)
                  }
                  aria-label="Next banner"
                >
                  <ArrowRight size={15} />
                </button>
              </div>
              <div className="slider-dots">
                {enabled.map((banner, index) => (
                  <button
                    key={banner._id}
                    className={index === currentPreviewIndex ? "active" : ""}
                    onClick={() => setPreviewIndex(index)}
                    aria-label={`Show banner ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Empty text="Enable a banner to preview the slider" />
          )}
        </section>
      </div>
      {editor !== undefined && (
        <BannerEditor
          banner={editor}
          onClose={() => setEditor(undefined)}
          onSaved={() => {
            setEditor(undefined);
            void resource.refresh();
          }}
        />
      )}
      {remove && (
        <ConfirmDialog
          title="Delete banner?"
          description={`This will permanently remove "${remove.title}".`}
          onConfirm={() => void deleteBanner()}
          onClose={() => setRemove(null)}
          busy={busy === remove._id}
        />
      )}
    </AdminShell>
  );
}

function BannerEditor({
  banner,
  onClose,
  onSaved,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(banner?.image || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFieldErrors({});
    const formValues = new FormData(event.currentTarget);
    const nextFieldErrors: Record<string, string> = {};
    if (!banner && !file) nextFieldErrors.image = "Banner image is required.";
    if (!String(formValues.get("link") || "").trim())
      nextFieldErrors.link = "Button link is required.";
    if (!String(formValues.get("displayOrder") || "").trim())
      nextFieldErrors.displayOrder = "Display order is required.";
    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setBusy(false);
      return;
    }
    try {
      if (banner) {
        const values = Object.fromEntries(formValues.entries());
        await api.put(`/api/banner/${banner._id}`, {
          ...values,
          link: values.link,
          displayOrder: Number(values.displayOrder),
          isActive: values.isActive === "true",
        });
      } else {
        const form = formValues;
        if (!file) return;
        form.set("image", file);
        await api.post("/api/banner", form);
      }
      onSaved();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to save banner."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal banner-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">Storefront slider</p>
            <h2>{banner ? "Edit banner" : "Add banner"}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close banner editor"
          >
            <X size={18} />
          </button>
        </div>
        <form className="banner-form" onSubmit={submit}>
          {!banner && (
            <label className="banner-upload">
              {preview ? (
                <Image src={preview} alt="Banner preview" fill unoptimized />
              ) : (
                <>
                  <ImagePlus size={24} />
                  <span>
                    Choose banner image <b className="required-mark">*</b>
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const selected = event.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    setPreview(URL.createObjectURL(selected));
                  }
                }}
              />
            </label>
          )}
          {fieldErrors.image && (
            <p className="field-error">{fieldErrors.image}</p>
          )}
          <div className="editor-grid">
            <label>
              Title <span className="optional-label">Optional</span>
              <input name="title" defaultValue={banner?.title} />
            </label>
            <label>
              Subtitle <span className="optional-label">Optional</span>
              <input name="subtitle" defaultValue={banner?.subtitle} />
            </label>
            <label>
              Description <span className="optional-label">Optional</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={banner?.description}
              />
            </label>
            <label>
              Button text <span className="optional-label">Optional</span>
              <input name="buttonText" defaultValue={banner?.buttonText} />
            </label>
            <label>
              Button link{" "}
              <span className="required-label">
                Required <b>*</b>
              </span>
              <input
                name="link"
                required
                defaultValue={
                  banner?.buttonLink === "#" ? "" : banner?.buttonLink
                }
                placeholder="https://example.com/collection"
              />
              {fieldErrors.link && (
                <span className="field-error">{fieldErrors.link}</span>
              )}
            </label>
            <label>
              Display order{" "}
              <span className="required-label">
                Required <b>*</b>
              </span>
              <input
                name="displayOrder"
                type="number"
                min="1"
                required
                defaultValue={banner?.displayOrder || 1}
              />
              {fieldErrors.displayOrder && (
                <span className="field-error">{fieldErrors.displayOrder}</span>
              )}
            </label>
            <label>
              Status{" "}
              <span className="required-label">
                Required <b>*</b>
              </span>
              <select
                name="isActive"
                required
                defaultValue={String(banner?.isActive ?? true)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>
          </div>
          {error && <p className="login-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="button soft" onClick={onClose}>
              Cancel
            </button>
            <SpinnerButton loading={busy}>
              {banner ? "Save changes" : "Create banner"}
            </SpinnerButton>
          </div>
        </form>
      </div>
    </div>
  );
}
