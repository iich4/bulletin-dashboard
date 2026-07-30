"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  Users,
  Info,
} from "lucide-react";

const QUICK_LOGINS = [
  {
    role: "Admin",
    email: "admin@perkeso.gov.my",
    password: "admin123",
    desc: "Pentadbir Sistem",
    color: "#007DC5",
  },
  {
    role: "Staff",
    email: "staff@perkeso.gov.my",
    password: "staff123",
    desc: "Pengguna Am",
    color: "#8DC63E",
  },
];

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = React.useState("admin@perkeso.gov.my");
  const [password, setPassword] = React.useState("admin123");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Log masuk gagal");
      login(data.user, data.token);
      toast.success(`Selamat datang, ${data.user.name.split(" ")[0]}!`, {
        description: `Anda log masuk sebagai ${data.user.role}.`,
      });
    } catch (e2) {
      setErr((e2 as Error).message);
      toast.error("Log masuk gagal", { description: (e2 as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const quick = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 0% 100%, rgba(0,33,71,0.85), transparent 70%)," +
          "radial-gradient(800px 400px at 100% 0%, rgba(255,191,0,0.20), transparent 65%)," +
          "linear-gradient(135deg, #002147 0%, #001a3d 50%, #002147 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#FFBF00]/10 blur-3xl animate-float-soft pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-[36rem] h-[36rem] rounded-full bg-[#007DC5]/20 blur-3xl pointer-events-none" />
      <div
        className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-[#8DC63E]/10 blur-3xl animate-float-soft pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header brand */}
      <header className="relative z-10 px-6 py-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007DC5] to-[#004E7A] flex items-center justify-center shadow-lg shadow-[#007DC5]/40 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold tracking-tight text-base sm:text-lg">
              PERKESO
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 tracking-widest uppercase">
              Bulletin Dashboard
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
          <Sparkles className="w-3.5 h-3.5 text-[#FFBF00]" />
          <span>Powered by IDEONIX Sdn Bhd</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Hero */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block space-y-6"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-white border border-white/20"
              style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8DC63E] animate-pulse" />
              Portal Pengetahuan & Komunikasi Dalaman
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight text-white">
              Satu Portal,
              <br />
              <span className="bg-gradient-to-r from-[#FFBF00] to-[#8DC63E] bg-clip-text text-transparent">
                Semua Maklumat.
              </span>
            </h1>
            <p className="text-white/70 text-base max-w-md">
              Capaian terpusat kepada pengumuman, Akta, ASIP, SOP, pekeliling,
              dan soalan lazim PERKESO — di hujung jari kakitangan seluruh negara.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { icon: Building2, label: "Cawangan", value: "60+" },
                { icon: Users, label: "Kakitangan", value: "8.5K" },
                { icon: ShieldCheck, label: "Dokumen", value: "500+" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center border"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <s.icon className="w-5 h-5 mx-auto mb-1 text-[#FFBF00]" />
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-[10px] text-white/70 uppercase tracking-wide">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Login card — fixed dark glass, theme-independent */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              className="rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 border"
              style={{
                background: "rgba(15, 28, 42, 0.55)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                borderColor: "rgba(255,255,255,0.15)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            >
              {/* Header */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFBF00] to-[#F27130] flex items-center justify-center shadow-lg">
                    <KeyRound className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Log Masuk Sistem
                    </h2>
                    <p className="text-xs text-white/70">
                      PERKESO Bulletin Dashboard
                    </p>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  Masukkan e-mel dan kata laluan akaun PERKESO anda untuk
                  mula menggunakan portal dalaman.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-white/85 text-xs font-medium"
                  >
                    E-mel / ID Pengguna
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anda@perkeso.gov.my"
                      className="pl-10 text-white placeholder:text-white/45 border-white/20 focus-visible:border-[#FFBF00]/60 focus-visible:ring-[#FFBF00]/20"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-white/85 text-xs font-medium"
                  >
                    Kata Laluan
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 text-white placeholder:text-white/45 border-white/20 focus-visible:border-[#FFBF00]/60 focus-visible:ring-[#FFBF00]/20"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                      aria-label={show ? "Sembunyi kata laluan" : "Tunjuk kata laluan"}
                    >
                      {show ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {err && (
                  <div className="text-xs text-red-200 bg-red-500/20 border border-red-400/40 rounded-lg px-3 py-2">
                    {err}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold shadow-lg border border-white/10 h-10"
                  style={{
                    background:
                      "linear-gradient(to right, #007DC5, #004E7A)",
                    boxShadow: "0 8px 20px rgba(0,125,197,0.30)",
                  }}
                >
                  {loading ? "Sahkan..." : "Log Masuk"}
                </Button>
              </form>

              {/* Quick logins */}
              <div className="mt-6 pt-4 border-t border-white/15">
                <div className="flex items-center gap-2 mb-2.5">
                  <Info className="w-3.5 h-3.5 text-[#FFBF00]" />
                  <span className="text-[11px] text-white/70 uppercase tracking-wider font-medium">
                    Akaun Demo (Klik untuk auto-isi)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_LOGINS.map((q) => (
                    <button
                      key={q.email}
                      onClick={() => quick(q.email, q.password)}
                      className="group text-left p-2.5 rounded-lg border transition-all hover:border-white/30"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        borderColor: "rgba(255,255,255,0.10)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: q.color }}
                        >
                          {q.role[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {q.role}
                          </div>
                          <div className="text-[10px] text-white/60 truncate">
                            {q.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer credit */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-white/75">
        <div className="inline-flex items-center gap-2">
          <span>© 2026 PERKESO</span>
          <span className="text-white/40">|</span>
          <span className="text-[#FFBF00]">Powered by IDEONIX</span>
        </div>
      </footer>
    </div>
  );
}
