"use client";

import { create } from "zustand";
import { DEFAULT_MACROS, type Macro } from "@/components/inbox/macrosData";

type MacrosUpdater = Macro[] | ((prev: Macro[]) => Macro[]);

interface MacrosState {
  macros: Macro[];
  setMacros: (updater: MacrosUpdater) => void;
}

/** In-memory saved replies. The composer '/' menu and the manager share this list. */
export const useMacrosStore = create<MacrosState>((set) => ({
  macros: DEFAULT_MACROS,
  setMacros: (updater) =>
    set((s) => ({ macros: typeof updater === "function" ? updater(s.macros) : updater })),
}));
