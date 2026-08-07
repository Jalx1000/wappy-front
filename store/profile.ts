"use client";

import { create } from "zustand";
import { DEFAULT_PROFILE, type AgentProfile } from "@/components/profile/data";

interface ProfileState {
  profile: AgentProfile;
  setProfile: (p: AgentProfile) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: DEFAULT_PROFILE,
  setProfile: (p) => set({ profile: p }),
}));
