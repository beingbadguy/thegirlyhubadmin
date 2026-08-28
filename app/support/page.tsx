"use client";
import { Mail, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { AdminShell, Button, PageTitle } from "../admin-shared";
import { enquiries, formatDate, subscribers } from "../admin-data";
import { Pagination, usePagination } from "../pagination";

export default function SupportPage() {
  const [selected, setSelected] = useState<(typeof enquiries)[number] | null>(
    null,
  );
  const enquiriesPagination = usePagination(enquiries);
  const subscribersPagination = usePagination(subscribers);
  return (
    <AdminShell active="/support">
      <PageTitle
        title="Support"
        description="Stay close to your customers and community."
      />
      <div className="support-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Contact enquiries</h2>
            <MessageCircle size={18} />
          </div>
          {enquiriesPagination.visibleItems.map((item) => (
            <button
              className="enquiry"
              key={item.id}
              onClick={() => setSelected(item)}
            >
              <div className="avatar pink-avatar">{item.name[0]}</div>
              <span>
                <b>{item.name}</b>
                <small>{item.message}</small>
                <time>{formatDate(item.date)}</time>
              </span>
            </button>
          ))}
          <Pagination
            page={enquiriesPagination.page}
            pageCount={enquiriesPagination.pageCount}
            onPageChange={enquiriesPagination.setPage}
          />
        </div>
        <div className="panel">
          <div className="panel-head">
            <h2>Newsletter subscribers</h2>
            <Mail size={18} />
          </div>
          {subscribersPagination.visibleItems.map((item) => (
            <div className="subscriber" key={item.id}>
              <Mail size={17} />
              <span>
                <b>{item.email}</b>
                <small>Subscribed {formatDate(item.date)}</small>
              </span>
            </div>
          ))}
          <Pagination
            page={subscribersPagination.page}
            pageCount={subscribersPagination.pageCount}
            onPageChange={subscribersPagination.setPage}
          />
        </div>
      </div>
      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside
            className="drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{selected.name}</h2>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close enquiry"
              >
                <X size={18} />
              </button>
            </div>
            <p>{selected.email}</p>
            <div className="message-box">{selected.message}</div>
            <label>
              Reply
              <textarea rows={7} />
            </label>
            <Button onClick={() => setSelected(null)}>Send reply</Button>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
