"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavStore, type PageKey } from "@/stores/nav-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  Scale,
  ShieldCheck,
  ClipboardList,
  FileText,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck as Shield,
  X,
} from "lucide-react";

interface NavItem {
  key: PageKey;
  label: string;
  icon: React.ElementType;
  desc: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Papan Pemuka" },
  { key: "announcements", label: "Pengumuman", icon: Megaphone, desc: "Berita & Maklumat" },
  { key: "acts", label: "Akta", icon: Scale, desc: "Akta PERKESO" },
  { key: "asip", label: "ASIP", icon: ShieldCheck, desc: "Akta Sistem Insurans Pekerjaan" },
  { key: "sop", label: "SOP", icon: ClipboardList, desc: "Prosedur Operasi Standard" },
  { key: "circulars", label: "Pekeliling", icon: FileText, desc: "Pekeliling Rasmi" },
  { key: "faq", label: "Soalan Lazim", icon: HelpCircle, desc: "FAQ Kakitangan" },
  { key: "admin", label: "Panel Pentadbiran", icon: Settings, desc: "Pengurusan Kandungan", adminOnly: true },
];

export function Sidebar() {
  const { currentPage, setPage, sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } =
    useNavStore();
  const user = useAuthStore((s) => s.user);
  const collapsed = sidebarCollapsed;
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || user?.role === "Admin");

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "glass border-r border-border/60 z-50 flex flex-col transition-all duration-300",
          "fixed lg:sticky top-0 left-0 h-screen",
          collapsed ? "w-[72px]" : "w-64",
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
        style={{ background: "var(--glass-bg)" }}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
          <button
            onClick={() => setPage("dashboard")}
            className={cn(
              "flex items-center gap-2.5 min-w-0 group",
              collapsed && "lg:justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007DC5] to-[#004E7A] flex items-center justify-center shadow-md shadow-[#007DC5]/30 ring-1 ring-white/30 flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="text-left min-w-0">
                <div className="text-sm font-bold text-foreground leading-tight truncate">
                  PERKESO
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                  Bulletin Dashboard
                </div>
              </div>
            )}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto scroll-pretty px-2.5 py-4 space-y-1">
          {items.map((item) => {
            const active = currentPage === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group",
                  active
                    ? "nav-active font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  collapsed && "lg:justify-center lg:px-0"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors flex-shrink-0",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </span>
                {!collapsed && (
                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="truncate text-[13px] leading-tight">
                      {item.label}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground/80">
                      {item.desc}
                    </span>
                  </div>
                )}
                {active && !collapsed && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="w-1.5 h-6 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden lg:block p-2 border-t border-border/40">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Kolapskan</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
