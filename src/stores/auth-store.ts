"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Admin" | "Staff";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  branch?: string | null;
  position?: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "perkeso-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
