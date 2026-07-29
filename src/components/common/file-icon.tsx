"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, FileType, FileSpreadsheet, File as FileIc } from "lucide-react";

interface FileIconProps {
  type: string; // PDF | DOCX | XLSX | PPTX | IMG
  className?: string;
  size?: number;
}

export function FileIcon({ type, className, size = 24 }: FileIconProps) {
  const upper = type.toUpperCase();
  if (upper === "PDF")
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
          className
        )}
        style={{ width: size, height: size }}
        title="PDF"
      >
        <FileText size={size * 0.6} />
      </div>
    );
  if (upper === "DOCX" || upper === "DOC")
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
          className
        )}
        style={{ width: size, height: size }}
        title="DOCX"
      >
        <FileType size={size * 0.6} />
      </div>
    );
  if (upper === "XLSX" || upper === "XLS")
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
          className
        )}
        style={{ width: size, height: size }}
        title="XLSX"
      >
        <FileSpreadsheet size={size * 0.6} />
      </div>
    );
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-muted text-muted-foreground",
        className
      )}
      style={{ width: size, height: size }}
      title={type}
    >
      <FileIc size={size * 0.6} />
    </div>
  );
}
