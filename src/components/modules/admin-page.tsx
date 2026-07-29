"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Settings,
  Megaphone,
  Scale,
  ShieldCheck,
  ClipboardList,
  FileText,
  HelpCircle,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  UserPlus,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useNavStore, type PageKey } from "@/stores/nav-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  fetchApi,
  formatDateShort,
  timeAgoMs,
  categoryColor,
} from "@/lib/api";
import type {
  UserRow,
  DashboardStats,
} from "@/lib/types";
import { GlassCard, StatPill, StatusBadge } from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Module definitions                                                  */
/* ------------------------------------------------------------------ */

type ModuleKey =
  | "announcements"
  | "acts"
  | "asip"
  | "sop"
  | "circulars"
  | "faq";

interface ModuleDef {
  key: ModuleKey;
  navKey: PageKey;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  apiPath: string;
  countKey: keyof DashboardStats["counts"];
  /** Field name to PATCH when editing the title inline (e.g. "question" for FAQ). */
  editField: string;
}

const MODULES: ModuleDef[] = [
  {
    key: "announcements",
    navKey: "announcements",
    label: "Pengumuman",
    desc: "Berita & maklumat rasmi",
    icon: Megaphone,
    color: "#007DC5",
    apiPath: "/api/announcements",
    countKey: "announcements",
    editField: "title",
  },
  {
    key: "acts",
    navKey: "acts",
    label: "Akta",
    desc: "Akta & peraturan PERKESO",
    icon: Scale,
    color: "#00C5AB",
    apiPath: "/api/acts",
    countKey: "acts",
    editField: "title",
  },
  {
    key: "asip",
    navKey: "asip",
    label: "ASIP",
    desc: "Akta Sistem Insurans Pekerjaan",
    icon: ShieldCheck,
    color: "#597E26",
    apiPath: "/api/asip",
    countKey: "asips",
    editField: "title",
  },
  {
    key: "sop",
    navKey: "sop",
    label: "SOP",
    desc: "Prosedur Operasi Standard",
    icon: ClipboardList,
    color: "#8DC63E",
    apiPath: "/api/sop",
    countKey: "sops",
    editField: "title",
  },
  {
    key: "circulars",
    navKey: "circulars",
    label: "Pekeliling",
    desc: "Pekeliling rasmi",
    icon: FileText,
    color: "#F27130",
    apiPath: "/api/circulars",
    countKey: "circulars",
    editField: "title",
  },
  {
    key: "faq",
    navKey: "faq",
    label: "FAQ",
    desc: "Soalan lazim kakitangan",
    icon: HelpCircle,
    color: "#F9BF10",
    apiPath: "/api/faq",
    countKey: "faqs",
    editField: "question",
  },
];

/** Normalised content row used by the management table. */
interface ContentRow {
  id: string;
  title: string;
  status?: string;
  category?: string;
  date: string;
}

function normalizeItems(moduleKey: ModuleKey, items: any[]): ContentRow[] {
  return (items || []).map((it) => {
    let title: string = it.title ?? it.question ?? it.actNumber ?? "—";
    let status: string | undefined;
    let category: string | undefined;
    let date: string =
      it.datePublished ??
      it.dateIssued ??
      it.lastUpdated ??
      it.effectiveDate ??
      it.dateApproved ??
      it.createdAt;

    if (moduleKey === "announcements") {
      category = it.category;
      status = it.isUrgent ? "Segera" : it.isPinned ? "Disemat" : "Aktif";
    } else if (moduleKey === "acts") {
      status = it.status;
      category = it.category;
    } else if (moduleKey === "asip") {
      status = it.status;
      category = it.category;
    } else if (moduleKey === "sop") {
      status = it.status;
      category = it.department;
    } else if (moduleKey === "circulars") {
      status = it.isMandatory ? "Wajib" : "Biasa";
      category = it.category;
    } else if (moduleKey === "faq") {
      category = it.category;
      status = "Aktif";
    }

    return { id: it.id, title, status, category, date };
  });
}

