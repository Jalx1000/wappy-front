"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Brand = {
  id: string;
  name: string;
  short: string;
  industry: string;
  tint: string;
  plan: string;
  team: number;
  channels: string[];
  followers: string;
  reach: string;
  eng: string;
  spend: string;
};

interface UIState {
  sidebarCollapsed: boolean;
  activeBrand: Brand | null;
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveBrand: (b: Brand) => void;
  setCommandPaletteOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeBrand: null,
      commandPaletteOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setActiveBrand: (b) => set({ activeBrand: b }),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
    }),
    {
      name: "fobo-ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, activeBrand: s.activeBrand }),
    }
  )
);
