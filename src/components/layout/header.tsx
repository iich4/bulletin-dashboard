"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useNavStore } from "@/stores/nav-store";
import { useAuthStore } from "@/stores/auth-store";
import { fetchApi, timeAgoMs, highlightKeyword } from "@/lib/api";
import type { SearchResults, Notification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  LogOut,
  UserCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

const NOTIF_COLORS: Record<string, string> = {
  info: "#007DC5",
  warning: "#F9BF10",
  success: "#8DC63E",
  critical: "#ED1C24",
};
const NOTIF_ICONS: Record<string, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  critical: AlertCircle,
};

export function Header() {
  const { setMobileSidebarOpen, currentPage } = useNavStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border/50 px-4 sm:px-6 py-3">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <div className="hidden sm:flex flex-col">
          <h1 className="text-base sm:text-lg font-bold capitalize tracking-tight">
            {currentPage === "asip"
              ? "ASIP"
              : currentPage === "faq"
              ? "Soalan Lazim"
              : currentPage === "sop"
              ? "SOP"
              : currentPage === "admin"
              ? "Panel Pentadbiran"
              : currentPage}
          </h1>
          <span className="text-[10px] text-muted-foreground/80 uppercase tracking-wider">
            PERKESO Bulletin Dashboard
          </span>
        </div>

        <div className="flex-1" />

        {/* Global Search */}
        <GlobalSearch />

        {/* Notifications */}
        <NotificationBell />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative p-2 rounded-lg glass text-foreground hover:bg-muted/40 transition-colors"
          aria-label="Tukar mod gelap/terang"
          title={theme === "dark" ? "Mod Terang" : "Mod Gelap"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "dark" ? (
              <motion.span
                key="sun"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-4.5 h-4.5 text-[#FFBF10]" style={{ width: 18, height: 18 }} />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ opacity: 0, rotate: 45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -45 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-4.5 h-4.5 text-[#002147]" style={{ width: 18, height: 18 }} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User menu */}
        {user && <UserMenu />}
      </div>
    </header>
  );
}

function GlobalSearch() {
  const { setPage } = useNavStore();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetchApi<SearchResults>(`/api/search?q=${encodeURIComponent(q)}`);
        setResults(r);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const GROUP_LABELS: Record<string, string> = {
    announcements: "Pengumuman",
    acts: "Akta",
    asip: "ASIP",
    sop: "SOP",
    circulars: "Pekeliling",
    faq: "Soalan Lazim",
  };

  const goPage: Record<string, () => void> = {
    announcements: () => setPage("announcements"),
    acts: () => setPage("acts"),
    asip: () => setPage("asip"),
    sop: () => setPage("sop"),
    circulars: () => setPage("circulars"),
    faq: () => setPage("faq"),
  };

  return (
    <div className="relative flex-1 max-w-md" ref={boxRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Cari merentasi semua modul..."
          className="w-full pl-10 pr-16 py-2 rounded-xl glass text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground"
        />
        <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      <AnimatePresence>
        {open && q.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 glass-strong rounded-2xl border border-border shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto scroll-pretty z-50"
          >
            {loading && !results && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Mencari...
              </div>
            )}
            {results && results.total === 0 && !loading && (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Tiada hasil untuk &quot;<span className="font-medium text-foreground">{q}</span>&quot;
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Cuba kata kunci lain.
                </p>
              </div>
            )}
            {results && results.total > 0 && (
              <div className="p-2">
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold flex items-center justify-between">
                  <span>{results.total} Hasil Carian</span>
                  <span className="text-[10px] font-mono opacity-60">{q}</span>
                </div>
                {Object.entries(results.groups).map(([group, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={group} className="mb-1">
                      <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-primary/80 flex items-center justify-between">
                        <span>{GROUP_LABELS[group] || group}</span>
                        <span className="text-[10px] text-muted-foreground/70 font-normal">
                          {items.length} entri
                        </span>
                      </div>
                      {items.map((item) => {
                        const parts = highlightKeyword(item.title, q);
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              goPage[group]?.();
                              setOpen(false);
                              setQ("");
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors group"
                          >
                            <div className="text-sm font-medium text-foreground line-clamp-1">
                              {parts.map((p, i) =>
                                p.match ? (
                                  <mark
                                    key={i}
                                    className="bg-[#FFBF00]/30 text-foreground px-0.5 rounded"
                                  >
                                    {p.text}
                                  </mark>
                                ) : (
                                  <React.Fragment key={i}>{p.text}</React.Fragment>
                                )
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground truncate max-w-[60%]">
                                {item.subtitle}
                              </span>
                              <ChevronRight className="w-3 h-3 text-muted-foreground/40 ml-auto group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationBell() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || "";
  const [items, setItems] = React.useState<Notification[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  const load = React.useCallback(async () => {
    if (!userId) return;
    try {
      const r = await fetchApi<{ items: Notification[]; unreadCount: number }>(
        `/api/notifications?userId=${userId}`
      );
      setItems(r.items);
      setUnread(r.unreadCount);
    } catch {
      /* ignore */
    }
  }, [userId]);

  React.useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}&action=read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    if (!userId) return;
    try {
      await fetch(`/api/notifications?userId=${userId}&action=readAll`, {
        method: "PATCH",
      });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success("Semua notifikasi ditandai telah dibaca.");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg glass hover:bg-muted/40 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-4.5 h-4.5 text-foreground" style={{ width: 18, height: 18 }} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[#ED1C24] rounded-full ring-2 ring-background animate-pulse-soft">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] glass-strong rounded-2xl border border-border shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Notifikasi</h3>
                {unread > 0 && (
                  <span className="text-[10px] bg-[#ED1C24] text-white px-1.5 py-0.5 rounded-full">
                    {unread} baru
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Tanda Semua Dibaca
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto scroll-pretty">
              {items.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Tiada notifikasi.
                </div>
              )}
              {items.map((n) => {
                const Icon = NOTIF_ICONS[n.type] || Info;
                const color = NOTIF_COLORS[n.type] || "#007DC5";
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-border/30 hover:bg-muted/40 transition-colors flex gap-3",
                      !n.isRead && "bg-primary/[0.04]"
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}20`, color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24] mt-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {timeAgoMs(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 glass rounded-xl pl-1.5 pr-2 py-1.5 hover:shadow-md transition-all"
      >
        <Avatar className="w-7 h-7 ring-1 ring-primary/30">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-[#007DC5] to-[#004E7A] text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[10rem]">
          <span className="text-xs font-semibold text-foreground truncate leading-tight">
            {user.name}
          </span>
          <span className="text-[10px] text-muted-foreground truncate leading-tight">
            {user.role === "Admin" ? "Pentadbir" : "Pengguna Am"}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl border border-border shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border/40 bg-gradient-to-br from-[#007DC5]/10 to-transparent">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#007DC5] to-[#004E7A] text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                  <div className="text-muted-foreground/70">Jabatan</div>
                  <div className="font-medium truncate">{user.department || "—"}</div>
                </div>
                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                  <div className="text-muted-foreground/70">Cawangan</div>
                  <div className="font-medium truncate">{user.branch || "—"}</div>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 text-sm text-foreground">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                Profil Saya
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 text-sm text-foreground">
                <Settings className="w-4 h-4 text-muted-foreground" />
                Tetapan
              </button>
              <button
                onClick={() => {
                  logout();
                  toast.success("Anda telah log keluar.");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Log Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
