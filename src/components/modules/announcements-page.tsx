"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Megaphone,
  Search,
  Plus,
  Pencil,
  Trash2,
  Paperclip,
  X,
  Pin,
  Calendar,
  MoreVertical,
  Filter,
  Inbox,
} from "lucide-react";

import { fetchApi, formatDateShort, categoryColor } from "@/lib/api";
import type { Announcement, Attachment } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import {
  GlassCard,
  NewBadge,
  PinnedBadge,
  UrgentBadge,
} from "@/components/common/glass-card";
import { FileIcon } from "@/components/common/file-icon";
import { useDocPreview } from "@/components/common/doc-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---- Constants ----------------------------------------------------------
const CATEGORIES = [
  "Semua",
  "Korporat",
  "HR",
  "Operasi",
  "Kesihatan & Keselamatan",
  "ICT",
  "Kewangan",
] as const;

const COVER_COLORS = [
  { label: "Biru PERKESO", value: "#007DC5" },
  { label: "Hijau", value: "#8DC63E" },
  { label: "Teal", value: "#00C5AB" },
  { label: "Emas", value: "#F9BF10" },
  { label: "Oren", value: "#F27130" },
  { label: "Merah", value: "#ED1C24" },
];

const ATTACHMENT_TYPES: Attachment["type"][] = ["PDF", "DOCX", "XLSX"];

// ---- Form types ---------------------------------------------------------
interface AttachmentDraft {
  name: string;
  type: Attachment["type"];
  size: string;
}

interface AnnFormState {
  id?: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  authorName: string;
  isPinned: boolean;
  isUrgent: boolean;
  coverColor: string;
  attachments: AttachmentDraft[];
}

const EMPTY_FORM: AnnFormState = {
  title: "",
  category: "Korporat",
  summary: "",
  content: "",
  authorName: "",
  isPinned: false,
  isUrgent: false,
  coverColor: "#007DC5",
  attachments: [],
};

