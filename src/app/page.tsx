"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useNavStore } from "@/stores/nav-store";
import { LoginPage } from "@/components/layout/login-page";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DocPreviewProvider } from "@/components/common/doc-preview";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { AnnouncementsPage } from "@/components/modules/announcements-page";
import { ActsPage } from "@/components/modules/acts-page";
import { AsipPage } from "@/components/modules/asip-page";
import { SopPage } from "@/components/modules/sop-page";
import { CircularsPage } from "@/components/modules/circulars-page";
import { FaqPage } from "@/components/modules/faq-page";
import { AdminPage } from "@/components/modules/admin-page";
import { ChatAssistant } from "@/components/chat/chat-assistant";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const currentPage = useNavStore((s) => s.currentPage);

  // Avoid SSR/hydration flash — wait for the persisted store to hydrate
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted || !hydrated) {
    return (
      <div className="min-h-screen bg-brand-aurora flex items-center justify-center">
        <div className="glass rounded-2xl px-6 py-4 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">Memuatkan PERKESO Bulletin…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <DocPreviewProvider>
        <LoginPage />
      </DocPreviewProvider>
    );
  }

  return (
    <DocPreviewProvider>
      <div className="bg-brand-aurora min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {currentPage === "dashboard" && <DashboardPage />}
                {currentPage === "announcements" && <AnnouncementsPage />}
                {currentPage === "acts" && <ActsPage />}
                {currentPage === "asip" && <AsipPage />}
                {currentPage === "sop" && <SopPage />}
                {currentPage === "circulars" && <CircularsPage />}
                {currentPage === "faq" && <FaqPage />}
                {currentPage === "admin" && <AdminPage />}
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </div>
      <ChatAssistant />
    </DocPreviewProvider>
  );
}
