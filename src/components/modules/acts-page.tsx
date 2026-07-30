"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Scale,
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
  Inbox,
  MoreVertical,
  Calendar,
} from "lucide-react";

import { fetchApi, formatDateShort, categoryColor } from "@/lib/api";
import type { Act } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import {
  GlassCard,
  StatusBadge,
} from "@/components/common/glass-card";
import { FileIcon } from "@/components/common/file-icon";
import { useDocPreview } from "@/components/common/doc-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---- Constants ----------------------------------------------------------
const ACT_CATEGORIES = [
  "Akta Sosial",
  "Akta Insurans",
  "Peraturan",
  "Lain-lain",
] as const;

const ACT_STATUSES: Act["status"][] = [
  "Aktif",
  "Digantungan",
  "Digantikan",
  "Dalam Semakan",
];

// Map status -> StatusBadge variant
const STATUS_VARIANT: Record<
  Act["status"],
  "success" | "warning" | "danger" | "info" | "neutral"
> = {
  Aktif: "success",
  Digantungan: "warning",
  Digantikan: "danger",
  "Dalam Semakan": "info",
};

interface ActFormState {
  id?: string;
  actNumber: string;
  title: string;
  category: string;
  description: string;
  version: string;
  status: Act["status"];
  fileName: string;
  fileSize: string;
}

const EMPTY_FORM: ActFormState = {
  actNumber: "",
  title: "",
  category: "Akta Sosial",
  description: "",
  version: "1.0",
  status: "Aktif",
  fileName: "",
  fileSize: "",
};