/* ------------------------------------------------------------------ */
/*  Permission gate                                                    */
/* ------------------------------------------------------------------ */

export function AdminPage() {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <GlassCard className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400 flex items-center justify-center mb-3">
              <ShieldAlert size={26} />
            </div>
            <h2 className="text-lg font-semibold">Akses Ditolak</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Hanya pentadbir sahaja boleh mengakses Panel Pentadbiran. Sila
              hubungi pentadbir sistem jika anda memerlukan akses.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return <AdminContent />;
}

/* ------------------------------------------------------------------ */
/*  Admin content (only rendered for Admins)                          */
/* ------------------------------------------------------------------ */

function AdminContent() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [usersLoading, setUsersLoading] = React.useState(true);

  const loadStats = React.useCallback(() => {
    setStatsLoading(true);
    fetchApi<DashboardStats>("/api/dashboard-stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const loadUsers = React.useCallback(() => {
    setUsersLoading(true);
    fetchApi<{ items: UserRow[] }>("/api/users")
      .then((res) => setUsers(res.items))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, []);

  React.useEffect(() => {
    loadStats();
    loadUsers();
  }, [loadStats, loadUsers]);

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#007DC5]/10 via-transparent to-[#FFBF00]/10" />
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#007DC5]/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full bg-[#FFBF10]/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-white/40 text-[10px] uppercase tracking-wider font-semibold text-primary">
              <Settings size={10} /> Panel Pentadbiran
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Kawalan penuh kandungan & pengguna
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Panel <span className="text-brand-gradient">Pentadbiran</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            Urus kandungan semua modul dan pentadbiran pengguna PERKESO
            Bulletin Dashboard — tambah, edit, padam entri serta kawal akses
            pengguna.
          </p>
        </div>
      </motion.div>

      {/* Quick stat pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill
          label="Pengumuman"
          value={stats ? stats.counts.announcements : "—"}
          color="#007DC5"
          icon={<Megaphone size={18} />}
          trend="Modul"
        />
        <StatPill
          label="Akta & Peraturan"
          value={stats ? stats.counts.acts : "—"}
          color="#00C5AB"
          icon={<Scale size={18} />}
          trend="Rujukan"
        />
        <StatPill
          label="Jumlah Pengguna"
          value={users.length}
          color="#8DC63E"
          icon={<Users size={18} />}
          trend="Pengguna"
        />
        <StatPill
          label="Soalan Lazim"
          value={stats ? stats.counts.faqs : "—"}
          color="#F9BF10"
          icon={<HelpCircle size={18} />}
          trend="FAQ"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="w-full sm:w-fit grid grid-cols-2 sm:flex">
          <TabsTrigger value="content" className="gap-1.5">
            <FileText size={14} /> Pengurusan Kandungan
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users size={14} /> Pengurusan Pengguna
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <ContentManagementTab stats={stats} loading={statsLoading} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTab
            users={users}
            loading={usersLoading}
            onRefresh={loadUsers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Content Management                                          */
/* ------------------------------------------------------------------ */

function ContentManagementTab({
  stats,
  loading,
}: {
  stats: DashboardStats | null;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {MODULES.map((m, i) => {
        const count = stats ? (stats.counts[m.countKey] as number) : 0;
        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <ManageModuleCard module={m} count={count} loading={loading} />
          </motion.div>
        );
      })}
    </div>
  );
}

function ManageModuleCard({
  module,
  count,
  loading,
}: {
  module: ModuleDef;
  count: number;
  loading: boolean;
}) {
  const { setPage } = useNavStore();
  const [manageOpen, setManageOpen] = React.useState(false);
  const Icon = module.icon;

  return (
    <>
      <GlassCard hover className="flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0"
              style={{ background: module.color }}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{module.label}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {module.desc}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {loading ? (
              <div className="h-6 w-8 rounded-md bg-muted animate-pulse" />
            ) : (
              <div className="text-2xl font-bold leading-none">{count}</div>
            )}
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Entri
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 flex-1"
            onClick={() => setManageOpen(true)}
          >
            <Settings size={14} /> Urus
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 flex-1"
            onClick={() => setPage(module.navKey)}
          >
            <Plus size={14} /> Tambah
          </Button>
        </div>
      </GlassCard>

      <ManageItemsDialog
        module={module}
        open={manageOpen}
        onOpenChange={setManageOpen}
      />
    </>
  );
}

function ManageItemsDialog({
  module,
  open,
  onOpenChange,
}: {
  module: ModuleDef;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { setPage } = useNavStore();
  const [items, setItems] = React.useState<ContentRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<ContentRow | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchApi<{ items: any[] }>(module.apiPath)
      .then((res) => setItems(normalizeItems(module.key, res.items)))
      .catch((e) => {
        toast.error(`Gagal memuatkan ${module.label}: ${e.message}`);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [open, module.apiPath, module.key, module.label]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/${module.key}?id=${deleteId}`, { method: "DELETE" });
      toast.success(`${module.label} berjaya dipadam.`);
      setItems((prev) => prev.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      toast.error(`Gagal memadam: ${(e as Error).message}`);
    } finally {
      setDeleting(false);
    }
  }

  async function handleEditSave(id: string, title: string) {
    try {
      await fetchApi(`/api/${module.key}?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({ [module.editField]: title }),
      });
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, title } : r))
      );
      toast.success(`${module.label} berjaya dikemas kini.`);
      setEditing(null);
    } catch (e) {
      toast.error(`Gagal menyimpan: ${(e as Error).message}`);
    }
  }

  const Icon = module.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon size={18} style={{ color: module.color }} />
              Urus {module.label}
            </DialogTitle>
            <DialogDescription>
              Senarai semua entri {module.label}. Klik{" "}
              <span className="font-medium">Edit</span> untuk menukar tajuk, atau{" "}
              <span className="font-medium">Padam</span> untuk membuang entri.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-muted-foreground">
              {items.length} entri ditemui
            </span>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onOpenChange(false);
                setPage(module.navKey);
              }}
            >
              <Plus size={14} /> Tambah Baharu
              <ArrowUpRight size={12} />
            </Button>
          </div>

          <div className="rounded-lg border border-border/60 max-h-[420px] overflow-y-auto scroll-pretty">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">ID</TableHead>
                  <TableHead>Tajuk</TableHead>
                  <TableHead>Status / Kategori</TableHead>
                  <TableHead>Tarikh</TableHead>
                  <TableHead className="text-right w-[110px]">
                    Tindakan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-10"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon
                          size={28}
                          className="text-muted-foreground/40"
                        />
                        <span className="text-sm">
                          Tiada entri {module.label} ditemui.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-[11px] text-muted-foreground truncate max-w-[100px]">
                        …{row.id.slice(-8)}
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <span className="font-medium line-clamp-2">
                          {row.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          {row.status && (
                            <StatusBadge
                              status={row.status}
                              variant={
                                row.status === "Segera" ||
                                row.status === "Wajib"
                                  ? "danger"
                                  : row.status === "Aktif"
                                  ? "success"
                                  : "info"
                              }
                            />
                          )}
                          {row.category && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                              style={{
                                background: `${categoryColor(row.category)}20`,
                                color: categoryColor(row.category),
                              }}
                            >
                              {row.category}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateShort(row.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditing(row)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => setDeleteId(row.id)}
                            title="Padam"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inline edit dialog */}
      <EditItemDialog
        module={module}
        row={editing}
        onClose={() => setEditing(null)}
        onSave={handleEditSave}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam {module.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak boleh diundur. Entri akan dibuang secara
              kekal dari pangkalan data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Ya, Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EditItemDialog({
  module,
  row,
  onClose,
  onSave,
}: {
  module: ModuleDef;
  row: ContentRow | null;
  onClose: () => void;
  onSave: (id: string, title: string) => Promise<void> | void;
}) {
  const [title, setTitle] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (row) setTitle(row.title);
  }, [row]);

  async function handleSave() {
    if (!row || !title.trim()) return;
    setSaving(true);
    try {
      await onSave(row.id, title.trim());
    } finally {
      setSaving(false);
    }
  }

  const Icon = module.icon;

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon size={18} style={{ color: module.color }} />
            Edit {module.label}
          </DialogTitle>
          <DialogDescription>
            Kemas kini tajuk untuk entri ini. Untuk medan lain, sila guna
            modul penuh di sidebar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">
              {module.editField === "question" ? "Soalan" : "Tajuk"}
            </Label>
            <Textarea
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={3}
              autoFocus
            />
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="font-mono">ID: …{row?.id.slice(-12) ?? "—"}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()} className="gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — User Management                                             */
/* ------------------------------------------------------------------ */

