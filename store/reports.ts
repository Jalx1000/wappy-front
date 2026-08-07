"use client";

import { create } from "zustand";

export interface ScheduledReport {
  id: string;
  name: string;
  metric: string;
  frequency: string;
  recipients: string;
  active: boolean;
}

export const REPORTS_SEED: ScheduledReport[] = [
  { id: "rp1", name: "Resumen semanal de soporte", metric: "Vista general", frequency: "Semanal · Lun 9:00", recipients: "equipo@wappy.dev", active: true },
  { id: "rp2", name: "CSAT diario", metric: "Resumen CSAT", frequency: "Diario · 9:00", recipients: "tu@wappy.dev", active: true },
];

type Updater = ScheduledReport[] | ((p: ScheduledReport[]) => ScheduledReport[]);

interface ReportsState {
  reports: ScheduledReport[];
  setReports: (u: Updater) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  reports: REPORTS_SEED,
  setReports: (u) => set((s) => ({ reports: typeof u === "function" ? u(s.reports) : u })),
}));
