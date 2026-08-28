"use client";
import { Eye, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { AdminShell, Button, Empty, PageTitle } from "../admin-shared";
import { formatDate } from "../admin-data";
import { useApiResource } from "../use-api-resource";
import { Pagination, usePagination } from "../pagination";

type ContactEnquiry = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  date: string;
};

export default function SupportPage() {
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);

  const resource = useApiResource<any>("/api/contact", {
    contacts: [],
  });

  const rawContacts = Array.isArray(resource.data)
    ? resource.data
    : resource.data?.contacts || [];

  const enquiriesList: ContactEnquiry[] = rawContacts.map((item: any) => ({
    id: item._id || item.id,
    name: item.name || "Anonymous",
    email: item.email || undefined,
    phone: item.phone || undefined,
    message: item.message || "",
    date: item.createdAt || item.date || "",
  }));

  const enquiriesPagination = usePagination(enquiriesList, 8);

  return (
    <AdminShell active="/support">
      <PageTitle
        title="Support"
        description="Stay close to your customers and community."
      />
      <div className="support-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="panel table-panel" style={{ minHeight: "520px", display: "flex", flexDirection: "column", justifyContent: "between", overflowX: "auto" }}>
          <div>
            <div className="panel-head" style={{ padding: "20px 20px 10px" }}>
              <h2>Contact enquiries</h2>
              <MessageCircle size={18} />
            </div>
            {resource.error ? (
              <Empty text={resource.error} />
            ) : resource.loading ? (
              <Empty text="Loading contact enquiries..." />
            ) : enquiriesList.length === 0 ? (
              <Empty text="No contact enquiries found" />
            ) : (
              <table style={{ width: "100%" }}>
                <thead>
                  <tr style={{ background: "#fcfcfa", borderBottom: "1px solid #e9e8e5" }}>
                    <th style={{ padding: "10px 14px", fontSize: "11px" }}>Name</th>
                    <th style={{ padding: "10px 14px", fontSize: "11px" }}>Email</th>
                    <th style={{ padding: "10px 14px", fontSize: "11px" }}>Phone</th>
                    <th style={{ padding: "10px 14px", fontSize: "11px" }}>Message</th>
                    <th style={{ padding: "10px 14px", fontSize: "11px" }}>Date</th>
                    <th style={{ padding: "10px 14px", fontSize: "11px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiriesPagination.visibleItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <div className="flex items-center gap-2">
                          <div className="avatar pink-avatar text-[10px] w-6 h-6 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold">
                            {item.name[0]}
                          </div>
                          <span className="font-semibold text-xs text-[#292929]">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }} className="text-xs text-[#5d5d59]">
                        {item.email ? (
                          <a href={`mailto:${item.email}`} className="hover:underline text-[#db4d79]">{item.email}</a>
                        ) : (
                          <span className="text-[#999]">—</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }} className="text-xs text-[#5d5d59] font-mono">
                        {item.phone ? (
                          <a href={`tel:${item.phone}`} className="hover:underline text-[#db4d79]">{item.phone}</a>
                        ) : (
                          <span className="text-[#999]">—</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }} className="text-xs text-[#777] max-w-[200px] truncate" title={item.message}>
                        {item.message}
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }} className="text-xs text-[#777] tabular-nums">
                        {formatDate(item.date)}
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle", textAlign: "right" }}>
                        <div className="row-actions justify-end">
                          <button
                            className="icon-button"
                            onClick={() => setSelected(item)}
                            title="View details"
                            aria-label="View details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ marginTop: "auto", paddingTop: "10px" }}>
            <Pagination
              page={enquiriesPagination.page}
              pageCount={enquiriesPagination.pageCount}
              onPageChange={enquiriesPagination.setPage}
            />
          </div>
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
            <div className="text-xs text-[#6e6e69] mb-3 flex flex-wrap gap-x-3 gap-y-1">
              {selected.email && (
                <span className="flex items-center gap-1">
                  <strong>Email:</strong> <a href={`mailto:${selected.email}`} className="text-[#db4d79] hover:underline">{selected.email}</a>
                </span>
              )}
              {selected.phone && (
                <span className="flex items-center gap-1">
                  <strong>Phone:</strong> <a href={`tel:${selected.phone}`} className="text-[#db4d79] hover:underline">{selected.phone}</a>
                </span>
              )}
            </div>
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