function UserManagementTab({
  users,
  loading,
  onRefresh,
}: {
  users: UserRow[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "Admin" | "Staff">(
    "all"
  );
  const [addOpen, setAddOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<UserRow | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/users?id=${deleteId}`, { method: "DELETE" });
      toast.success("Pengguna berjaya dipadam.");
      setDeleteId(null);
      onRefresh();
    } catch (e) {
      toast.error(`Gagal memadam: ${(e as Error).message}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cari nama atau e-mel…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 sm:w-64"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as "all" | "Admin" | "Staff")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder="Tapis peranan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peranan</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-1.5" onClick={() => setAddOpen(true)}>
          <UserPlus size={16} /> Tambah Pengguna Baharu
        </Button>
      </div>

      {/* User table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Peranan</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Cawangan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login Terakhir</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-10"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users size={28} className="text-muted-foreground/40" />
                      <span className="text-sm">
                        Tiada pengguna ditemui dengan penapis ini.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border border-border/60">
                          {u.avatarUrl && (
                            <AvatarImage src={u.avatarUrl} alt={u.name} />
                          )}
                          <AvatarFallback className="text-xs font-semibold">
                            {u.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          u.role === "Admin"
                            ? "border-blue-300 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                            : "border-green-300 bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30"
                        }
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.department ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.branch ?? "—"}
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <StatusBadge status="Aktif" variant="success" />
                      ) : (
                        <StatusBadge status="Tidak Aktif" variant="neutral" />
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {u.lastLogin ? timeAgoMs(u.lastLogin) : "Belum log masuk"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditUser(u)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => setDeleteId(u.id)}
                          title="Padam"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </GlassCard>

      <AddUserDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={onRefresh}
      />
      <EditUserDialog
        user={editUser}
        onClose={() => setEditUser(null)}
        onSaved={onRefresh}
      />
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan membuang pengguna secara kekal. Pengguna tidak
              akan dapat log masuk lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Ya, Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add + Edit user dialogs                                             */
/* ------------------------------------------------------------------ */

interface UserFormState {
  name: string;
  role: "Admin" | "Staff";
  department: string;
  branch: string;
  position: string;
  avatarUrl: string;
  isActive: boolean;
}

function AddUserDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [form, setForm] = React.useState<UserFormState>({
    name: "",
    role: "Staff",
    department: "",
    branch: "",
    position: "",
    avatarUrl: "",
    isActive: true,
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setForm({
        name: "",
        role: "Staff",
        department: "",
        branch: "",
        position: "",
        avatarUrl: "",
        isActive: true,
      });
    }
  }, [open]);

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !form.role) {
      toast.error("Nama, e-mel, dan peranan diperlukan.");
      return;
    }
    setSaving(true);
    try {
      await fetchApi("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: form.role,
          department: form.department.trim() || null,
          branch: form.branch.trim() || null,
          position: form.position.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
          isActive: form.isActive,
        }),
      });
      toast.success(`Pengguna ${name.trim()} berjaya ditambah.`);
      onCreated();
      onOpenChange(false);
    } catch (e) {
      toast.error(`Gagal menambah pengguna: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} /> Tambah Pengguna Baharu
          </DialogTitle>
          <DialogDescription>
            Akaun baharu akan dicipta dengan kata laluan lalai{" "}
            <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">
              perkeso123
            </code>
            . Pengguna diminta menukar kata laluan selepas log masuk pertama.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="add-name">
              Nama Penuh <span className="text-red-500">*</span>
            </Label>
            <Input
              id="add-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth: Aisyah Binti Rahman"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="add-email">
              E-mel <span className="text-red-500">*</span>
            </Label>
            <Input
              id="add-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perkeso.gov.my"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Peranan</Label>
            <Select
              value={form.role}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, role: v as "Admin" | "Staff" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-position">Jawatan</Label>
            <Input
              id="add-position"
              value={form.position}
              onChange={(e) =>
                setForm((f) => ({ ...f, position: e.target.value }))
              }
              placeholder="cth: Pegawai Pampasan"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-dept">Jabatan</Label>
            <Input
              id="add-dept"
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              placeholder="Bahagian Pampasan"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-branch">Cawangan</Label>
            <Input
              id="add-branch"
              value={form.branch}
              onChange={(e) =>
                setForm((f) => ({ ...f, branch: e.target.value }))
              }
              placeholder="Ibu Pejabat KL"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="add-avatar">URL Avatar</Label>
            <Input
              id="add-avatar"
              value={form.avatarUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, avatarUrl: e.target.value }))
              }
              placeholder="https://i.pravatar.cc/150?img=1"
            />
          </div>
          <div className="flex items-center justify-between col-span-2 rounded-lg bg-muted/40 p-3">
            <div>
              <Label>Akaun Aktif</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengguna boleh log masuk jika ditetapkan aktif.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, isActive: v }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving}
            className="gap-1.5"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Cipta Pengguna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  onClose,
  onSaved,
}: {
  user: UserRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<UserFormState>({
    name: "",
    role: "Staff",
    department: "",
    branch: "",
    position: "",
    avatarUrl: "",
    isActive: true,
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        role: user.role,
        department: user.department ?? "",
        branch: user.branch ?? "",
        position: user.position ?? "",
        avatarUrl: user.avatarUrl ?? "",
        isActive: user.isActive,
      });
    }
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await fetchApi(`/api/users?id=${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role,
          department: form.department.trim() || null,
          branch: form.branch.trim() || null,
          position: form.position.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
          isActive: form.isActive,
        }),
      });
      toast.success("Pengguna berjaya dikemas kini.");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(`Gagal menyimpan: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil size={18} /> Edit Pengguna
          </DialogTitle>
          <DialogDescription>
            Kemas kini maklumat pengguna. E-mel tidak boleh diubah selepas akaun
            dicipta.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border/60">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              )}
              <AvatarFallback className="text-xs font-semibold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate font-mono">
                {user.email}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="edit-name">Nama Penuh</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Peranan</Label>
            <Select
              value={form.role}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, role: v as "Admin" | "Staff" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-position">Jawatan</Label>
            <Input
              id="edit-position"
              value={form.position}
              onChange={(e) =>
                setForm((f) => ({ ...f, position: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-dept">Jabatan</Label>
            <Input
              id="edit-dept"
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-branch">Cawangan</Label>
            <Input
              id="edit-branch"
              value={form.branch}
              onChange={(e) =>
                setForm((f) => ({ ...f, branch: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="edit-avatar">URL Avatar</Label>
            <Input
              id="edit-avatar"
              value={form.avatarUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, avatarUrl: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center justify-between col-span-2 rounded-lg bg-muted/40 p-3">
            <div>
              <Label>Akaun Aktif</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengguna boleh log masuk jika ditetapkan aktif.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, isActive: v }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
