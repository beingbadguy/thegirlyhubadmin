"use client";

import { Edit3, Plus, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AdminShell, Empty, PageTitle } from "../admin-shared";
import { api, getApiError } from "../api-client";
import { formatDate } from "../admin-data";
import { useApiResource } from "../use-api-resource";
import { ConfirmDialog, SpinnerButton, Toast } from "../ui";

type Faq = {
  _id: string;
  question: string;
  answer: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type FaqResponse = { faqs?: Faq[] };

export default function FaqPage() {
  const resource = useApiResource<FaqResponse>("/api/faq", { faqs: [] });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [remove, setRemove] = useState<Faq | null>(null);
  const [busy, setBusy] = useState(false);
  const [mutationId, setMutationId] = useState("");
  const [error, setError] = useState("");
  const faqs = resource.data.faqs || [];

  const openCreate = () => {
    setEditing(null);
    setError("");
    setEditorOpen(true);
  };
  const openEdit = (faq: Faq) => {
    setEditing(faq);
    setError("");
    setEditorOpen(true);
  };
  const closeEditor = () => {
    if (!busy) setEditorOpen(false);
  };

  const saveFaq = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const question = String(values.question || "").trim();
    const answer = String(values.answer || "").trim();
    if (!question || !answer) {
      setError("Question and answer are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editing)
        await api.put(`/api/faq/${editing._id}`, { question, answer });
      else await api.post("/api/faq", { question, answer });
      await resource.refresh();
      setEditorOpen(false);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to save FAQ."));
    } finally {
      setBusy(false);
    }
  };

  const toggleFaq = async (faq: Faq) => {
    setMutationId(faq._id);
    setError("");
    try {
      await api.put(`/api/faq/${faq._id}`, {
        isActive: !(faq.isActive ?? true),
      });
      await resource.refresh();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to update FAQ status."));
    } finally {
      setMutationId("");
    }
  };

  const deleteFaq = async () => {
    if (!remove) return;
    setMutationId(remove._id);
    setError("");
    try {
      await api.delete(`/api/faq/${remove._id}`);
      await resource.refresh();
      setRemove(null);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to delete FAQ."));
    } finally {
      setMutationId("");
    }
  };

  return (
    <AdminShell active="/faq">
      <PageTitle
        title="FAQ"
        description="Keep answers to common customer questions clear and up to date."
        action={
          <button className="button" onClick={openCreate}>
            <Plus size={17} /> Add FAQ
          </button>
        }
      />
      {error && !editorOpen && (
        <Toast message={error} onClose={() => setError("")} />
      )}
      <div className="faq-list">
        {resource.error ? (
          <Empty text={resource.error} />
        ) : resource.loading ? (
          <div className="panel">
            <div className="skeleton-list">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : !faqs.length ? (
          <div className="panel">
            <Empty text="No FAQs yet" />
          </div>
        ) : (
          faqs.map((faq, index) => (
            <article className="faq-item panel" key={faq._id}>
              <div className="faq-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="faq-content">
                <h2>{faq.question}</h2>
                <p>{faq.answer}</p>
                <small>Created {formatDate(faq.createdAt)}</small>
              </div>
              <div className="faq-actions">
                <button
                  className={`switch ${(faq.isActive ?? true) ? "on" : ""}`}
                  disabled={mutationId === faq._id}
                  onClick={() => void toggleFaq(faq)}
                  aria-label={`Toggle ${faq.question}`}
                >
                  <i />
                </button>
                <button
                  className="icon-button"
                  onClick={() => openEdit(faq)}
                  aria-label={`Edit ${faq.question}`}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => setRemove(faq)}
                  aria-label={`Delete ${faq.question}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
      {editorOpen && (
        <FaqEditor
          faq={editing}
          busy={busy}
          error={error}
          onClose={closeEditor}
          onSubmit={saveFaq}
        />
      )}
      {remove && (
        <ConfirmDialog
          title="Delete this FAQ?"
          description={`This will permanently remove "${remove.question}".`}
          onConfirm={() => void deleteFaq()}
          onClose={() => setRemove(null)}
          busy={mutationId === remove._id}
        />
      )}
    </AdminShell>
  );
}

function FaqEditor({
  faq,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  faq: Faq | null;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [busy, onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal faq-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="faq-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            {/* <p className="eyebrow">Help content</p> */}
            <h2 id="faq-editor-title">{faq ? "Edit FAQ" : "Add FAQ"}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close FAQ editor"
          >
            <X size={18} />
          </button>
        </div>
        <form className="faq-form" onSubmit={onSubmit}>
          <label>
            Question
            <input
              name="question"
              defaultValue={faq?.question}
              placeholder="How long does delivery take?"
              autoFocus
            />
          </label>
          <label>
            Answer
            <textarea
              name="answer"
              defaultValue={faq?.answer}
              placeholder="Write a clear answer for customers..."
              rows={7}
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="button soft" onClick={onClose}>
              Cancel
            </button>
            <SpinnerButton loading={busy}>
              {faq ? "Save changes" : "Create FAQ"}
            </SpinnerButton>
          </div>
        </form>
      </div>
    </div>
  );
}
