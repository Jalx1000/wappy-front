"use client";

import { create } from "zustand";
import { uid } from "@/lib/id";

export type ConvoStatus = "open" | "snoozed" | "resolved";

export interface ConvoNote {
  id: string;
  text: string;
  at: string; // ISO
  author: string;
}

export interface SideMessage {
  id: string;
  text: string;
  at: string; // ISO
  author: string; // "Tú" or the colleague's name
  mine: boolean;
}

export interface ConvoState {
  status: ConvoStatus;
  assignee: string | null; // agent name, or null = unassigned
  snoozedUntil: string | null;
  notes: ConvoNote[];
  /** Private side conversation with a colleague (the customer never sees it). */
  sideWith: string | null;
  sideThread: SideMessage[];
}

const DEFAULT: ConvoState = { status: "open", assignee: null, snoozedUntil: null, notes: [], sideWith: null, sideThread: [] };

interface ConvoStateStore {
  byId: Record<string, ConvoState>;
  setStatus: (id: string, status: ConvoStatus, snoozedUntil?: string | null) => void;
  setAssignee: (id: string, assignee: string | null) => void;
  addNote: (id: string, text: string, author: string) => void;
  startSide: (id: string, colleague: string) => void;
  closeSide: (id: string) => void;
  addSideMessage: (id: string, text: string, author: string, mine: boolean) => void;
}

/** Mock per-conversation state (status / assignee / snooze / internal notes /
 *  side conversation). The backend has none of this yet; kept in memory. */
export const useConvoStateStore = create<ConvoStateStore>((set) => ({
  byId: {},
  setStatus: (id, status, snoozedUntil = null) =>
    set((s) => ({ byId: { ...s.byId, [id]: { ...(s.byId[id] || DEFAULT), status, snoozedUntil } } })),
  setAssignee: (id, assignee) =>
    set((s) => ({ byId: { ...s.byId, [id]: { ...(s.byId[id] || DEFAULT), assignee } } })),
  addNote: (id, text, author) =>
    set((s) => {
      const cur = s.byId[id] || DEFAULT;
      const note: ConvoNote = { id: uid("note_"), text, at: new Date().toISOString(), author };
      return { byId: { ...s.byId, [id]: { ...cur, notes: [note, ...cur.notes] } } };
    }),
  startSide: (id, colleague) =>
    set((s) => ({ byId: { ...s.byId, [id]: { ...(s.byId[id] || DEFAULT), sideWith: colleague } } })),
  closeSide: (id) =>
    set((s) => ({ byId: { ...s.byId, [id]: { ...(s.byId[id] || DEFAULT), sideWith: null } } })),
  addSideMessage: (id, text, author, mine) =>
    set((s) => {
      const cur = s.byId[id] || DEFAULT;
      const msg: SideMessage = { id: uid("side_"), text, at: new Date().toISOString(), author, mine };
      return { byId: { ...s.byId, [id]: { ...cur, sideThread: [...cur.sideThread, msg] } } };
    }),
}));

export const convoStateOf = (byId: Record<string, ConvoState>, id: string): ConvoState => byId[id] || DEFAULT;
