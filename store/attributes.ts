"use client";

import { create } from "zustand";
import { ATTR_MODULES, type ModuleDef } from "@/components/attributes/data";

type ModulesUpdater = ModuleDef[] | ((prev: ModuleDef[]) => ModuleDef[]);

interface AttributesState {
  modules: ModuleDef[];
  /** setState-style updater so ported CRUD logic reads like the design source. */
  setModules: (updater: ModulesUpdater) => void;
}

/**
 * In-memory data-model store (custom fields + custom objects). Not persisted, so
 * SSR and the first client render match. Products and Contacts read the same
 * `modules` state, so a schema edit reflects everywhere — as the design intends.
 */
export const useAttributesStore = create<AttributesState>((set) => ({
  modules: ATTR_MODULES,
  setModules: (updater) =>
    set((s) => ({
      modules: typeof updater === "function" ? updater(s.modules) : updater,
    })),
}));
