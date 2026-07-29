"use client";

import { create } from "zustand";

export type PageKey =
  | "dashboard"
  | "announcements"
  | "acts"
  | "asip"
  | "sop"
  | "circulars"
  | "faq"
  | "admin";

interface NavState {
  currentPage: PageKey;
  setPage: (page: PageKey) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  isNotifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  isUserMenuOpen: boolean;
  setUserMenuOpen: (v: boolean) => void;
}

export const useNavStore = create<NavState>((set) => ({
  currentPage: "dashboard",
  setPage: (page) => set({ currentPage: page, mobileSidebarOpen: false }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
  isSearchOpen: false,
  setSearchOpen: (v) => set({ isSearchOpen: v }),
  isNotifOpen: false,
  setNotifOpen: (v) => set({ isNotifOpen: v }),
  isUserMenuOpen: false,
  setUserMenuOpen: (v) => set({ isUserMenuOpen: v }),
}));
