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

export type UploadedAsset = {
  id: string;
  path: string;
  name: string;
  uploadedAt: string;
  brandId: string | null;
};

interface UIState {
  sidebarCollapsed: boolean;
  activeBrand: Brand | null;
  commandPaletteOpen: boolean;
  uploadedAssets: UploadedAsset[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveBrand: (b: Brand) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  addAsset: (a: UploadedAsset) => void;
  removeAsset: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeBrand: null,
      commandPaletteOpen: false,
      uploadedAssets: [],
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setActiveBrand: (b) => set({ activeBrand: b }),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      addAsset: (a) =>
        set((s) => ({ uploadedAssets: [a, ...s.uploadedAssets] })),
      removeAsset: (id) =>
        set((s) => ({
          uploadedAssets: s.uploadedAssets.filter((x) => x.id !== id),
        })),
    }),
    {
      name: "fobo-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        activeBrand: s.activeBrand,
        uploadedAssets: s.uploadedAssets,
      }),
    }
  )
);
