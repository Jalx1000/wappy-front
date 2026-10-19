import type { IconName } from "@/components/ui/Icon";
import type { ApiNotification } from "@/lib/api/notifications";

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

const KNOWN_TYPES: readonly string[] = [
  "assigned",
  "mention",
  "sla",
  "csat",
  "campaign",
];

/** Fecha relativa compacta en español (ahora / hace 2m / hace 3h / Ayer / fecha). */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "ahora";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString();
}

/** Mapea la notificación del backend al modelo que consume la campana. */
export function toNotifItem(n: ApiNotification): NotifItem {
  const type: NotifType = KNOWN_TYPES.includes(n.type)
    ? (n.type as NotifType)
    : "mention";
  const who =
    typeof n.metadata?.who === "string" ? (n.metadata.who as string) : null;
  return {
    id: String(n.id),
    type,
    title: n.title,
    body: n.body,
    time: timeAgo(n.createdAt),
    read: n.read,
    who,
  };
}