// ========================================================================
export function ActsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "Admin";
  const { preview } = useDocPreview();

  const [items, setItems] = React.useState<Act[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [detail, setDetail] = React.useState<Act | null>(null);

  const [formOpen, setFormOpen] = React.useState(false);
  const [form, setForm] = React.useState<ActFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  const [toDelete, setToDelete] = React.useState<Act | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== "all") params.set("category", category);
      if (status && status !== "all") params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const qs = params.toString();
      const res = await fetchApi<{ items: Act[] }>(
        `/api/acts${qs ? `?${qs}` : ""}`
      );
      setItems(res.items ?? []);
    } catch (e) {
      toast.error("Gagal memuatkan senarai akta", {
        description: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [category, status, debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setFormOpen(true);
  };
  const openEdit = (a: Act) => {
    setForm({
      id: a.id,
      actNumber: a.actNumber,
      title: a.title,
      category: a.category,
      description: a.description,
      version: a.version,
      status: a.status,
      fileName: a.fileName ?? "",
      fileSize: a.fileSize ?? "",
    });
    setFormOpen(true);
  };

  const submitForm = async () => {
    if (!form.actNumber.trim()) return toast.error("Nombor akta diperlukan.");
    if (!form.title.trim()) return toast.error("Tajuk akta diperlukan.");
    if (!form.category) return toast.error("Kategori diperlukan.");

    setSubmitting(true);
    try {
      const payload = {
        actNumber: form.actNumber.trim(),
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        version: form.version.trim() || "1.0",
        status: form.status,
        fileName: form.fileName.trim() || null,
        fileSize: form.fileSize.trim() || null,
      };
      if (form.id) {
        await fetchApi(`/api/acts?id=${form.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Akta dikemas kini.");
      } else {
        await fetchApi("/api/acts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Akta baharu ditambah.");
      }
      setFormOpen(false);
      await load();
    } catch (e) {
      toast.error("Gagal menyimpan akta", { description: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/acts?id=${toDelete.id}`, { method: "DELETE" });
      toast.success("Akta dipadam.");
      setToDelete(null);
      await load();
    } catch (e) {
      toast.error("Gagal memadam", { description: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-[#00C5AB]/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-[#007DC5]/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00C5AB] to-[#007DC5] flex items-center justify-center text-white shadow-lg shadow-[#00C5AB]/30 flex-shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Akta &amp; Peraturan PERKESO
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Rujukan rasmi Akta Sosial, Akta Insurans, dan peraturan
                berkaitan PERKESO.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Akta
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground sm:self-center">
          <Filter className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider font-semibold">Tapis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div className="grid gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {ACT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {ACT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Cari</Label>
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombor akta / tajuk..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      {loading ? (
        <GlassCard className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </GlassCard>
      ) : items.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">Tiada rekod ditemui</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cuba ubah kata kunci carian atau tapisan.
          </p>
        </GlassCard>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto scroll-pretty">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="min-w-[120px]">Nombor Akta</TableHead>
                    <TableHead className="min-w-[260px]">Tajuk</TableHead>
                    <TableHead className="min-w-[140px]">Kategori</TableHead>
                    <TableHead className="min-w-[100px]">Versi</TableHead>
                    <TableHead className="min-w-[120px]">Dikemaskini</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    {isAdmin && (
                      <TableHead className="text-right w-[80px]">Tindakan</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((a) => {
                    const cat = categoryColor(a.category);
                    return (
                      <TableRow
                        key={a.id}
                        onClick={() => setDetail(a)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <span className="inline-block font-mono text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-foreground border border-border/60 whitespace-nowrap">
                            {a.actNumber}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[380px]">
                          <div className="font-medium text-sm leading-snug line-clamp-1">
                            {a.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {a.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                            style={{
                              background: `${cat}15`,
                              color: cat,
                              borderColor: `${cat}40`,
                            }}
                          >
                            {a.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground font-mono">
                            {a.version}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateShort(a.lastUpdated)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={a.status}
                            variant={STATUS_VARIANT[a.status]}
                          />
                        </TableCell>
                        {isAdmin && (
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(a)}>
                                  <Pencil className="w-3.5 h-3.5 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setToDelete(a)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Padam
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scroll-pretty">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl leading-tight pr-8">
                  {detail.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Butiran akta
                </DialogDescription>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-foreground border border-border/60">
                    {detail.actNumber}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                    style={{
                      background: `${categoryColor(detail.category)}15`,
                      color: categoryColor(detail.category),
                      borderColor: `${categoryColor(detail.category)}40`,
                    }}
                  >
                    {detail.category}
                  </span>
                  <StatusBadge
                    status={detail.status}
                    variant={STATUS_VARIANT[detail.status]}
                  />
                  <span className="text-xs text-muted-foreground ml-auto">
                    Versi {detail.version}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {detail.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border/40 bg-background/60 p-3">
                    <p className="text-muted-foreground">Tarikh Dikemaskini</p>
                    <p className="font-medium mt-0.5">
                      {formatDateShort(detail.lastUpdated)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/60 p-3">
                    <p className="text-muted-foreground">Versi</p>
                    <p className="font-medium mt-0.5 font-mono">
                      {detail.version}
                    </p>
                  </div>
                </div>

                {detail.fileName && (
                  <div className="rounded-lg border border-border/40 bg-background/60 p-3 flex items-center gap-3">
                    <FileIcon type="PDF" size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {detail.fileName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        PDF · {detail.fileSize ?? "—"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        preview({
                          fileName: detail.fileName,
                          fileType: "PDF",
                          fileSize: detail.fileSize,
                          title: detail.title,
                        })
                      }
                    >
                      Lihat Dokumen
                    </Button>
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

      {/* Admin form dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto scroll-pretty">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Akta" : "Tambah Akta Baharu"}
            </DialogTitle>
            <DialogDescription>
              Isi medan bertanda wajib. Status mengawal paparan dalam dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="act-number">Nombor Akta *</Label>
                <Input
                  id="act-number"
                  value={form.actNumber}
                  onChange={(e) =>
                    setForm({ ...form, actNumber: e.target.value })
                  }
                  placeholder="Contoh: Akta 428"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="act-version">Versi</Label>
                <Input
                  id="act-version"
                  value={form.version}
                  onChange={(e) =>
                    setForm({ ...form, version: e.target.value })
                  }
                  placeholder="Contoh: Edisi 2026 / 1.0"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="act-title">Tajuk *</Label>
              <Input
                id="act-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Tajuk akta"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as Act["status"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="act-desc">Penerangan</Label>
              <Textarea
                id="act-desc"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Ringkasan kandungan akta..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="act-filename">Nama Fail (Pilihan)</Label>
                <Input
                  id="act-filename"
                  value={form.fileName}
                  onChange={(e) =>
                    setForm({ ...form, fileName: e.target.value })
                  }
                  placeholder="Contoh: Akta_428_1969.pdf"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="act-filesize">Saiz Fail (Pilihan)</Label>
                <Input
                  id="act-filesize"
                  value={form.fileSize}
                  onChange={(e) =>
                    setForm({ ...form, fileSize: e.target.value })
                  }
                  placeholder="Contoh: 4.8 MB"
                />
              </div>
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
            <AlertDialogTitle>Padam akta ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak boleh diundur. Akta{" "}
              <span className="font-medium text-foreground">
                {toDelete?.actNumber} — {toDelete?.title}
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
