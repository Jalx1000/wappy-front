"use client";

import { create } from "zustand";
import { DEFAULT_WORKSPACE, type Workspace } from "@/components/settings-support/data";

type WsUpdater = Workspace | ((prev: Workspace) => Workspace);

interface WorkspaceState {
  workspace: Workspace;
  setWorkspace: (u: WsUpdater) => void;
}

/** In-memory workspace settings (mock). */
export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: DEFAULT_WORKSPACE,
  setWorkspace: (u) => set((s) => ({ workspace: typeof u === "function" ? u(s.workspace) : u })),
}));
