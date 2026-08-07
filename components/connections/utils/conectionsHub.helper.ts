import { ConnRecord } from "@/lib/mocks/data";

// Mapeo del slug UI al urlChannel del backend OAuth gateway
export const URL_CHANNEL: Record<string, string> = {
  facebook: "meta", // Meta cubre FB + IG en un solo OAuth
  instagram: "meta",
  instagramlogin: "instagram-login",
  tiktok: "tiktok",
  tiktokads: "tiktok_ads",
  youtube: "youtube",
  linkedin: "linkedin",
  linkedinads: "linkedin_ads",
  ga4: "ga4",
  googleads: "google_ads",
  metaads: "meta-ads",
  whatsapp: "whatsapp",
};

// Canales que existen en CHANNEL_META pero por ahora no se muestran en la UI.
export const HIDDEN_CHANNELS = new Set<string>(["website"]);

export const HEALTH_STYLE = {
  ok: {
    bg: "var(--color-success-bg)",
    color: "var(--color-success-dark)",
    label: "Saludable",
  },
  warn: {
    bg: "var(--color-warning-bg)",
    color: "var(--color-warning)",
    label: "Expira pronto",
  },
  err: {
    bg: "var(--color-error-bg)",
    color: "var(--color-error)",
    label: "Requiere acción",
  },
};

export type ChannelGroup = { ch: string; accounts: ConnRecord[] };


// ── Card por canal con todas sus cuentas ─────────────────────────────────────
export interface ChannelCardProps {
  group: ChannelGroup;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  onConnect: () => void;
  onDisconnect: (conn: ConnRecord) => void;
  onSync: (id: number) => void;
  syncingId: number | null;
  onChangeBrand: (conn: ConnRecord) => void;
}