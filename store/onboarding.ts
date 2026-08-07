"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
  seenWelcome: boolean;
  dismissed: boolean;
  expanded: boolean;
  done: Record<string, boolean>;
  setSeenWelcome: (v: boolean) => void;
  setDismissed: (v: boolean) => void;
  setExpanded: (v: boolean) => void;
  markDone: (id: string) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      seenWelcome: false,
      dismissed: false,
      expanded: true,
      done: {},
      setSeenWelcome: (v) => set({ seenWelcome: v }),
      setDismissed: (v) => set({ dismissed: v }),
      setExpanded: (v) => set({ expanded: v }),
      markDone: (id) => set((s) => ({ done: { ...s.done, [id]: true } })),
    }),
    { name: "wappy-onboarding", skipHydration: true }
  )
);