// ========================================================================
export function AnnouncementsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "Admin";
  const { preview } = useDocPreview();

  const [items, setItems] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState<string>("Semua");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // detail dialog
  const [detail, setDetail] = React.useState<Announcement | null>(null);

  // admin form dialog
  const [formOpen, setFormOpen] = React.useState(false);
  const [form, setForm] = React.useState<AnnFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  // delete confirm
  const [toDelete, setToDelete] = React.useState<Announcement | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Build query string & fetch
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== "Semua") params.set("category", category);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const qs = params.toString();
      const res = await fetchApi<{ items: Announcement[] }>(
        `/api/announcements${qs ? `?${qs}` : ""}`
      );
      setItems(res.items ?? []);
    } catch (e) {
      toast.error("Gagal memuatkan pengumuman", {
        description: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  // ---- Admin form actions ----
  const openCreate = () => {
    setForm({ ...EMPTY_FORM, authorName: user?.name || "" });
    setFormOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setForm({
      id: a.id,
      title: a.title,
      category: a.category,
      summary: a.summary,
      content: a.content,
      authorName: a.authorName,
      isPinned: a.isPinned,
      isUrgent: a.isUrgent,
      coverColor: a.coverColor,
      attachments: (a.attachments ?? []).map((x) => ({
        name: x.name,
        type: (x.type as Attachment["type"]) || "PDF",
        size: x.size,
      })),
    });
    setFormOpen(true);
  };

  const submitForm = async () => {
    // Basic validation
    if (!form.title.trim()) return toast.error("Tajuk diperlukan.");
    if (!form.category) return toast.error("Kategori diperlukan.");
    if (!form.summary.trim()) return toast.error("Ringkasan diperlukan.");
    if (!form.content.trim()) return toast.error("Kandungan diperlukan.");
    if (!form.authorName.trim()) return toast.error("Nama penulis diperlukan.");

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        summary: form.summary.trim(),
        content: form.content.trim(),
        authorName: form.authorName.trim(),
        authorId: user?.id ?? null,
        isPinned: form.isPinned,
        isUrgent: form.isUrgent,
        coverColor: form.coverColor,
        attachments: form.attachments
          .filter((a) => a.name.trim())
          .map((a) => ({
            name: a.name.trim(),
            type: a.type,
            size: a.size || "—",
          })),
      };
      if (form.id) {
        await fetchApi(`/api/announcements?id=${form.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Pengumuman dikemas kini.");
      } else {
        await fetchApi("/api/announcements", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Pengumuman baharu ditambah.");
      }
      setFormOpen(false);
      await load();
    } catch (e) {
      toast.error("Gagal menyimpan pengumuman", {
        description: (e as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/announcements?id=${toDelete.id}`, {
        method: "DELETE",
      });
      toast.success("Pengumuman dipadam.");
      setToDelete(null);
      await load();
    } catch (e) {
      toast.error("Gagal memadam", { description: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  };

  // ---- Attachment row helpers ----
  const addAttachment = () =>
    setForm((f) => ({
      ...f,
      attachments: [...f.attachments, { name: "", type: "PDF", size: "" }],
    }));
  const updateAttachment = (idx: number, patch: Partial<AttachmentDraft>) =>
    setForm((f) => ({
      ...f,
      attachments: f.attachments.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }));
  const removeAttachment = (idx: number) =>
    setForm((f) => ({
      ...f,
      attachments: f.attachments.filter((_, i) => i !== idx),
    }));

  // ---- Render ----
  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-[#007DC5]/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-[#8DC63E]/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007DC5] to-[#004E7A] flex items-center justify-center text-white shadow-lg shadow-[#007DC5]/30 flex-shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Pengumuman &amp; Berita
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Makluman terkini dan berita korporat PERKESO. Klik pada kad untuk
                baca sepenuhnya.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Pengumuman
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter row + search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="glass rounded-2xl p-4 sm:p-5 flex flex-col gap-4"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider font-semibold">Tapis Kategori</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all " +
                  (active
                    ? "bg-[#007DC5] text-white border-[#007DC5] shadow-md shadow-[#007DC5]/30"
                    : "bg-background/60 text-muted-foreground border-border hover:bg-muted hover:text-foreground")
                }
              >
                {c}
              </button>
            );
          })}
        </div>
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tajuk, ringkasan, kandungan..."
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 space-y-3">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">Tiada rekod ditemui</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cuba ubah kata kunci carian atau tapisan kategori.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a, i) => {
            const cat = categoryColor(a.category);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
              >
                <GlassCard hover className="relative overflow-hidden flex flex-col h-full">
                  {/* top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ background: a.coverColor }}
                  />
                  {/* soft tint */}
                  <div
                    className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-15 blur-2xl pointer-events-none"
                    style={{ background: a.coverColor }}
                  />

                  <div className="relative flex flex-col h-full">
                    {/* badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {a.isPinned && <PinnedBadge />}
                      {a.isUrgent && <UrgentBadge />}
                      {a.isNew && <NewBadge />}
                      <span
                        className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                        style={{
                          background: `${cat}15`,
                          color: cat,
                          borderColor: `${cat}40`,
                        }}
                      >
                        {a.category}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold leading-snug line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 flex-1">
                      {a.summary}
                    </p>

                    <div className="flex items-center gap-3 mt-4 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        {a.authorName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateShort(a.datePublished)}
                      </span>
                      {a.attachments?.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {a.attachments.length}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetail(a)}
                        className="text-primary hover:text-primary"
                      >
                        Baca lagi
                      </Button>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(a)}>
                              <Pencil className="w-3.5 h-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setToDelete(a)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Padam
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scroll-pretty">
          {detail && (
            <>
              <DialogHeader>
                <div
                  className="h-1.5 w-14 rounded-full mb-2"
                  style={{ background: detail.coverColor }}
                />
                <DialogTitle className="text-xl leading-tight pr-8">
                  {detail.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Butiran penuh pengumuman
                </DialogDescription>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {detail.isPinned && <PinnedBadge />}
                  {detail.isUrgent && <UrgentBadge />}
                  {detail.isNew && <NewBadge />}
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                    style={{
                      background: `${categoryColor(detail.category)}15`,
                      color: categoryColor(detail.category),
                      borderColor: `${categoryColor(detail.category)}40`,
                    }}
                  >
                    {detail.category}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Pin className="w-3 h-3" /> {detail.authorName}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDateShort(detail.datePublished)}
                  </span>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                  <p className="text-sm font-medium text-foreground mb-1">Ringkasan</p>
                  <p className="text-xs text-muted-foreground">{detail.summary}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Kandungan</p>
                  <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {detail.content}
                  </p>
                </div>

                {detail.attachments?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      Lampiran ({detail.attachments.length})
                    </p>
                    <div className="space-y-2">
                      {detail.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-2.5 hover:border-primary/40 transition-colors"
                        >
                          <FileIcon type={att.type} size={32} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{att.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {att.type} · {att.size}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              preview({
                                fileName: att.name,
                                fileType: att.type,
                                fileSize: att.size,
                                title: detail.title,
                              })
                            }
                          >
                            Lihat
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetail(null)}>
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin form dialog (Tambah / Edit) */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto scroll-pretty">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Pengumuman" : "Tambah Pengumuman Baharu"}
            </DialogTitle>
            <DialogDescription>
              Isi semua medan bertanda wajib. Lampiran adalah pilihan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="grid gap-2">
              <Label htmlFor="ann-title">Tajuk *</Label>
              <Input
                id="ann-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Sambutan Hari Kebangsaan 2026"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kategori *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Warna Cover</Label>
                <Select
                  value={form.coverColor}
                  onValueChange={(v) => setForm({ ...form, coverColor: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih warna" />
                  </SelectTrigger>
                  <SelectContent>
                    {COVER_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: c.value }}
                          />
                          {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ann-summary">Ringkasan *</Label>
              <Input
                id="ann-summary"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Satu ayat ringkasan"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ann-content">Kandungan *</Label>
              <Textarea
                id="ann-content"
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Tulis kandungan penuh pengumuman..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ann-author">Nama Penulis *</Label>
              <Input
                id="ann-author"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="Nama penulis"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={form.isPinned}
                  onCheckedChange={(v) => setForm({ ...form, isPinned: v })}
                />
                <span className="text-sm">Semat di Atas</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={form.isUrgent}
                  onCheckedChange={(v) => setForm({ ...form, isUrgent: v })}
                />
                <span className="text-sm">Segera</span>
              </label>
            </div>

            {/* Attachments */}
            <div className="grid gap-2 pt-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  Lampiran
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttachment}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Lampiran
                </Button>
              </div>

              {form.attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Tiada lampiran. Klik "Tambah Lampiran" untuk menambah.
                </p>
              ) : (
                <div className="space-y-2">
                  {form.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center rounded-lg border border-border/40 p-2 bg-background/40"
                    >
                      <Input
                        className="col-span-12 sm:col-span-5"
                        placeholder="Nama fail"
                        value={att.name}
                        onChange={(e) =>
                          updateAttachment(idx, { name: e.target.value })
                        }
                      />
                      <Select
                        value={att.type}
                        onValueChange={(v) =>
                          updateAttachment(idx, { type: v as Attachment["type"] })
                        }
                      >
                        <SelectTrigger className="col-span-6 sm:col-span-3 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTACHMENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="col-span-5 sm:col-span-3 h-9"
                        placeholder="Saiz"
                        value={att.size}
                        onChange={(e) =>
                          updateAttachment(idx, { size: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-1 h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => removeAttachment(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={submitForm} disabled={submitting} className="gap-2">
              {submitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {form.id ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam pengumuman ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak boleh diundur. Pengumuman{" "}
              <span className="font-medium text-foreground">
                {toDelete?.title}
              </span>{" "}
              akan dipadam secara kekal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Memadam..." : "Ya, Padam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
