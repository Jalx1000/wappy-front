"use client";

import { create } from "zustand";
import { uid } from "@/lib/id";
import type { FilterRule } from "@/components/contacts/segments";

export interface SavedSegment {
  id: string;
  name: string;
  rules: FilterRule[];
}

interface SavedSegmentsState {
  segments: SavedSegment[];
  add: (name: string, rules: FilterRule[]) => void;
  remove: (id: string) => void;
}

/** Custom contact segments saved from the filter builder (mock, in-session). */
export const useSavedSegmentsStore = create<SavedSegmentsState>((set) => ({
  segments: [],
  add: (name, rules) =>
    set((s) => ({ segments: [...s.segments, { id: uid("seg_"), name, rules: rules.map((r) => ({ ...r })) }] })),
  remove: (id) => set((s) => ({ segments: s.segments.filter((x) => x.id !== id) })),
}));
