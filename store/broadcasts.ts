"use client";

import { create } from "zustand";
import { CAMPAIGNS_SEED, type Campaign } from "@/components/broadcasts/data";

type Updater = Campaign[] | ((p: Campaign[]) => Campaign[]);

interface BroadcastsState {
  campaigns: Campaign[];
  setCampaigns: (u: Updater) => void;
}

export const useBroadcastsStore = create<BroadcastsState>((set) => ({
  campaigns: CAMPAIGNS_SEED,
  setCampaigns: (u) => set((s) => ({ campaigns: typeof u === "function" ? u(s.campaigns) : u })),
}));
