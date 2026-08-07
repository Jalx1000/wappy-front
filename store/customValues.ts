"use client";

import { create } from "zustand";
import type { AttrValue } from "@/components/attributes/data";

/** Custom-field VALUES for external records (real contacts, products…), keyed by
 *  `${moduleId}:${recordId}`. The schema lives in the Attributes store; this holds
 *  the per-record values the backend doesn't store yet. */
interface CustomValuesState {
  values: Record<string, Record<string, AttrValue>>;
  setFieldValue: (moduleId: string, recordId: string, key: string, value: AttrValue) => void;
}

const k = (moduleId: string, recordId: string) => `${moduleId}:${recordId}`;

export const useCustomValuesStore = create<CustomValuesState>((set) => ({
  values: {},
  setFieldValue: (moduleId, recordId, key, value) =>
    set((s) => {
      const rk = k(moduleId, recordId);
      return { values: { ...s.values, [rk]: { ...(s.values[rk] || {}), [key]: value } } };
    }),
}));

export const recordValues = (values: CustomValuesState["values"], moduleId: string, recordId: string) =>
  values[k(moduleId, recordId)] || {};
