"use client";

import { create } from "zustand";
import { NOTIF_SEED, type NotifItem } from "@/components/notifications/data";

type NotifUpdater = NotifItem[] | ((prev: NotifItem[]) => NotifItem[]);

interface NotificationsState {
  items: NotifItem[];
  setItems: (updater: NotifUpdater) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: NOTIF_SEED,
  setItems: (updater) =>
    set((s) => ({ items: typeof updater === "function" ? updater(s.items) : updater })),
}));
