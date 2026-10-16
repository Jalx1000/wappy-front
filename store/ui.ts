"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EMPTY_PREF, type WorkspaceId, type WorkspacePref } from "@/components/shell/nav";

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
  activeWorkspace: WorkspaceId;
  workspacePrefs: Record<WorkspaceId, WorkspacePref>;
  activeBrand: Brand | null;
  commandPaletteOpen: boolean;
  uploadedAssets: UploadedAsset[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveWorkspace: (w: WorkspaceId) => void;
  setWorkspaceOrder: (w: WorkspaceId, order: string[]) => void;
  toggleWorkspaceItem: (w: WorkspaceId, itemId: string) => void;
  resetWorkspacePrefs: (w: WorkspaceId) => void;
  setActiveBrand: (b: Brand) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  addAsset: (a: UploadedAsset) => void;
  removeAsset: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeWorkspace: "crm",
      workspacePrefs: { crm: { ...EMPTY_PREF }, ads: { ...EMPTY_PREF } },
      activeBrand: null,
      commandPaletteOpen: false,
      uploadedAssets: [],
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setActiveWorkspace: (w) => set({ activeWorkspace: w }),
      setWorkspaceOrder: (w, order) =>
        set((s) => ({
          workspacePrefs: {
            ...s.workspacePrefs,
            [w]: { ...s.workspacePrefs[w], order },
          },
        })),
      toggleWorkspaceItem: (w, itemId) =>
        set((s) => {
          const pref = s.workspacePrefs[w];
          const hidden = pref.hidden.includes(itemId)
            ? pref.hidden.filter((id) => id !== itemId)
            : [...pref.hidden, itemId];
          return { workspacePrefs: { ...s.workspacePrefs, [w]: { ...pref, hidden } } };
        }),
      resetWorkspacePrefs: (w) =>
        set((s) => ({
          workspacePrefs: { ...s.workspacePrefs, [w]: { ...EMPTY_PREF } },
        })),
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
        activeWorkspace: s.activeWorkspace,
        workspacePrefs: s.workspacePrefs,
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
