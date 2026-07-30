"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon } from "@/components/common/file-icon";
import { Download, Lock, FileWarning, ShieldCheck } from "lucide-react";

interface PreviewState {
  open: boolean;
  fileName?: string | null;
  fileType?: string;
  fileSize?: string | null;
  title?: string;
}

interface PreviewContextValue {
  preview: (opts: {
    fileName?: string | null;
    fileType?: string;
    fileSize?: string | null;
    title?: string;
  }) => void;
  close: () => void;
}

const DocPreviewContext = React.createContext<PreviewContextValue | null>(null);

export function useDocPreview() {
  const ctx = React.useContext(DocPreviewContext);
  if (!ctx) throw new Error("useDocPreview must be used within DocPreviewProvider");
  return ctx;
}

export function DocPreviewProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<PreviewState>({ open: false });

  const preview = React.useCallback((opts: PreviewState) => {
    setState({ open: true, ...opts });
  }, []);
  const close = React.useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <DocPreviewContext.Provider value={{ preview, close }}>
      {children}
      <Dialog open={state.open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileIcon type={state.fileType || "FILE"} size={28} />
              <span className="truncate">{state.title || state.fileName || "Dokumen"}</span>
            </DialogTitle>
            <DialogDescription className="sr-only">Pratonton dokumen</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 flex flex-col items-center justify-center text-center">
              <div className="absolute inset-0 rounded-xl bg-[linear-gradient(45deg,transparent_25%,rgba(0,125,197,.04)_50%,transparent_75%)] bg-[length:16px_16px]" />
              <FileWarning className="w-12 h-12 text-amber-500 mb-3" />
              <p className="text-sm font-semibold text-foreground">
                Pratonton Dokumen Tidak Tersedia dalam Prototaip
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Fail sebenar (PDF/DOCX) tidak dimuat naik dalam fasa prototaip.
                Sila tunggu integrasi pangkalan data sebenar untuk capaian
                penuh dokumen rasmi.
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Nama Fail</span>
                <span className="font-mono font-medium truncate max-w-[60%] text-right">
                  {state.fileName || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Jenis</span>
                <span className="font-medium">{state.fileType || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Saiz</span>
                <span className="font-medium">{state.fileSize || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                  <Lock size={11} /> Dikunci (Prototaip)
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Tutup
            </Button>
            <Button disabled className="gap-2">
              <Download size={15} /> Muat Turun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DocPreviewContext.Provider>
  );
}

export { ShieldCheck };
