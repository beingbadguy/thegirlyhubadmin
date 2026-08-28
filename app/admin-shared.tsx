"use client";

import {
  Bell,
  Images,
  Box,
  ChevronRight,
  ClipboardList,
  FolderHeart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Tag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, getAuthUser, type AuthUser } from "./api-client";

const navigation = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/products", "Products", Box],
  ["/categories", "Categories", FolderHeart],
  ["/orders", "Orders", ClipboardList],
  ["/customers", "Customers", Users],
  ["/support", "Support", MessageCircle],
  ["/faq", "FAQ", HelpCircle],
  ["/banners", "Banners", Images],
  ["/others", "Coupons", Tag],
] as const;

export function AdminShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    api
      .get<AuthUser | { data: AuthUser }>("/api/me")
      .then(({ data }) => {
        const user = getAuthUser(data);
        const isAdmin =
          user.isAdmin === true || user.role?.toLowerCase() === "admin";
        if (!isAdmin) {
          router.replace("/login?error=admin-required");
          return;
        }
        if (mounted) setUser(user);
      })
      .catch(() => router.replace("/login?error=unauthorized"))
      .finally(() => {
        if (mounted) setCheckingAuth(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  const signOut = async () => {
    try {
      await api.post("/api/logout");
    } finally {
      router.replace("/login");
    }
  };

  if (checkingAuth)
    return (
      <div className="auth-loading">
        <div className="brand-mark">g</div>
        <div className="loading-bar" />
        <p>Checking administrator access...</p>
      </div>
    );
  if (!user) return null;
  return (
    <div className="admin-app">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">g</div>
          <span>girlyhub</span>
          <button
            className="icon-button mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        {/* <div className="store-switcher">
          <div className="store-avatar">G</div>
          <div>
            <b>GirlyHub Store</b>
            <small>Online store</small>
          </div>
        </div> */}
        <p className="nav-label">Workspace</p>
        <nav>
          {navigation.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={active === href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Support" && <em>2</em>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/others">
            <Settings size={18} /> Settings
          </Link>
          <div className="admin-mini">
            <div className="avatar">AT</div>
            <div>
              <b>{user.name || "Administrator"}</b>
              <small>{user.email}</small>
            </div>
            <button
              className="icon-button"
              onClick={signOut}
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button menu-toggle"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>{navigation.find(([href]) => href === active)?.[1] || "Add"}</b>
          </div>
          <div className="top-actions">
            <a className="storefront" href="#storefront">
              View storefront
            </a>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="top-avatar">AT</div>
          </div>
        </header>
        <div className="page-wrap">{children}</div>
      </main>
    </div>
  );
}

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Button({
  children,
  href,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "soft";
}) {
  return href ? (
    <Link className={`button ${variant}`} href={href}>
      {children}
    </Link>
  ) : (
    <button className={`button ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
export function Status({ value }: { value: string }) {
  return <span className={`status status-${value}`}>{value}</span>;
}
export function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <b>{text}</b>
      <span>There is nothing here yet.</span>
    </div>
  );
}
