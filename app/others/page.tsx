"use client";
import { Copy, Mail, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminShell, Empty, PageTitle } from "../admin-shared";
import { formatDate } from "../admin-data";
import { api, getApiError } from "../api-client";
import { useApiResource } from "../use-api-resource";
import { Pagination, usePagination } from "../pagination";

type ApiNewsletter = {
  _id: string;
  email: string;
  createdAt: string;
};

type NewsletterResponse = { newsletters: ApiNewsletter[] };

export default function NewsletterPage() {
  const [searchSub, setSearchSub] = useState("");
  
  const resource = useApiResource<NewsletterResponse>("/api/newsletter", {
    newsletters: [],
  });

  const rawSubscribers = Array.isArray(resource.data)
    ? resource.data
    : resource.data?.newsletters || [];

  const subscribersList = rawSubscribers.map((item) => ({
    id: item._id,
    email: item.email || "N/A",
    date: item.createdAt || "",
  }));

  const filteredSubscribers = subscribersList.filter((s) =>
    s.email.toLowerCase().includes(searchSub.toLowerCase().trim()),
  );

  const subscribersPagination = usePagination(filteredSubscribers, 10);

  const deleteSubscriber = async (id: string) => {
    if (!window.confirm("Remove this email from the newsletter list?")) return;
    try {
      await api.delete(`/api/newsletter/${id}`);
      await resource.refresh();
    } catch (err) {
      alert(getApiError(err, "Failed to remove subscriber."));
    }
  };

  const copyAllEmails = () => {
    const emails = subscribersList.map((s) => s.email).join(", ");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(emails);
      alert("All subscriber emails copied to clipboard!");
    }
  };

  return (
    <AdminShell active="/others">
      <PageTitle
        title="Newsletter"
        description="Manage your newsletter subscriptions."
      />
      
      <div className="panel table-panel flex flex-col justify-between" style={{ minHeight: "520px" }}>
        <div>
          <div className="panel-head flex items-center justify-between" style={{ padding: "20px 20px 10px" }}>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                Subscribers list
                <span className="text-xs font-bold bg-[#f1f1ed] text-[#777] px-2 py-0.5 rounded-full">
                  {filteredSubscribers.length}
                </span>
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                className="button soft compact"
                onClick={copyAllEmails}
                disabled={subscribersList.length === 0}
                title="Copy all email addresses"
              >
                Copy All
              </button>
              <Mail size={18} className="text-[#db4d79] self-center ml-1" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-3 border-b border-[#efefec]">
            <div className="relative flex items-center border border-[#e9e8e5] rounded-lg px-3 bg-white w-full">
              <Search size={15} className="text-[#999] mr-2" />
              <input
                type="text"
                placeholder="Search subscribers..."
                className="text-xs py-2 w-full outline-none bg-transparent"
                value={searchSub}
                onChange={(e) => {
                  setSearchSub(e.target.value);
                  subscribersPagination.setPage(1);
                }}
              />
            </div>
          </div>

          {resource.error ? (
            <Empty text={resource.error} />
          ) : resource.loading ? (
            <Empty text="Loading newsletter subscribers..." />
          ) : filteredSubscribers.length === 0 ? (
            <Empty text="No subscribers found" />
          ) : (
            <table style={{ width: "100%" }}>
              <thead>
                <tr style={{ background: "#fcfcfa", borderBottom: "1px solid #e9e8e5" }}>
                  <th style={{ padding: "10px 14px", fontSize: "11px" }}>Email</th>
                  <th style={{ padding: "10px 14px", fontSize: "11px" }}>Date Joined</th>
                  <th style={{ padding: "10px 14px", fontSize: "11px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribersPagination.visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-[#777] flex-shrink-0" />
                        <b className="truncate text-xs block max-w-[130px] sm:max-w-xs" title={item.email}>
                          {item.email}
                        </b>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }} className="text-xs text-[#777] tabular-nums">
                      {formatDate(item.date)}
                    </td>
                    <td style={{ padding: "10px 14px", verticalAlign: "middle", textAlign: "right" }}>
                      <div className="row-actions justify-end">
                        <button
                          className="icon-button"
                          onClick={() => {
                            if (typeof navigator !== "undefined" && navigator.clipboard) {
                              navigator.clipboard.writeText(item.email);
                              alert("Email copied to clipboard!");
                            }
                          }}
                          title="Copy email"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          className="icon-button danger"
                          onClick={() => void deleteSubscriber(item.id)}
                          title="Delete subscriber"
                        >
                          <Trash2 size={13} />
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
            page={subscribersPagination.page}
            pageCount={subscribersPagination.pageCount}
            onPageChange={subscribersPagination.setPage}
          />
        </div>
      </div>
    </AdminShell>
  );
}
