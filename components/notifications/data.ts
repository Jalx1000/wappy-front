import type { IconName } from "@/components/ui/Icon";

export type NotifType = "assigned" | "mention" | "sla" | "csat" | "campaign";

export interface NotifItem {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  who?: string | null;
  tint?: [string, string];
  icon?: IconName;
}

export const NOTIF_ICON: Record<NotifType, IconName> = {
  assigned: "inbox",
  mention: "messageCircle",
  sla: "clock",
  csat: "star",
  campaign: "megaphone",
};

export const NOTIF_SEED: NotifItem[] = [
  { id: "n1", type: "assigned", title: "Nueva conversación asignada", body: "Amelia Wright — pago con tarjeta rechazado", time: "hace 2m", read: false, who: "AW", tint: ["var(--color-primary-subtle)", "var(--color-primary-ink)"] },
  { id: "n2", type: "mention", title: "Ana García te mencionó", body: "«@tú ¿puedes revisar este reembolso?»", time: "hace 18m", read: false, who: "AG", tint: ["var(--color-success-bg)", "var(--color-success-dark)"] },
  { id: "n3", type: "sla", title: "Riesgo de incumplir SLA", body: "Sofia Petrova — primera respuesta en 2 min", time: "hace 20m", read: false, who: "SP", tint: ["var(--color-warning-bg)", "var(--color-warning)"] },
  { id: "n4", type: "csat", title: "Nueva valoración CSAT: 😍 Genial", body: "Marco Rossi valoró tu atención", time: "hace 1h", read: true, who: "MR", tint: ["var(--color-success-bg)", "var(--color-success-dark)"] },
  { id: "n5", type: "campaign", title: "Campaña enviada", body: "«Anuncio de junio» llegó a 4.210 contactos", time: "hace 3h", read: true, who: null, icon: "megaphone" },
  { id: "n6", type: "assigned", title: "Conversación reasignada a ti", body: "Liam O'Brien — nueva tarjeta física", time: "Ayer", read: true, who: "LO", tint: ["var(--color-primary-subtle)", "var(--color-primary-ink)"] },
];
