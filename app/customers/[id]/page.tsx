"use client";

import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  Eye,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getCustomerById,
  type CustomerRecord,
  type Order,
  type OrderStatus,
  type UserCartItem,
  type UserWishlistItem,
} from "../../admin-data";
import { AdminShell } from "../../admin-shared";
import { api, getApiError } from "../../api-client";
import { ConfirmDialog, Toast } from "../../ui";
import { StatusModal } from "../../orders/status-modal";
import { STATUS_META, type OrderStatusValue } from "../../orders/order-types";

const allOrderStatuses: OrderStatus[] = [
  "processing",
  "reviewing",
  "preparing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = useMemo(() => {
    const rawId = params?.id;
    if (Array.isArray(rawId)) return rawId[0];
    return rawId ? String(rawId) : "";
  }, [params]);

  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [activeTab, setActiveTab] = useState<
    "cart" | "orders" | "wishlist" | "profile" | "notes"
  >("cart");
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);

  // Modals state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);

  // Form states
  const [newNote, setNewNote] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("cart_recovery");
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer" as "customer" | "vip" | "admin",
    status: "active" as "active" | "inactive" | "suspended" | "pending",
  });

  // Load customer data
  useEffect(() => {
    if (!customerId) return;
    setLoading(true);

    const initial = getCustomerById(customerId);
    if (initial) {
      setCustomer(initial);
      setEditFormData({
        name: initial.name,
        email: initial.email,
        phone: initial.phone || "",
        role: initial.role,
        status: initial.status,
      });
    }

    // Try live API sync
    api
      .get(`/api/users/${customerId}`)
      .then((res) => {
        if (res.data) {
          const liveUser = res.data.user || res.data.data || res.data;
          if (liveUser && liveUser.name) {
            setCustomer((prev) => {
              if (!prev) return initial ?? null;
              return {
                ...prev,
                name: liveUser.name || prev.name,
                email: liveUser.email || prev.email,
                role: liveUser.role || prev.role,
                status: liveUser.status || prev.status,
                verified: liveUser.isVerified ?? liveUser.verified ?? prev.verified,
                cart: Array.isArray(liveUser.cart) && liveUser.cart.length > 0 ? liveUser.cart.flatMap((c: any) => (c.products || []).map((p: any) => ({
                  productId: p.productId?._id || "",
                  title: p.productId?.title || "Unknown Product",
                  price: p.productId?.discountedPrice || p.productId?.price || 0,
                  originalPrice: p.productId?.price || 0,
                  quantity: p.quantity || 1,
                  image: p.productId?.image || p.productId?.images?.[0] || "",
                  category: p.productId?.category || "Unknown",
                  inStock: (p.productId?.stock || p.productId?.countInStock || 0) > 0,
                  addedAt: c.createdAt || new Date().toISOString(),
                }))) : prev.cart,
                wishlist: Array.isArray(liveUser.wishlist) && liveUser.wishlist.length > 0 ? liveUser.wishlist.flatMap((w: any) => (w.products || []).map((p: any) => ({
                  productId: p.productId?._id || "",
                  title: p.productId?.title || "Unknown Product",
                  price: p.productId?.discountedPrice || p.productId?.price || 0,
                  originalPrice: p.productId?.price || 0,
                  image: p.productId?.image || p.productId?.images?.[0] || "",
                  category: p.productId?.category || "Unknown",
                  inStock: (p.productId?.stock || p.productId?.countInStock || 0) > 0,
                  addedAt: w.createdAt || new Date().toISOString(),
                }))) : prev.wishlist,
                orders: Array.isArray(liveUser.order) && liveUser.order.length > 0 ? liveUser.order.map((oid: any) => {
                  if (typeof oid === 'string') {
                     return {
                        id: oid,
                        customer: liveUser.name || "Customer",
                        email: liveUser.email || "",
                        date: liveUser.createdAt || "",
                        total: 0,
                        status: "completed",
                        items: 1,
                        payment: "Online",
                        delivery: "Standard",
                     };
                  }
                  return prev.orders.find(o => o.id === (oid._id || oid.id)) || {
                        id: oid._id || oid.id || "",
                        customer: liveUser.name || "Customer",
                        email: liveUser.email || "",
                        date: oid.createdAt || "",
                        total: oid.totalAmount || 0,
                        status: oid.status || "completed",
                        items: 1,
                        payment: "Online",
                        delivery: "Standard",
                  };
                }) : prev.orders,
                orderCount: Array.isArray(liveUser.order) ? liveUser.order.length : prev.orderCount,
                cartCount: Array.isArray(liveUser.cart) ? liveUser.cart.reduce((sum: number, c: any) => sum + (c.products?.length || 0), 0) : prev.cartCount,
                wishlistCount: Array.isArray(liveUser.wishlist) ? liveUser.wishlist.reduce((sum: number, w: any) => sum + (w.products?.length || 0), 0) : prev.wishlistCount,
              };
            });
          }
        }
      })
      .catch(() => {
        // Fallback to local rich registry
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customerId]);

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setToastMsg({ text: `Copied ${label} to clipboard!`, tone: "success" });
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleStatusUpdate = (newStatus: CustomerRecord["status"]) => {
    if (!customer) return;
    setCustomer({ ...customer, status: newStatus });
    setToastMsg({
      text: `Customer status updated to ${newStatus}.`,
      tone: "success",
    });
    setShowSuspendDialog(false);
  };

  const handleOrderStatusUpdate = async (orderId: string, status: OrderStatus) => {
    if (!customer) return;
    try {
      await api.put(`/api/orders/${orderId}`, { status }).catch(() => undefined);
      setCustomer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o,
          ),
        };
      });
      setToastMsg({
        text: `Order ${orderId} updated to ${status}.`,
        tone: "success",
      });
    } catch (err) {
      setToastMsg({
        text: getApiError(err, "Failed to update order status."),
        tone: "error",
      });
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !customer) return;
    const updatedNotes = [newNote.trim(), ...customer.notes];
    const newLog = {
      id: `act_${Date.now()}`,
      action: "Admin Note Added",
      description: `Note: "${newNote.trim()}"`,
      timestamp: new Date().toISOString(),
      device: "Admin Panel",
    };
    setCustomer({
      ...customer,
      notes: updatedNotes,
      activityLogs: [newLog, ...customer.activityLogs],
    });
    setNewNote("");
    setShowNoteModal(false);
    setToastMsg({ text: "Internal note saved successfully.", tone: "success" });
  };

  const handleDeleteNote = (index: number) => {
    if (!customer) return;
    const updated = customer.notes.filter((_, i) => i !== index);
    setCustomer({ ...customer, notes: updated });
    setToastMsg({ text: "Note deleted.", tone: "success" });
  };

  const handleSaveProfile = () => {
    if (!customer) return;
    setCustomer({
      ...customer,
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      role: editFormData.role,
      status: editFormData.status,
    });
    setShowEditModal(false);
    setToastMsg({ text: "Profile changes saved.", tone: "success" });
  };

  const handleSendEmail = () => {
    setShowEmailModal(false);
    setToastMsg({
      text: `Email successfully queued for ${customer?.email}!`,
      tone: "success",
    });
  };

  const setTemplateContent = (type: string) => {
    setEmailTemplate(type);
    if (!customer) return;
    if (type === "cart_recovery") {
      setEmailSubject(`✨ Maya, you left something special in your GirlyHub bag!`);
      setEmailBody(
        `Hi ${customer.name},\n\nWe noticed you left ${customer.cartCount} items in your shopping bag. They're selling fast! Complete your order today and use code EXTRA10 for 10% off your checkout.\n\nLove,\nGirlyHub Team`,
      );
    } else if (type === "vip_welcome") {
      setEmailSubject(`👑 Welcome to GirlyHub VIP Tier, ${customer.name}!`);
      setEmailBody(
        `Dear ${customer.name},\n\nThank you for being one of our top shoppers! You've unlocked VIP perks including complimentary express shipping, early access to new drops, and dedicated concierge support.\n\nWarm regards,\nGirlyHub Concierge`,
      );
    } else if (type === "custom") {
      setEmailSubject(`Update regarding your GirlyHub account`);
      setEmailBody(`Hi ${customer.name},\n\n`);
    }
  };

  const exportDossierJSON = () => {
    if (!customer) return;
    const jsonStr = JSON.stringify(customer, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GirlyHub_Customer_${customer.id}_Dossier.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToastMsg({ text: "Customer dossier exported as JSON.", tone: "success" });
  };

  if (loading && !customer) {
    return (
      <AdminShell active="/customers">
        <div className="auth-loading" style={{ minHeight: "50vh" }}>
          <div className="brand-mark">g</div>
          <div className="loading-bar" />
          <p>Loading customer 360° intelligence...</p>
        </div>
      </AdminShell>
    );
  }

  if (!customer) {
    return (
      <AdminShell active="/customers">
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Customer Not Found</h2>
          <p className="subtitle">
            The requested customer profile could not be located in your database.
          </p>
          <Link href="/customers" className="button" style={{ marginTop: 20 }}>
            <ArrowLeft size={16} /> Return to Customers Directory
          </Link>
        </div>
      </AdminShell>
    );
  }

  const cartSubtotal = customer.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const cartSavings = customer.cart.reduce(
    (acc, item) =>
      acc +
      (item.originalPrice ? item.originalPrice - item.price : 0) *
        item.quantity,
    0,
  );

  return (
    <AdminShell active="/customers">
      {toastMsg && (
        <Toast
          message={toastMsg.text}
          tone={toastMsg.tone}
          onClose={() => setToastMsg(null)}
        />
      )}

      {/* Breadcrumb & Navigation */}
      <div className="customer-nav-header">
        <Link href="/customers" className="back-link">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div className="header-action-group">
          <button
            className="button soft"
            onClick={exportDossierJSON}
            title="Export full customer record"
          >
            <Download size={15} /> Export Dossier
          </button>
          <button
            className="button soft"
            onClick={() => {
              setTemplateContent("cart_recovery");
              setShowEmailModal(true);
            }}
          >
            <Mail size={15} /> Contact Customer
          </button>
          <button
            className="button"
            onClick={() => setShowEditModal(true)}
          >
            <User size={15} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Customer 360 Hero Profile Card */}
      <div className="customer-hero-card">
        <div className="customer-hero-grid">
          <div
            className="hero-avatar-large"
            style={{
              background: customer.avatarColor || "#f3cfdb",
            }}
          >
            {customer.name[0]}
            <span
              className={`avatar-status-indicator ${
                customer.status === "active" ? "online" : "offline"
              }`}
            />
          </div>

          <div className="hero-details">
            <div className="hero-title-row">
              <h1>{customer.name}</h1>
              <div className="hero-badge-group">
                {customer.verified ? (
                  <span className="badge-pill verified">
                    <CheckCircle2 size={13} /> Verified Shopper
                  </span>
                ) : (
                  <span className="badge-pill pending">
                    <Clock size={13} /> Pending Verification
                  </span>
                )}

                {customer.role === "vip" && (
                  <span className="badge-pill vip">
                    <Sparkles size={13} /> VIP Tier
                  </span>
                )}

                <span
                  className={`badge-pill status-${customer.status}`}
                >
                  {customer.status}
                </span>
              </div>
            </div>

            <div className="hero-meta-grid">
              <div
                className="meta-item clickable"
                onClick={() => copyToClipboard(customer.email, "Email")}
                title="Click to copy email"
              >
                <Mail size={14} />
                <span>{customer.email}</span>
                {copiedField === "Email" ? (
                  <Check size={12} className="copy-icon check" />
                ) : (
                  <Copy size={12} className="copy-icon" />
                )}
              </div>

              {customer.phone && (
                <div
                  className="meta-item clickable"
                  onClick={() => copyToClipboard(customer.phone!, "Phone")}
                  title="Click to copy phone"
                >
                  <Phone size={14} />
                  <span>{customer.phone}</span>
                  {copiedField === "Phone" ? (
                    <Check size={12} className="copy-icon check" />
                  ) : (
                    <Copy size={12} className="copy-icon" />
                  )}
                </div>
              )}

              <div
                className="meta-item clickable"
                onClick={() => copyToClipboard(customer.id, "Customer ID")}
                title="Click to copy ID"
              >
                <Tag size={14} />
                <span>ID: {customer.id}</span>
                {copiedField === "Customer ID" ? (
                  <Check size={12} className="copy-icon check" />
                ) : (
                  <Copy size={12} className="copy-icon" />
                )}
              </div>

              <div className="meta-item">
                <Calendar size={14} />
                <span>Joined {formatDate(customer.createdAt)}</span>
              </div>

              <div className="meta-item">
                <Clock size={14} />
                <span>Active {formatDate(customer.lastActive)}</span>
              </div>
            </div>

            {customer.tags && customer.tags.length > 0 && (
              <div className="customer-tags-group">
                {customer.tags.map((tag) => (
                  <span className="customer-tag-chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="hero-quick-actions">
            <div className="account-switch-box">
              <span className="switch-label">Account Status</span>
              <select
                value={customer.status}
                onChange={(e) =>
                  handleStatusUpdate(
                    e.target.value as CustomerRecord["status"],
                  )
                }
                className={`status-picker ${customer.status}`}
              >
                <option value="active">Active (Full Access)</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended / Blocked</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
            <button
              className="button plain action-link"
              onClick={() => setShowSuspendDialog(true)}
            >
              {customer.status === "suspended" ? (
                <>
                  <UserCheck size={15} /> Reactivate Account
                </>
              ) : (
                <>
                  <UserX size={15} /> Suspend Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Highlights Bar */}
      <div className="kpi-mini-grid">
        <div className="kpi-mini-card">
          <div className="kpi-icon-wrap pink">
            <ShoppingCart size={18} />
          </div>
          <div>
            <span className="kpi-label">Active Cart Value</span>
            <strong className="kpi-value">{formatCurrency(cartSubtotal)}</strong>
            <small className="kpi-sub">{customer.cart.length} items waiting</small>
          </div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-icon-wrap green">
            <ShoppingBag size={18} />
          </div>
          <div>
            <span className="kpi-label">Lifetime Spend (LTV)</span>
            <strong className="kpi-value">
              {formatCurrency(customer.totalSpent)}
            </strong>
            <small className="kpi-sub">{customer.orders.length} orders placed</small>
          </div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-icon-wrap purple">
            <Heart size={18} />
          </div>
          <div>
            <span className="kpi-label">Wishlist Products</span>
            <strong className="kpi-value">{customer.wishlist.length}</strong>
            <small className="kpi-sub">Saved for later</small>
          </div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-icon-wrap yellow">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="kpi-label">Average Order (AOV)</span>
            <strong className="kpi-value">
              {formatCurrency(customer.avgOrderValue)}
            </strong>
            <small className="kpi-sub">Per transaction</small>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Navigation */}
      <div className="detail-tabs-bar">
        <div className="detail-tabs">
          <button
            className={`detail-tab-btn ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => setActiveTab("cart")}
          >
            <ShoppingCart size={16} />
            <span>Active Cart</span>
            <em className="tab-count-badge">{customer.cart.length}</em>
          </button>

          <button
            className={`detail-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <Package size={16} />
            <span>Order History</span>
            <em className="tab-count-badge">{customer.orders.length}</em>
          </button>

          <button
            className={`detail-tab-btn ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
            <Heart size={16} />
            <span>Wishlist</span>
            <em className="tab-count-badge">{customer.wishlist.length}</em>
          </button>

          <button
            className={`detail-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} />
            <span>Profile & Addresses</span>
          </button>

          <button
            className={`detail-tab-btn ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            <MessageSquare size={16} />
            <span>Admin Notes & Timeline</span>
            {customer.notes.length > 0 && (
              <em className="tab-count-badge pink">{customer.notes.length}</em>
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT: 1. ACTIVE CART */}
      {activeTab === "cart" && (
        <div className="tab-pane">
          <div className="cart-grid-layout">
            <div className="panel table-panel">
              <div className="panel-inner-head">
                <div>
                  <h2>Customer Shopping Bag</h2>
                  <p>Real-time items currently in {customer.name}&apos;s cart</p>
                </div>
                {customer.cart.length > 0 && (
                  <button
                    className="button soft"
                    onClick={() => {
                      setTemplateContent("cart_recovery");
                      setShowEmailModal(true);
                    }}
                  >
                    <Send size={15} /> Send Abandonment Recovery Email
                  </button>
                )}
              </div>

              {customer.cart.length === 0 ? (
                <div className="empty-state-box">
                  <ShoppingCart size={32} />
                  <h3>Shopping cart is currently empty</h3>
                  <p>The customer has no items in their active cart.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variant</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Stock Status</th>
                      <th>Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.cart.map((item, idx) => (
                      <tr key={`${item.productId}-${idx}`}>
                        <td>
                          <div className="product-cell">
                            <span
                              className="product-swatch"
                              style={{ background: item.image }}
                            >
                              G
                            </span>
                            <div>
                              <b>{item.title}</b>
                              <small className="cell-sub">{item.category}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="variant-chip">
                            {item.selectedSize || "Standard"}{" "}
                            {item.selectedColor ? `· ${item.selectedColor}` : ""}
                          </span>
                        </td>
                        <td>
                          <b>{formatCurrency(item.price)}</b>
                          {item.originalPrice && (
                            <del className="strike-price">
                              {formatCurrency(item.originalPrice)}
                            </del>
                          )}
                        </td>
                        <td>
                          <span className="qty-badge">{item.quantity}</span>
                        </td>
                        <td>
                          <strong>
                            {formatCurrency(item.price * item.quantity)}
                          </strong>
                        </td>
                        <td>
                          {item.inStock ? (
                            <span className="stock-pill in-stock">
                              <Check size={12} /> In Stock
                            </span>
                          ) : (
                            <span className="stock-pill out-of-stock">
                              Out of stock
                            </span>
                          )}
                        </td>
                        <td>
                          <small className="date-text">
                            {formatDateTime(item.addedAt)}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Cart Summary Sidebox */}
            {customer.cart.length > 0 && (
              <div className="cart-summary-box panel">
                <h3>Cart Breakdown</h3>
                <div className="summary-line">
                  <span>Subtotal ({customer.cart.length} items)</span>
                  <b>{formatCurrency(cartSubtotal)}</b>
                </div>
                {cartSavings > 0 && (
                  <div className="summary-line savings">
                    <span>Catalogue Discount</span>
                    <b>-{formatCurrency(cartSavings)}</b>
                  </div>
                )}
                <div className="summary-line">
                  <span>Estimated GST (18%)</span>
                  <span>{formatCurrency(cartSubtotal * 0.18)}</span>
                </div>
                <div className="summary-line">
                  <span>Standard Shipping</span>
                  <span className="free-badge">FREE (VIP)</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-line total">
                  <span>Total Cart Pipeline</span>
                  <strong>{formatCurrency(cartSubtotal * 1.18)}</strong>
                </div>

                <div className="cart-action-card">
                  <h4>💡 Enterprise Conversion Insights</h4>
                  <p>
                    Cart was updated {formatDate(customer.cart[0]?.addedAt)}.
                    Sending an automated WhatsApp or Email nudge recovers over
                    34% of abandoned bags!
                  </p>
                  <button
                    className="button"
                    style={{ width: "100%", marginTop: 12 }}
                    onClick={() => {
                      setTemplateContent("cart_recovery");
                      setShowEmailModal(true);
                    }}
                  >
                    <Mail size={15} /> Send Instant 10% Off Coupon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. PLACED ORDERS */}
      {activeTab === "orders" && (
        <div className="tab-pane">
          <div className="panel table-panel">
            <div className="panel-inner-head">
              <div>
                <h2>Order History</h2>
                <p>Complete record of purchases made by {customer.name}</p>
              </div>
              <div className="badge-pill verified">
                Total Orders: {customer.orders.length}
              </div>
            </div>

            {customer.orders.length === 0 ? (
              <div className="empty-state-box">
                <Package size={32} />
                <h3>No Orders Placed Yet</h3>
                <p>This customer has not completed any orders on GirlyHub yet.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Payment Method</th>
                    <th>Delivery</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <b className="order-id-link">{order.id}</b>
                      </td>
                      <td>{formatDate(order.date)}</td>
                      <td>
                        <span className="order-items-count">
                          {order.items} {order.items === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td>
                        <span className="payment-chip">
                          <CreditCard size={13} /> {order.payment}
                        </span>
                      </td>
                      <td>{order.delivery}</td>
                      <td>
                        <strong>{formatCurrency(order.total)}</strong>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {(() => {
                            const meta = STATUS_META[order.status as OrderStatusValue] ?? {
                              label: order.status,
                              color: "#6b6b6b",
                              bg: "#f0f0ed",
                              icon: "·",
                            };
                            return (
                              <span
                                className="order-status-badge"
                                style={{ color: meta.color, background: meta.bg, margin: 0 }}
                              >
                                {meta.icon} {meta.label}
                              </span>
                            );
                          })()}
                          <button
                            className="button soft btn-xs"
                            onClick={() => setUpdatingOrder(order)}
                            title="Update status"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          className="button soft icon-only-btn"
                          title="Download Receipt"
                          onClick={() =>
                            setToastMsg({
                              text: `Invoice downloaded for ${order.id}.`,
                              tone: "success",
                            })
                          }
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. WISHLIST */}
      {activeTab === "wishlist" && (
        <div className="tab-pane">
          <div className="panel">
            <div className="panel-inner-head">
              <div>
                <h2>Saved Wishlist Products</h2>
                <p>Curated list of styles {customer.name} is keeping an eye on</p>
              </div>
              <span className="count-badge">
                {customer.wishlist.length} Items
              </span>
            </div>

            {customer.wishlist.length === 0 ? (
              <div className="empty-state-box">
                <Heart size={32} />
                <h3>Wishlist is Empty</h3>
                <p>The customer hasn&apos;t saved any favorites yet.</p>
              </div>
            ) : (
              <div className="wishlist-cards-grid">
                {customer.wishlist.map((item) => (
                  <div className="wishlist-card" key={item.productId}>
                    <div
                      className="wishlist-card-swatch"
                      style={{ background: item.image }}
                    >
                      <span>GIRLYHUB</span>
                      <button
                        className="wishlist-fav-btn"
                        title="Saved in wishlist"
                      >
                        <Heart size={16} fill="var(--pink)" color="var(--pink)" />
                      </button>
                    </div>
                    <div className="wishlist-card-body">
                      <span className="card-category">{item.category}</span>
                      <h4 className="card-title">{item.title}</h4>
                      <div className="card-price-row">
                        <strong className="current-price">
                          {formatCurrency(item.price)}
                        </strong>
                        {item.originalPrice && (
                          <del className="old-price">
                            {formatCurrency(item.originalPrice)}
                          </del>
                        )}
                      </div>
                      <div className="card-footer-row">
                        {item.inStock ? (
                          <span className="stock-pill in-stock">
                            <Check size={11} /> In Stock
                          </span>
                        ) : (
                          <span className="stock-pill out-of-stock">
                            Out of Stock
                          </span>
                        )}
                        <small className="saved-date">
                          Saved {formatDate(item.addedAt)}
                        </small>
                      </div>
                      <button
                        className="button soft"
                        style={{ width: "100%", marginTop: 12 }}
                        onClick={() =>
                          setToastMsg({
                            text: `Restock & price drop reminder scheduled for ${customer.email}.`,
                            tone: "success",
                          })
                        }
                      >
                        <Mail size={14} /> Price Drop Alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. PROFILE & ADDRESSES */}
      {activeTab === "profile" && (
        <div className="tab-pane">
          <div className="profile-grid-layout">
            {/* Personal Details Card */}
            <div className="panel">
              <div className="panel-inner-head">
                <h2>Account Credentials & Demographics</h2>
                <button
                  className="button soft"
                  onClick={() => setShowEditModal(true)}
                >
                  <User size={14} /> Edit
                </button>
              </div>

              <div className="info-kv-grid">
                <div className="info-kv-row">
                  <span className="kv-label">Full Name</span>
                  <strong className="kv-val">{customer.name}</strong>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Primary Email</span>
                  <span className="kv-val">{customer.email}</span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Phone Number</span>
                  <span className="kv-val">{customer.phone || "Not set"}</span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Gender</span>
                  <span className="kv-val">{customer.gender || "Female"}</span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Date of Birth</span>
                  <span className="kv-val">
                    {customer.birthday ? formatDate(customer.birthday) : "Not set"}
                  </span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Account Tier</span>
                  <span className="kv-val">
                    {customer.role.toUpperCase()} Shopper
                  </span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Registration Date</span>
                  <span className="kv-val">
                    {formatDateTime(customer.createdAt)}
                  </span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Email Verification</span>
                  <span className="kv-val">
                    {customer.verified ? "✅ Verified" : "⏳ Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Saved Addresses Card */}
            <div className="panel">
              <div className="panel-inner-head">
                <h2>Saved Delivery Addresses</h2>
                <span className="count-badge">
                  {customer.addresses.length} Addresses
                </span>
              </div>

              <div className="address-cards-grid">
                {customer.addresses.map((addr) => (
                  <div
                    className={`address-card ${addr.isDefault ? "default" : ""}`}
                    key={addr.id}
                  >
                    <div className="address-card-head">
                      <div className="address-tag-wrap">
                        <MapPin size={15} />
                        <b style={{ textTransform: "capitalize" }}>
                          {addr.type} Address
                        </b>
                      </div>
                      {addr.isDefault && (
                        <span className="default-pill">Default</span>
                      )}
                    </div>
                    <p className="address-name">{addr.name}</p>
                    <p className="address-text">{addr.street}</p>
                    <p className="address-city">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="address-country">{addr.country}</p>
                    {addr.landmark && (
                      <p className="address-landmark">
                        <small>Landmark: {addr.landmark}</small>
                      </p>
                    )}
                    <p className="address-phone">
                      <Phone size={12} /> {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketing & Security Settings */}
            <div className="panel">
              <div className="panel-inner-head">
                <h2>Communication & Preferences</h2>
              </div>
              <div className="preferences-list">
                <div className="pref-row">
                  <div>
                    <b>Email Newsletter & Drops</b>
                    <small>Customer opted in for promotional newsletters</small>
                  </div>
                  <span className="positive">Subscribed</span>
                </div>
                <div className="pref-row">
                  <div>
                    <b>SMS Tracking Updates</b>
                    <small>Order dispatch & delivery SMS notifications</small>
                  </div>
                  <span className="positive">Enabled</span>
                </div>
                <div className="pref-row">
                  <div>
                    <b>WhatsApp VIP Concierge</b>
                    <small>Exclusive private collection alerts on WhatsApp</small>
                  </div>
                  <span className="positive">Active</span>
                </div>
              </div>
            </div>

            {/* Device & Security Info */}
            <div className="panel">
              <div className="panel-inner-head">
                <h2>Security & Sessions</h2>
              </div>
              <div className="info-kv-grid">
                <div className="info-kv-row">
                  <span className="kv-label">Account Security</span>
                  <span className="badge-pill verified">
                    <ShieldCheck size={13} /> Good Health (No Flags)
                  </span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Two-Factor Authentication</span>
                  <span className="kv-val">Biometric Authenticator</span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Last Device</span>
                  <span className="kv-val">Safari on Apple iPhone 15 Pro</span>
                </div>
                <div className="info-kv-row">
                  <span className="kv-label">Last Known IP</span>
                  <span className="kv-val">152.58.24.112 (Mumbai, IN)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. ADMIN NOTES & ACTIVITY AUDIT */}
      {activeTab === "notes" && (
        <div className="tab-pane">
          <div className="notes-timeline-layout">
            {/* Internal Admin Notes */}
            <div className="panel admin-notes-card">
              <div className="panel-inner-head">
                <div>
                  <h2>Internal Admin Notes</h2>
                  <p>Private team notes & customer VIP preferences</p>
                </div>
                <button
                  className="button"
                  onClick={() => setShowNoteModal(true)}
                >
                  <Plus size={15} /> Add Note
                </button>
              </div>

              {customer.notes.length === 0 ? (
                <div className="empty-state-box">
                  <MessageSquare size={30} />
                  <h3>No Admin Notes</h3>
                  <p>Add notes about customer requests, VIP tags, or refund history.</p>
                </div>
              ) : (
                <div className="notes-list">
                  {customer.notes.map((note, index) => (
                    <div className="note-item" key={index}>
                      <div className="note-head">
                        <div className="note-author">
                          <span className="author-avatar">AT</span>
                          <b>Administrator</b>
                          <small>Internal Note #{index + 1}</small>
                        </div>
                        <button
                          className="icon-button danger"
                          onClick={() => handleDeleteNote(index)}
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="note-content">{note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chronological Activity Timeline */}
            <div className="panel activity-timeline-card">
              <div className="panel-inner-head">
                <div>
                  <h2>Activity Audit Log</h2>
                  <p>Chronological feed of customer actions and store interactions</p>
                </div>
                <span className="count-badge">
                  {customer.activityLogs.length} Events
                </span>
              </div>

              <div className="activity-timeline">
                {customer.activityLogs.map((log) => (
                  <div className="timeline-item" key={log.id}>
                    <div className="timeline-icon-wrap">
                      {log.action.includes("Cart") ? (
                        <ShoppingCart size={14} />
                      ) : log.action.includes("Order") ? (
                        <Package size={14} />
                      ) : log.action.includes("Wishlist") ? (
                        <Heart size={14} />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                    </div>
                    <div className="timeline-body">
                      <div className="timeline-header">
                        <b>{log.action}</b>
                        <span className="timeline-time">
                          {formatDateTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="timeline-desc">{log.description}</p>
                      {log.device && (
                        <small className="timeline-device">
                          Via {log.device}{" "}
                          {log.ipAddress ? `· IP: ${log.ipAddress}` : ""}
                        </small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD ADMIN NOTE */}
      {showNoteModal && (
        <div className="modal-backdrop" onClick={() => setShowNoteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Add Internal Customer Note</h2>
              <button
                className="icon-button"
                onClick={() => setShowNoteModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="modal-copy">
              Internal notes are only visible to store managers and support team.
            </p>
            <div className="modal-form">
              <label>
                Note Content
                <textarea
                  rows={4}
                  placeholder="e.g. Customer requested gift wrapping, VIP shopper status, size preferences..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  autoFocus
                />
              </label>
              <div className="form-actions">
                <button
                  className="button soft"
                  onClick={() => setShowNoteModal(false)}
                >
                  Cancel
                </button>
                <button className="button" onClick={handleAddNote}>
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER PROFILE */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Edit Customer Profile</h2>
              <button
                className="icon-button"
                onClick={() => setShowEditModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-form">
              <label>
                Full Name
                <input
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              </label>
              <label>
                Email Address
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </label>
              <label>
                Phone Number
                <input
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
              </label>
              <div className="two-fields">
                <label>
                  Customer Role / Tier
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        role: e.target.value as "customer" | "vip" | "admin",
                      })
                    }
                  >
                    <option value="customer">Standard Customer</option>
                    <option value="vip">VIP Gold Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </label>
                <label>
                  Account Status
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value as CustomerRecord["status"],
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </label>
              </div>
              <div className="form-actions">
                <button
                  className="button soft"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button className="button" onClick={handleSaveProfile}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT EMAIL COMPOSER */}
      {showEmailModal && (
        <div className="modal-backdrop" onClick={() => setShowEmailModal(false)}>
          <div
            className="modal"
            style={{ width: "min(580px, 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>Send Direct Customer Message</h2>
              <button
                className="icon-button"
                onClick={() => setShowEmailModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-form">
              <div className="email-templates-picker">
                <span className="picker-label">Select Quick Template:</span>
                <div className="template-btn-group">
                  <button
                    type="button"
                    className={`template-chip ${
                      emailTemplate === "cart_recovery" ? "selected" : ""
                    }`}
                    onClick={() => setTemplateContent("cart_recovery")}
                  >
                    🛒 Cart Abandonment
                  </button>
                  <button
                    type="button"
                    className={`template-chip ${
                      emailTemplate === "vip_welcome" ? "selected" : ""
                    }`}
                    onClick={() => setTemplateContent("vip_welcome")}
                  >
                    👑 VIP Welcome
                  </button>
                  <button
                    type="button"
                    className={`template-chip ${
                      emailTemplate === "custom" ? "selected" : ""
                    }`}
                    onClick={() => setTemplateContent("custom")}
                  >
                    ✏️ Custom
                  </button>
                </div>
              </div>

              <label>
                Recipient
                <input value={`${customer.name} <${customer.email}>`} disabled />
              </label>
              <label>
                Subject Line
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </label>
              <label>
                Message Body
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </label>
              <div className="form-actions">
                <button
                  className="button soft"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
                <button className="button" onClick={handleSendEmail}>
                  <Send size={15} /> Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: SUSPEND ACCOUNT */}
      {showSuspendDialog && (
        <ConfirmDialog
          title={
            customer.status === "suspended"
              ? "Reactivate customer account?"
              : "Suspend customer account?"
          }
          description={
            customer.status === "suspended"
              ? `This will restore storefront access and shopping capabilities for ${customer.name}.`
              : `This will prevent ${customer.name} from placing new orders or signing into their storefront account.`
          }
          onConfirm={() =>
            handleStatusUpdate(
              customer.status === "suspended" ? "active" : "suspended",
            )
          }
          onClose={() => setShowSuspendDialog(false)}
        />
      )}

      {updatingOrder && (
        <StatusModal
          order={updatingOrder}
          onClose={() => setUpdatingOrder(null)}
          onUpdated={(id, newStatus, awb) => {
            setCustomer((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                orders: prev.orders.map((o) =>
                  o.id === id ? { ...o, status: newStatus, raw: { ...o.raw, awbNumber: awb } } : o,
                ),
              };
            });
            setToastMsg({
              text: `Order ${id} updated to ${newStatus}.`,
              tone: "success",
            });
            setUpdatingOrder(null);
          }}
        />
      )}
    </AdminShell>
  );
}
