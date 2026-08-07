"use client";

import { create } from "zustand";
import { RULES_SEED, type Rule } from "@/components/automations/data";

type RulesUpdater = Rule[] | ((prev: Rule[]) => Rule[]);

interface AutomationsState {
  rules: Rule[];
  setRules: (updater: RulesUpdater) => void;
}

export const useAutomationsStore = create<AutomationsState>((set) => ({
  rules: RULES_SEED,
  setRules: (updater) =>
    set((s) => ({ rules: typeof updater === "function" ? updater(s.rules) : updater })),
}));
