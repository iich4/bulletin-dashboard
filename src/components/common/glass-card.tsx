"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function GlassCard({
  children,
  className,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 transition-all duration-300",
        hover && "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatPill({
  label,
  value,
  color,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
  trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-5 relative overflow-hidden group"
    >
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-15 blur-2xl transition-all group-hover:opacity-30"
        style={{ background: color }}
      />
      <div className="relative flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
          style={{ background: color }}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
            {trend}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </motion.div>
  );
}

export function StatusBadge({
  status,
  variant = "neutral",
}: {
  status: string;
  variant?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const variantClass: Record<string, string> = {
    neutral:
      "bg-muted text-muted-foreground border-border",
    success:
      "bg-green-100 text-green-700 border-green-300 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30",
    warning:
      "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
    danger:
      "bg-red-100 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
    info: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border",
        variantClass[variant]
      )}
    >
      {status}
    </span>
  );
}

export function MandatoryBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-red-500 text-white shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      WAJIB DIBACA
    </span>
  );
}

export function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#8DC63E] text-white shadow-sm">
      BAHARU
    </span>
  );
}

export function PinnedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#007DC5]/15 text-[#007DC5] dark:text-[#5fc8ef] dark:bg-[#1a9fe6]/20 border border-[#007DC5]/30">
      Disemat
    </span>
  );
}

export function UrgentBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-red-500 text-white shadow-sm animate-pulse-soft">
      SEGERA
    </span>
  );
}
