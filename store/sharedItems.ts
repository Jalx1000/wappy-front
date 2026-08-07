"use client";

import { create } from "zustand";

export interface SharedItem {
  id: string;
  kind: "article" | "product";
  title: string;
  subtitle?: string;
  at: string; // ISO
}

/** History of Help Center articles / products shared with a contact from the inbox. */
interface SharedItemsState {
  byContact: Record<string, SharedItem[]>;
  add: (contactId: string, item: Omit<SharedItem, "at"> & { at?: string }) => void;
}

export const useSharedItemsStore = create<SharedItemsState>((set) => ({
  byContact: {},
  add: (contactId, item) =>
    set((s) => ({
      byContact: {
        ...s.byContact,
        [contactId]: [{ ...item, at: item.at ?? new Date().toISOString() }, ...(s.byContact[contactId] || [])],
      },
    })),
}));
