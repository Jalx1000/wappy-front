"use client";

import { create } from "zustand";
import { BOT_FLOWS, type Flow } from "@/components/bot-builder/data";

type FlowsUpdater = Flow[] | ((prev: Flow[]) => Flow[]);

interface BotState {
  flows: Flow[];
  setFlows: (u: FlowsUpdater) => void;
}

export const useBotStore = create<BotState>((set) => ({
  flows: BOT_FLOWS,
  setFlows: (u) => set((s) => ({ flows: typeof u === "function" ? u(s.flows) : u })),
}));
