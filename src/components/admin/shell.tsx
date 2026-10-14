import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  School,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// Publisher Studio frame for /admin: sidebar (collapsible on desktop, drawer on mobile)
// plus a top bar with "View website" and the account menu.

type NavItem = { to: string; label: string; icon: LucideIcon; badge?: number };

const COLLAPSE_KEY = "lionheart-admin-sidebar-collapsed";

export function AdminShell({ email, newInquiries, newSuggestions, children }: { email: string; newInquiries: number; newSuggestions: number; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname.replace(/\/+$/, "") || "/" });
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* storage unavailable: keep default */
    }
  }, []);
  useEffect(() => setDrawer(false), [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };

  const nav: NavItem[] = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/books", label: "My Books", icon: BookOpen },
    { to: "/admin/sales", label: "Sales", icon: BarChart3 },
    { to: "/admin/suggestions", label: "Suggestions", icon: MessageSquare, badge: newSuggestions },
    { to: "/admin/school-orders", label: "School Orders", icon: School, badge: newInquiries },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const links = (compact: boolean) => (
    <ul className="space-y-1">
      {nav.map((n) => {
        const active = pathname === n.to;
        return (
          <li key={n.to}>
            <Link
              to={n.to}
              aria-current={active ? "page" : undefined}
              title={compact ? n.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-card"
              } ${compact ? "justify-center" : ""}`}
            >
              <span className="relative">
                <n.icon aria-hidden className="size-5" />
                {compact && !!n.badge && <span className="absolute -right-1.5 -top-1.5 size-2.5 rounded-full bg-accent" />}
              </span>
              {!compact && <span className="flex-1">{n.label}</span>}
              {!compact && !!n.badge && (
                <span className="rounded-full bg-accent px-2 text-xs text-accent-foreground">{n.badge} new</span>
              )}
              {compact && !!n.badge && <span className="sr-only">{n.badge} new</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const brand = (
    <Link to="/admin" className="block min-w-0">
      <span className="block truncate font-display text-xl font-bold text-primary">J. B. Lionheart</span>
      <span className="block text-xs font-semibold uppercase tracking-widest text-terracotta">Publisher Studio</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 border-r bg-secondary md:flex md:flex-col ${collapsed ? "w-20" : "w-64"} transition-[width]`}>
        <div className={`flex items-center gap-2 p-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && brand}
          <button onClick={toggleCollapsed} className="rounded-lg p-2 hover:bg-card" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronsRight className="size-5" /> : <ChevronsLeft className="size-5" />}
          </button>
        </div>
        <nav aria-label="Admin" className="flex-1 px-3">{links(collapsed)}</nav>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-secondary p-4 shadow-lift">
            <div className="mb-4 flex items-center justify-between">
              {brand}
              <button onClick={() => setDrawer(false)} className="rounded-lg p-2 hover:bg-card" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label="Admin">{links(false)}</nav>
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setDrawer(true)} className="rounded-lg p-2 hover:bg-secondary md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <span className="md:hidden">{brand}</span>
          </div>
          <div className="flex items-center gap-1 text-sm sm:gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold hover:bg-secondary">
              <ExternalLink aria-hidden className="size-4" />
              <span className="hidden sm:inline">View website</span>
              <span className="sr-only sm:hidden">View website</span>
            </a>
            <span className="hidden max-w-56 truncate text-muted-foreground lg:inline">{email}</span>
            <button onClick={() => void supabase.auth.signOut()} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold hover:bg-secondary">
              <LogOut aria-hidden className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </button>
          </div>
        </header>
        <main id="main" className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
