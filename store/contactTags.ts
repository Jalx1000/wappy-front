"use client";

import { create } from "zustand";

/** Which tags (tagId[]) are applied to each contact. Seeded with a couple of
 *  demo assignments so the inbox filter has something to show. */
interface ContactTagsState {
  byContact: Record<string, string[]>;
  toggle: (contactId: string, tagId: string) => void;
  has: (contactId: string, tagId: string) => boolean;
}

export const useContactTagsStore = create<ContactTagsState>((set, get) => ({
  byContact: {},
  toggle: (contactId, tagId) =>
    set((s) => {
      const cur = s.byContact[contactId] || [];
      const next = cur.includes(tagId) ? cur.filter((t) => t !== tagId) : [...cur, tagId];
      return { byContact: { ...s.byContact, [contactId]: next } };
    }),
  has: (contactId, tagId) => (get().byContact[contactId] || []).includes(tagId),
}));
