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
  // Presentes solo en marcas reales del backend (no en mocks).
  slug?: string;
  logoUrl?: string | null;
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
      // Skip auto-hydration so el server-render y el primer client-render
      // sean idénticos (resuelve React error #418). Hidratamos manualmente
      // en el shell después del mount via `useHydrateUIStore`.
      skipHydration: true,
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        activeBrand: s.activeBrand,
        uploadedAssets: s.uploadedAssets,
      }),
    }
  )
);

/**
 * Hook helper para hidratar el store después del mount (cliente solamente).
 * Debe llamarse una sola vez en el layout del app shell.
 */
export function useHydrateUIStore() {
  if (typeof window !== "undefined") {
    // useUIStore.persist.rehydrate es idempotente: si ya está hidratado no
    // hace nada.
    void useUIStore.persist.rehydrate();
  }
}
