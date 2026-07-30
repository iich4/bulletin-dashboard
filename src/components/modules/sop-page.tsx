"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
  Calendar,
  User,
} from "lucide-react";
import { fetchApi, formatDateShort, categoryColor } from "@/lib/api";
import type { Sop } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useDocPreview } from "@/components/common/doc-preview";
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

const DEPARTMENTS = ["Pampasan", "Perubatan", "Kewangan", "ICT", "HR", "Operasi"];
const DEPT_ALL = ["All", ...DEPARTMENTS];
const STATUSES = ["Aktif", "Dalam Semakan", "Digantungan", "Digantikan"];

interface SopForm {
  title: string;
  department: string;
  description: string;
  version: string;
  approvedBy: string;
  dateApproved: string;
  status: string;
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

function emptyForm(): SopForm {
  return {
    title: "",
    department: "Pampasan",
    description: "",
    version: "1.0",
    approvedBy: "",
    dateApproved: toDateInput(new Date().toISOString()),
    status: "Aktif",
    fileName: "",
    fileSize: "",
  };
}

function StepEditor({
  steps,
  setSteps,
}: {
  steps: string[];
  setSteps: (s: string[]) => void;
}) {
  const update = (i: number, v: string) => {
    const next = [...steps];
    next[i] = v;
    setSteps(next);
  };
  const add = () => setSteps([...steps, ""]);
  const remove = (i: number) => {
    if (steps.length === 1) {
      setSteps([""]);
      return;
    }
    setSteps(steps.filter((_, idx) => idx !== i));
  };
  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...steps];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setSteps(next);
  };
  const moveDown = (i: number) => {
    if (i === steps.length - 1) return;
    const next = [...steps];
    [next[i + 1], next[i]] = [next[i], next[i + 1]];
    setSteps(next);
  };

  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="mt-2 text-xs text-muted-foreground font-mono w-5 text-right shrink-0">
            {i + 1}.
          </span>
          <Textarea
            value={s}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Langkah ${i + 1}...`}
            className="flex-1 min-h-9 py-1.5"
          />
          <div className="flex flex-col gap-0.5 shrink-0">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              aria-label="Alih ke atas"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => moveDown(i)}
              disabled={i === steps.length - 1}
              aria-label="Alih ke bawah"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
            onClick={() => remove(i)}
            aria-label="Buang langkah"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Tambah Langkah
      </Button>
    </div>
  );
}

export function SopPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "Admin";
  const { preview } = useDocPreview();

  const [items, setItems] = React.useState<Sop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [department, setDepartment] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Sop | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<SopForm>(emptyForm());
  const [steps, setSteps] = React.useState<string[]>([""]);

  const [toDelete, setToDelete] = React.useState<Sop | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (department !== "All") params.set("department", department);
      if (search.trim()) params.set("search", search.trim());
      const data = await fetchApi<{ items: Sop[] }>(`/api/sop?${params.toString()}`);
      setItems(data.items);
    } catch (e) {
      toast.error("Gagal memuatkan SOP", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [department, search]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      loadItems();
    }, 200);
    return () => clearTimeout(t);
  }, [loadItems]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSteps([""]);
    setDialogOpen(true);
  }

  function openEdit(s: Sop) {
    setEditing(s);
    setForm({
      title: s.title,
      department: DEPARTMENTS.includes(s.department) ? s.department : "Pampasan",
      description: s.description,
      version: s.version,
      approvedBy: s.approvedBy,
      dateApproved: toDateInput(s.dateApproved),
      status: STATUSES.includes(s.status) ? s.status : "Aktif",
      fileName: s.fileName ?? "",
      fileSize: s.fileSize ?? "",
    });
    setSteps(s.procedureSteps && s.procedureSteps.length > 0 ? [...s.procedureSteps] : [""]);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Tajuk diperlukan.");
      return;
    }
    if (!form.approvedBy.trim()) {
      toast.error("Diluluskan oleh diperlukan.");
      return;
    }
    if (!form.dateApproved) {
      toast.error("Tarikh diluluskan diperlukan.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        department: form.department,
        description: form.description.trim(),
        version: form.version.trim() || "1.0",
        approvedBy: form.approvedBy.trim(),
        dateApproved: form.dateApproved,
        status: form.status,
        fileName: form.fileName.trim() || null,
        fileSize: form.fileSize.trim() || null,
        procedureSteps: steps.map((s) => s.trim()).filter(Boolean),
      };
      if (editing) {
        await fetchApi(`/api/sop?id=${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("SOP dikemaskini.");
      } else {
        await fetchApi("/api/sop", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("SOP ditambah.");
      }
      setDialogOpen(false);
      loadItems();
    } catch (e) {
      toast.error("Gagal menyimpan SOP", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    if (!toDelete) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/sop?id=${toDelete.id}`, { method: "DELETE" });
      toast.success("SOP dipadam.");
      setToDelete(null);
      loadItems();
    } catch (e) {
      toast.error("Gagal memadam SOP", { description: (e as Error).message });
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
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#8DC63E]/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8DC63E] to-[#597E26] flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Prosedur Operasi Standard (SOP)
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Rujukan prosedur standard jabatan PERKESO — langkah-langkah
                operasi yang diluluskan untuk semua kakitangan.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Tambah SOP
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter row */}
      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Jabatan" />
          </SelectTrigger>
          <SelectContent>
            {DEPT_ALL.map((d) => (
              <SelectItem key={d} value={d}>
                {d === "All" ? "Semua Jabatan" : d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tajuk atau diluluskan oleh..."
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
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="text-center py-12">
          <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
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
        >
          <Accordion type="single" collapsible className="space-y-3">
            {items.map((s) => {
              const color = categoryColor(s.department);
              return (
                <AccordionItem
                  key={s.id}
                  value={s.id}
                  className="glass rounded-2xl px-5 border-b-0 overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full pr-4">
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
                            style={{ background: `${color}20`, color }}
                          >
                            {s.department}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            v{s.version}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold line-clamp-1">
                          {s.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {s.approvedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDateShort(s.dateApproved)}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {s.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {s.description}
                      </p>
                    )}
                    {s.procedureSteps && s.procedureSteps.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Langkah Prosedur
                        </h4>
                        <ol className="list-decimal list-inside space-y-1.5 text-sm pl-2">
                          {s.procedureSteps.map((step, i) => (
                            <li key={i} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          preview({
                            fileName: s.fileName ?? `${s.title}.pdf`,
                            fileType: "PDF",
                            fileSize: s.fileSize ?? "—",
                            title: s.title,
                          })
                        }
                      >
                        <FileText className="w-3.5 h-3.5" /> Lihat Dokumen
                      </Button>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openEdit(s)}
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-destructive hover:text-destructive"
                            onClick={() => setToDelete(s)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Padam
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>
      )}

      {/* Admin CRUD Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scroll-pretty">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit SOP" : "Tambah SOP Baharu"}
            </DialogTitle>
            <DialogDescription>
              Isikan maklumat prosedur operasi standard. Tanda (*) menunjukkan
              medan wajib.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tajuk *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: SOP Pemprosesan Tuntutan Pampasan"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Jabatan *</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Versi</Label>
                <Input
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Penerangan</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Penerangan ringkas tentang SOP..."
                rows={3}
              />
            </div>

            <div>
              <Label className="mb-2 block">Langkah Prosedur</Label>
              <StepEditor steps={steps} setSteps={setSteps} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Diluluskan Oleh *</Label>
                <Input
                  value={form.approvedBy}
                  onChange={(e) => setForm({ ...form, approvedBy: e.target.value })}
                  placeholder="Nama / Jawatan"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tarikh Diluluskan *</Label>
                <Input
                  type="date"
                  value={form.dateApproved}
                  onChange={(e) => setForm({ ...form, dateApproved: e.target.value })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nama Fail</Label>
                <Input
                  value={form.fileName}
                  onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                  placeholder="sop-pampasan.pdf"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Saiz Fail</Label>
                <Input
                  value={form.fileSize}
                  onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                  placeholder="2.4 MB"
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
            <AlertDialogTitle>Padam SOP?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak boleh dibatalkan. SOP &quot;{toDelete?.title}&quot;
              akan dipadam secara kekal.
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
