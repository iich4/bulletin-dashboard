"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import { fetchApi, formatDateShort, categoryColor } from "@/lib/api";
import type { Circular } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useDocPreview } from "@/components/common/doc-preview";
import { GlassCard, MandatoryBadge } from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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

const CATEGORIES = ["Korporat", "HR", "Operasi", "Kewangan", "ICT"];
const CATEGORIES_ALL = ["All", ...CATEGORIES];

interface CircularForm {
  circularNo: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  isMandatory: boolean;
  dateIssued: string;
  fileName: string;
  fileSize: string;
}

function toDateInput(d?: string | null): string {
  if (!d) return "";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function emptyForm(): CircularForm {
  return {
    circularNo: "",
    title: "",
    category: "Korporat",
    summary: "",
    content: "",
    isMandatory: false,
    dateIssued: toDateInput(new Date().toISOString()),
    fileName: "",
    fileSize: "",
  };
}

export function CircularsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "Admin";
  const { preview } = useDocPreview();

  const [items, setItems] = React.useState<Circular[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState("All");
  const [mandatoryOnly, setMandatoryOnly] = React.useState(false);
  const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
  const [search, setSearch] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Circular | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<CircularForm>(emptyForm());

  const [toDelete, setToDelete] = React.useState<Circular | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (mandatoryOnly) params.set("mandatory", "true");
      if (sort) params.set("sort", sort);
      if (search.trim()) params.set("search", search.trim());
      const data = await fetchApi<{ items: Circular[] }>(
        `/api/circulars?${params.toString()}`
      );
      setItems(data.items);
    } catch (e) {
      toast.error("Gagal memuatkan pekeliling", {
        description: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [category, mandatoryOnly, sort, search]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      loadItems();
    }, 200);
    return () => clearTimeout(t);
  }, [loadItems]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(c: Circular) {
    setEditing(c);
    setForm({
      circularNo: c.circularNo,
      title: c.title,
      category: CATEGORIES.includes(c.category) ? c.category : "Korporat",
      summary: c.summary,
      content: c.content,
      isMandatory: c.isMandatory,
      dateIssued: toDateInput(c.dateIssued),
      fileName: c.fileName ?? "",
      fileSize: c.fileSize ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.circularNo.trim()) {
      toast.error("Nombor pekeliling diperlukan.");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Tajuk diperlukan.");
      return;
    }
    if (!form.dateIssued) {
      toast.error("Tarikh dikeluarkan diperlukan.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        circularNo: form.circularNo.trim(),
        title: form.title.trim(),
        category: form.category,
        summary: form.summary.trim(),
        content: form.content.trim(),
        isMandatory: form.isMandatory,
        dateIssued: form.dateIssued,
        fileName: form.fileName.trim() || null,
        fileSize: form.fileSize.trim() || null,
      };
      if (editing) {
        await fetchApi(`/api/circulars?id=${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Pekeliling dikemaskini.");
      } else {
        await fetchApi("/api/circulars", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Pekeliling ditambah.");
      }
      setDialogOpen(false);
      loadItems();
    } catch (e) {
      toast.error("Gagal menyimpan pekeliling", {
        description: (e as Error).message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    if (!toDelete) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/circulars?id=${toDelete.id}`, { method: "DELETE" });
      toast.success("Pekeliling dipadam.");
      setToDelete(null);
      loadItems();
    } catch (e) {
      toast.error("Gagal memadam pekeliling", {
        description: (e as Error).message,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#F27130]/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F27130] to-[#a84200] flex items-center justify-center text-white shadow-md flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Pekeliling Rasmi
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Pekeliling rasmi PERKESO — korporat, HR, operasi, kewangan dan
                ICT. Pekeliling wajib ditandakan dengan badge merah.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Tambah Pekeliling
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter row */}
      <div className="glass rounded-2xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES_ALL.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All" ? "Semua Kategori" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(v) => setSort(v as "newest" | "oldest")}
        >
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Susun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background/40 w-fit">
          <Switch
            checked={mandatoryOnly}
            onCheckedChange={setMandatoryOnly}
            id="mandatory-only"
          />
          <Label htmlFor="mandatory-only" className="text-sm cursor-pointer">
            Wajib sahaja
          </Label>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nombor / tajuk / ringkasan..."
            className="pl-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Kosongkan carian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="text-center py-12">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">Tiada rekod ditemui</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cuba ubah penapis atau kata kunci carian.
          </p>
        </GlassCard>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {items.map((c, idx) => {
            const color = categoryColor(c.category);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
              >
                <GlassCard hover className="h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 break-all">
                      {c.circularNo}
                    </span>
                    {c.isMandatory && <MandatoryBadge />}
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-2 mb-1.5">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                    {c.summary || c.content}
                  </p>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{ background: `${color}20`, color }}
                    >
                      {c.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDateShort(c.dateIssued)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        preview({
                          fileName: c.fileName ?? `${c.circularNo}.pdf`,
                          fileType: "PDF",
                          fileSize: c.fileSize ?? "—",
                          title: c.title,
                        })
                      }
                    >
                      <FileText className="w-3.5 h-3.5" /> Lihat Dokumen
                    </Button>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(c)}
                          aria-label="Edit pekeliling"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setToDelete(c)}
                          aria-label="Padam pekeliling"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Admin CRUD Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scroll-pretty">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Pekeliling" : "Tambah Pekeliling Baharu"}
            </DialogTitle>
            <DialogDescription>
              Isikan maklumat pekeliling rasmi. Tanda (*) menunjukkan medan wajib.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nombor Pekeliling *</Label>
                <Input
                  value={form.circularNo}
                  onChange={(e) => setForm({ ...form, circularNo: e.target.value })}
                  placeholder="PK/2024/01"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tajuk *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Tajuk pekeliling"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ringkasan</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Ringkasan pekeliling (1-2 ayat)..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Kandungan</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Kandungan penuh pekeliling..."
                rows={4}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tarikh Dikeluarkan *</Label>
                <Input
                  type="date"
                  value={form.dateIssued}
                  onChange={(e) => setForm({ ...form, dateIssued: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pekeliling Wajib</Label>
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-background/40">
                  <Switch
                    checked={form.isMandatory}
                    onCheckedChange={(v) => setForm({ ...form, isMandatory: v })}
                    id="form-mandatory"
                  />
                  <Label htmlFor="form-mandatory" className="text-sm cursor-pointer">
                    {form.isMandatory ? "Ya, wajib dibaca" : "Tidak wajib"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nama Fail</Label>
                <Input
                  value={form.fileName}
                  onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                  placeholder="pekeliling-2024-01.pdf"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Saiz Fail</Label>
                <Input
                  value={form.fileSize}
                  onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                  placeholder="1.2 MB"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>Batal</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Pekeliling?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak boleh dibatalkan. Pekeliling
              &quot;{toDelete?.title}&quot; akan dipadam secara kekal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
