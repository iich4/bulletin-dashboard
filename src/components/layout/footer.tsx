"use client";

import { ShieldCheck, Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto glass border-t border-border/40 px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-[#007DC5]" />
          <span>© 2026 PERKESO — Pertubuhan Keselamatan Sosial</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/70">Dibangunkan dengan</span>
          <Heart className="w-3 h-3 text-[#ED1C24] fill-[#ED1C24]" />
          <span className="text-muted-foreground/70">oleh</span>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#002147] to-[#001a3d] text-white font-semibold hover:shadow-lg hover:shadow-[#002147]/30 transition-all"
            style={{ borderColor: "#002147" }}
          >
            <Sparkles className="w-3 h-3 text-[#FFBF00]" />
            IDEONIX
          </a>
        </div>
      </div>
    </footer>
  );
}
