"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Tag,
} from "lucide-react";
import { fetchApi, categoryColor } from "@/lib/api";
import type { Faq } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { GlassCard } from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
import { cn } from "@/lib/utils";

const CATEGORIES = ["Caruman", "Pampasan", "Permohonan", "Sistem", "Lain-lain"];
const CATEGORIES_ALL = ["All", ...CATEGORIES];

interface FaqForm {
  question: string;
  answer: string;
  category: string;
  tags: string;
}

function emptyForm(): FaqForm {
  return {
    question: "",
    answer: "",
    category: "Caruman",
    tags: "",
  };
}

export function FaqPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "Admin";

  const [allItems, setAllItems] = React.useState<Faq[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Faq | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<FaqForm>(emptyForm());

  const [toDelete, setToDelete] = React.useState<Faq | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<{ items: Faq[] }>(`/api/faq`);
      setAllItems(data.items);
    } catch (e) {
      toast.error("Gagal memuatkan FAQ", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Client-side filter by category + search
  const filtered = React.useMemo(() => {
    let list = allItems;
    if (category !== "All") list = list.filter((f) => f.category === category);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          (f.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allItems, category, search]);

  const counts = React.useMemo(() => {
    const map: Record<string, number> = { All: allItems.length };
    for (const c of CATEGORIES) {
      map[c] = allItems.filter((f) => f.category === c).length;
    }
    return map;
  }, [allItems]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(f: Faq) {
    setEditing(f);
    setForm({
      question: f.question,
      answer: f.answer,
      category: CATEGORIES.includes(f.category) ? f.category : "Lain-lain",
      tags: (f.tags || []).join(", "),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.question.trim()) {
      toast.error("Soalan diperlukan.");
      return;
    }
    if (!form.answer.trim()) {
      toast.error("Jawapan diperlukan.");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category,
        tags,
      };
      if (editing) {
        await fetchApi(`/api/faq?id=${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("FAQ dikemaskini.");
      } else {
        await fetchApi("/api/faq", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("FAQ ditambah.");
      }
      setDialogOpen(false);
      loadItems();
    } catch (e) {
      toast.error("Gagal menyimpan FAQ", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    if (!toDelete) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/faq?id=${toDelete.id}`, { method: "DELETE" });
      toast.success("FAQ dipadam.");
      setToDelete(null);
      loadItems();
    } catch (e) {
      toast.error("Gagal memadam FAQ", { description: (e as Error).message });
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
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#F9BF10]/15 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F9BF10] to-[#a07a0a] flex items-center justify-center text-white shadow-md flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Soalan Lazim (FAQ)
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Jawapan kepada soalan lazim kakitangan PERKESO — dikategorikan
                mengikut topik: Caruman, Pampasan, Permohonan, Sistem dan
                Lain-lain.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Tambah FAQ
            </Button>
          )}
        </div>
      </motion.div>

      {/* Layout: sidebar + content */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="glass rounded-2xl p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari soalan..."
                className="pl-9 h-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Kosongkan carian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setCategory("All")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                  category === "All"
                    ? "nav-active font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Semua
                </span>
                <span className="text-xs text-muted-foreground">
                  {counts.All ?? 0}
                </span>
              </button>
              {CATEGORIES.map((c) => {
                const color = categoryColor(c);
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                      active
                        ? "nav-active font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: color }}
                      />
                      {c}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {counts[c] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl h-16 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="text-center py-12">
              <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">Tiada rekod ditemui</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cuba ubah kategori atau kata kunci carian.
              </p>
            </GlassCard>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Accordion type="single" collapsible className="space-y-3">
                {filtered.map((f) => {
                  const color = categoryColor(f.category);
                  return (
                    <AccordionItem
                      key={f.id}
                      value={f.id}
                      className="glass rounded-2xl px-5 border-b-0 overflow-hidden"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-start gap-3 w-full pr-4 text-left">
                          <span
                            className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold shrink-0"
                            style={{ background: `${color}20`, color }}
                          >
                            ?
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-2">
                              {f.question}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                                style={{ background: `${color}20`, color }}
                              >
                                {f.category}
                              </span>
                              {f.tags && f.tags.length > 0 && (
                                <span className="text-[10px] text-muted-foreground">
                                  {f.tags.length} tag
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-9">
                          {f.answer}
                        </p>
                        {f.tags && f.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pl-9">
                            {f.tags.map((t, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/40"
                              >
                                <Tag className="w-2.5 h-2.5" />
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        {isAdmin && (
                          <div className="flex gap-2 pl-9 pt-2 border-t border-border/40 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => openEdit(f)}
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive hover:text-destructive"
                              onClick={() => setToDelete(f)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Padam
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </motion.div>
          )}
        </div>
      </div>

      {/* Admin CRUD Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scroll-pretty">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit FAQ" : "Tambah FAQ Baharu"}
            </DialogTitle>
            <DialogDescription>
              Isikan soalan dan jawapan. Tanda (*) menunjukkan medan wajib.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Soalan *</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Contoh: Bagaimana cara membuat tuntutan pampasan?"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Jawapan *</Label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Jawapan kepada soalan..."
                rows={4}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
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
              <div className="space-y-1.5">
                <Label>Tag (dipisahkan dengan koma)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="tuntutan, pampasan, kakitangan"
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
            <AlertDialogTitle>Padam FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak boleh dibatalkan. Soalan
              &quot;{toDelete?.question}&quot; akan dipadam secara kekal.
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
