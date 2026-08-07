"use client";

import { create } from "zustand";
import { uid } from "@/lib/id";

export interface ThreadCard {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  price?: number | null;
  category?: string;
  at: string; // ISO
  direction: "out";
}

/** Product cards attached to a conversation from the composer (mock, in-session). */
interface ThreadCardsState {
  byConvo: Record<string, ThreadCard[]>;
  addCard: (convoId: string, card: Omit<ThreadCard, "id" | "at" | "direction">) => void;
}

export const useThreadCardsStore = create<ThreadCardsState>((set) => ({
  byConvo: {},
  addCard: (convoId, card) =>
    set((s) => ({
      byConvo: {
        ...s.byConvo,
        [convoId]: [...(s.byConvo[convoId] || []), { ...card, id: uid("card_"), at: new Date().toISOString(), direction: "out" }],
      },
    })),
}));
