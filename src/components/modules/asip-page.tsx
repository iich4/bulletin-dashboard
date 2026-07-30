"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ShieldCheck,
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
  Inbox,
  MoreVertical,
  Calendar,
  FileText,
  Hash,
} from "lucide-react";

import { fetchApi, formatDateShort, categoryColor } from "@/lib/api";
import type { Asip } from "@/lib/types";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---- Constants ----------------------------------------------------------
const ASIP_CATEGORIES = [
  "Umum",
  "Pampasan",
  "Pencen",
  "Manfaat Kematian",
  "Perubatan",
  "Pemulihan",
  "Bayaran Ganti",
] as const;

const ASIP_STATUSES: Asip["status"][] = ["Aktif", "Digantikan", "Dalam Semakan"];

const STATUS_VARIANT: Record<
  Asip["status"],
  "success" | "danger" | "info" | "warning" | "neutral"
> = {
  Aktif: "success",
  Digantikan: "danger",
  "Dalam Semakan": "info",
};

interface AsipFormState {
  id?: string;
  title: string;
  referenceNo: string;
  description: string;
  effectiveDate: string; // yyyy-mm-dd
  category: string;
  status: Asip["status"];
  fileName: string;
  fileSize: string;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM: AsipFormState = {
  title: "",
  referenceNo: "",
  description: "",
  effectiveDate: todayStr(),
  category: "Umum",
  status: "Aktif",
  fileName: "",
  fileSize: "",
};

// ========================================================================
export function AsipPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "Admin";
  const { preview } = useDocPreview();

  const [items, setItems] = React.useState<Asip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState<string>("all");
  const [category, setCategory] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [detail, setDetail] = React.useState<Asip | null>(null);

