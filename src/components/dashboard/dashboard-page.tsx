"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  Megaphone,
  Scale,
  ShieldCheck,
  ClipboardList,
  FileText,
  HelpCircle,
  ArrowUpRight,
  TrendingUp,
  Pin,
  Calendar,
  BookOpen,
  Lightbulb,
  Activity,
} from "lucide-react";
import { useNavStore } from "@/stores/nav-store";
import { fetchApi, formatDateShort, categoryColor } from "@/lib/api";
import type { DashboardStats, Announcement, Circular } from "@/lib/types";
import { StatPill, NewBadge, PinnedBadge, MandatoryBadge } from "@/components/common/glass-card";
import { useDocPreview } from "@/components/common/doc-preview";

const COLORS = ["#007DC5", "#8DC63E", "#F9BF10", "#F27130", "#ED1C24", "#00C5AB"];

export function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { setPage } = useNavStore();
  const { preview } = useDocPreview();

  React.useEffect(() => {
    fetchApi<DashboardStats>("/api/dashboard-stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl h-72 animate-pulse" />
          <div className="glass rounded-2xl h-72 animate-pulse" />
        </div>
      </div>
    );
  }

  const c = stats.counts;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#007DC5]/10 via-transparent to-[#8DC63E]/10" />
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#007DC5]/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full bg-[#FFBF10]/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-white/40 text-[10px] uppercase tracking-wider font-semibold text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8DC63E] animate-pulse" />
              Sistem Aktif
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("ms-MY", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Selamat Datang ke{" "}
            <span className="text-brand-gradient">PERKESO Bulletin</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            Portal Pengetahuan & Komunikasi Dalaman — capaian terpusat kepada
            pengumuman, Akta, ASIP, SOP, pekeliling, dan soalan lazim PERKESO.
          </p>
        </div>
      </motion.div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill
          label="Pengumuman Aktif"
          value={c.announcements}
          color="#007DC5"
          icon={<Megaphone size={18} />}
          trend="Aktif"
        />
        <StatPill
          label="Akta & Peraturan"
          value={c.acts}
          color="#00C5AB"
          icon={<Scale size={18} />}
          trend="Rujukan"
        />
        <StatPill
          label="SOP Baharu"
          value={c.sops}
          color="#8DC63E"
          icon={<ClipboardList size={18} />}
          trend="Prosedur"
        />
        <StatPill
          label="Pekeliling Wajib"
          value={c.mandatoryCirculars}
          color="#ED1C24"
          icon={<FileText size={18} />}
          trend="Wajib"
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "announcements", label: "Pengumuman", icon: Megaphone, color: "#007DC5", count: c.announcements },
          { key: "acts", label: "Akta", icon: Scale, color: "#00C5AB", count: c.acts },
          { key: "asip", label: "ASIP", icon: ShieldCheck, color: "#597E26", count: c.asips },
          { key: "sop", label: "SOP", icon: ClipboardList, color: "#8DC63E", count: c.sops },
          { key: "circulars", label: "Pekeliling", icon: FileText, color: "#F27130", count: c.circulars },
          { key: "faq", label: "FAQ", icon: HelpCircle, color: "#F9BF10", count: c.faqs },
        ].map((q) => (
          <button
            key={q.key}
            onClick={() => setPage(q.key as never)}
            className="glass rounded-xl p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white mb-2 shadow-sm"
              style={{ background: q.color }}
            >
              <q.icon className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-foreground">{q.label}</div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs text-muted-foreground">{q.count} entri</span>
              <ArrowUpRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bar — announcements by category */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#007DC5]" />
                Trend Pengumuman Bulanan
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                6 bulan terkini
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {stats.charts.monthlyAnnouncements.reduce((s, m) => s + m.count, 0)}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Jumlah
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.charts.monthlyAnnouncements}>
              <defs>
                <linearGradient id="annGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007DC5" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#007DC5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9AA0A6" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9AA0A6" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Pengumuman"
                stroke="#007DC5"
                strokeWidth={2.5}
                fill="url(#annGrad)"
                dot={{ r: 3, fill: "#007DC5", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie — SOP by department */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-[#8DC63E]" />
            SOP Mengikut Jabatan
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={stats.charts.sopsByDepartment}
                dataKey="value"
                nameKey="label"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
              >
                {stats.charts.sopsByDepartment.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10 }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row — recent announcements + circulars */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#007DC5]" />
              Pengumuman Terkini
            </h3>
            <button
              onClick={() => setPage("announcements")}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Lihat semua <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3 max-h-[26rem] overflow-y-auto scroll-pretty pr-1">
            {stats.recentAnnouncements.map((a: Announcement) => (
              <div
                key={a.id}
                className="group rounded-xl p-3 border border-border/40 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${a.coverColor}08, transparent)`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0"
                    style={{ background: a.coverColor }}
                  >
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold line-clamp-1">{a.title}</h4>
                      <div className="flex gap-1 flex-shrink-0">
                        {a.isPinned && <PinnedBadge />}
                        {a.isNew && <NewBadge />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {a.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span
                        className="px-1.5 py-0.5 rounded-md font-medium"
                        style={{
                          background: `${categoryColor(a.category)}20`,
                          color: categoryColor(a.category),
                        }}
                      >
                        {a.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDateShort(a.datePublished)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5" />
                        {a.authorName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Circulars */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F27130]" />
              Pekeliling Terkini
            </h3>
            <button
              onClick={() => setPage("circulars")}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Lihat semua <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 max-h-[26rem] overflow-y-auto scroll-pretty pr-1">
            {stats.recentCirculars.map((cir: Circular) => (
              <button
                key={cir.id}
                onClick={() =>
                  preview({
                    fileName: cir.fileName,
                    fileType: "PDF",
                    fileSize: cir.fileSize,
                    title: cir.title,
                  })
                }
                className="w-full text-left rounded-xl p-3 border border-border/40 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${
                      cir.isMandatory
                        ? "bg-[#ED1C24] text-white"
                        : "bg-[#F27130]/15 text-[#F27130]"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <span className="text-xs font-mono text-muted-foreground truncate">
                        {cir.circularNo}
                      </span>
                      {cir.isMandatory && <MandatoryBadge />}
                    </div>
                    <h4 className="text-sm font-semibold line-clamp-2">{cir.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                        {cir.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDateShort(cir.dateIssued)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insight row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#00C5AB]" />
          Analitik Kandungan
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
            <div className="flex items-center justify-between">
              <Lightbulb className="w-4 h-4 text-[#F9BF10]" />
              <span className="text-[10px] text-muted-foreground">FAQ</span>
            </div>
            <div className="text-2xl font-bold mt-1">{c.faqs}</div>
            <div className="text-[10px] text-muted-foreground">Soalan Lazim</div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-4 h-4 text-[#597E26]" />
              <span className="text-[10px] text-muted-foreground">ASIP</span>
            </div>
            <div className="text-2xl font-bold mt-1">{c.asips}</div>
            <div className="text-[10px] text-muted-foreground">Insurans Pekerjaan</div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
            <div className="flex items-center justify-between">
              <FileText className="w-4 h-4 text-[#F27130]" />
              <span className="text-[10px] text-muted-foreground">Pekeliling</span>
            </div>
            <div className="text-2xl font-bold mt-1">{c.circulars}</div>
            <div className="text-[10px] text-muted-foreground">Jumlah Pekeliling</div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
            <div className="flex items-center justify-between">
              <Megaphone className="w-4 h-4 text-[#007DC5]" />
              <span className="text-[10px] text-muted-foreground">Pengumuman</span>
            </div>
            <div className="text-2xl font-bold mt-1">{c.announcements}</div>
            <div className="text-[10px] text-muted-foreground">Aktif</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