  const [formOpen, setFormOpen] = React.useState(false);
  const [form, setForm] = React.useState<AsipFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  const [toDelete, setToDelete] = React.useState<Asip | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Note: API supports `status` and `search`; category is filtered client-side
  // because the asip GET endpoint doesn't expose a category filter param.
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const qs = params.toString();
      const res = await fetchApi<{ items: Asip[] }>(
        `/api/asip${qs ? `?${qs}` : ""}`
      );
      // Client-side category filter
      const filtered =
        category && category !== "all"
          ? (res.items ?? []).filter((x) => x.category === category)
          : (res.items ?? []);
      setItems(filtered);
    } catch (e) {
      toast.error("Gagal memuatkan rekod ASIP", {
        description: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [status, category, debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, effectiveDate: todayStr() });
    setFormOpen(true);
  };
  const openEdit = (a: Asip) => {
    setForm({
      id: a.id,
      title: a.title,
      referenceNo: a.referenceNo,
      description: a.description,
      effectiveDate:
        a.effectiveDate && !isNaN(new Date(a.effectiveDate).getTime())
          ? new Date(a.effectiveDate).toISOString().slice(0, 10)
          : todayStr(),
      category: a.category,
      status: a.status,
      fileName: a.fileName ?? "",
      fileSize: a.fileSize ?? "",
    });
    setFormOpen(true);
  };

  const submitForm = async () => {
    if (!form.title.trim()) return toast.error("Tajuk diperlukan.");
    if (!form.referenceNo.trim()) return toast.error("Nombor rujukan diperlukan.");
    if (!form.category) return toast.error("Kategori diperlukan.");

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        referenceNo: form.referenceNo.trim(),
        description: form.description.trim(),
        effectiveDate: form.effectiveDate
          ? new Date(form.effectiveDate).toISOString()
          : new Date().toISOString(),
        category: form.category,
        status: form.status,
        fileName: form.fileName.trim() || null,
        fileSize: form.fileSize.trim() || null,
      };
      if (form.id) {
        await fetchApi(`/api/asip?id=${form.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Rekod ASIP dikemas kini.");
      } else {
        await fetchApi("/api/asip", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Rekod ASIP baharu ditambah.");
      }
      setFormOpen(false);
      await load();
    } catch (e) {
      toast.error("Gagal menyimpan rekod ASIP", {
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
      await fetchApi(`/api/asip?id=${toDelete.id}`, { method: "DELETE" });
      toast.success("Rekod ASIP dipadam.");
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
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-[#597E26]/15 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-[#007DC5]/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#597E26] to-[#8DC63E] flex items-center justify-center text-white shadow-lg shadow-[#597E26]/30 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Akta Sistem Insurans Pekerjaan{" "}
                <span className="text-brand-gradient">(ASIP)</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Skim insurans pekerjaan PERKESO: pampasan, pencen, manfaat
                kematian, perubatan, pemulihan &amp; bayaran ganti.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah ASIP
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
            <Label className="text-[11px] text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {ASIP_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {ASIP_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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
                placeholder="Tajuk / nombor rujukan..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">
            Tiada rekod ditemui
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Cuba ubah kata kunci carian atau tapisan.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((a, i) => {
            const cat = categoryColor(a.category);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.4) }}
              >
                <GlassCard hover className="flex flex-col h-full relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: cat }}
                  />
                  <div
                    className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-10 blur-2xl pointer-events-none"
                    style={{ background: cat }}
                  />

                  <div className="relative flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-1 rounded-md bg-muted text-foreground border border-border/60 whitespace-nowrap">
                          <Hash className="w-3 h-3" />
                          {a.referenceNo}
                        </span>
                      </div>
                      <StatusBadge
                        status={a.status}
                        variant={STATUS_VARIANT[a.status]}
                      />
                    </div>

                    <h3 className="text-base font-semibold leading-snug">
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 flex-1">
                      {a.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                          background: `${cat}15`,
                          color: cat,
                          borderColor: `${cat}40`,
                        }}
                      >
                        {a.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Berkuat kuasa {formatDateShort(a.effectiveDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDetail(a)}
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          Lihat Dokumen
                        </Button>
                      </div>
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
                <DialogTitle className="text-xl leading-tight pr-8">
                  {detail.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Butiran rekod ASIP
                </DialogDescription>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-foreground border border-border/60">
                    <Hash className="w-3 h-3" />
                    {detail.referenceNo}
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
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {detail.description}
                  </p>
                </div>

                <div className="rounded-lg border border-border/40 bg-background/60 p-3 flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Berkuat kuasa:</span>
                  <span className="font-medium">
                    {formatDateShort(detail.effectiveDate)}
                  </span>
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
                <Button
                  variant="default"
                  onClick={() =>
                    preview({
                      fileName: detail.fileName ?? `${detail.referenceNo}.pdf`,
                      fileType: "PDF",
                      fileSize: detail.fileSize,
                      title: detail.title,
                    })
                  }
                >
                  Lihat Dokumen
                </Button>
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
              {form.id ? "Edit Rekod ASIP" : "Tambah Rekod ASIP Baharu"}
            </DialogTitle>
            <DialogDescription>
              Isi medan bertanda wajib. Tarikh berkuat kuasa &amp; status akan
              dipaparkan dalam senarai.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="grid gap-2">
              <Label htmlFor="asip-title">Tajuk *</Label>
              <Input
                id="asip-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Skim Insurans Pekerjaan — Faedah Hari Tidak Bekerja"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="asip-ref">Nombor Rujukan *</Label>
                <Input
                  id="asip-ref"
                  value={form.referenceNo}
                  onChange={(e) =>
                    setForm({ ...form, referenceNo: e.target.value })
                  }
                  placeholder="Contoh: ASIP/HTB/006/2026"
                  className="font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asip-date">Tarikh Berkuat Kuasa</Label>
                <Input
                  id="asip-date"
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) =>
                    setForm({ ...form, effectiveDate: e.target.value })
                  }
                />
              </div>
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
                    {ASIP_CATEGORIES.map((c) => (
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
                    setForm({ ...form, status: v as Asip["status"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASIP_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asip-desc">Penerangan</Label>
              <Textarea
                id="asip-desc"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Penerangan skim / manfaat..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="asip-filename">Nama Fail (Pilihan)</Label>
                <Input
                  id="asip-filename"
                  value={form.fileName}
                  onChange={(e) =>
                    setForm({ ...form, fileName: e.target.value })
                  }
                  placeholder="Contoh: ASIP_HTB.pdf"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asip-filesize">Saiz Fail (Pilihan)</Label>
                <Input
                  id="asip-filesize"
                  value={form.fileSize}
                  onChange={(e) =>
                    setForm({ ...form, fileSize: e.target.value })
                  }
                  placeholder="Contoh: 950 KB"
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
            <AlertDialogTitle>Padam rekod ASIP ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak boleh diundur. Rekod{" "}
              <span className="font-medium text-foreground">
                {toDelete?.referenceNo} — {toDelete?.title}
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
