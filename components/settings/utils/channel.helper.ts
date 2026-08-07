// WHATSAPP

import z from "zod";

export const WA_WA_CATEGORIES_WA = [
  "Marketing",
  "Utility",
  "Authentication",
  "Service",
] as const;

export const waConnectSchema = z.object({
  // Credenciales Cloud API Meta
  appId: z
    .string()
    .min(5, "App ID: mínimo 5 caracteres")
    .regex(/^\d+$/, "App ID: solo números")
    .describe("Meta App ID"),
  appSecret: z.string().min(10, "App Secret: mínimo 10 caracteres"),
  accessToken: z
    .string()
    .min(20, "Permanent Token: al menos 20 caracteres"),
  phoneNumberId: z
    .string()
    .min(5, "Phone Number ID es obligatorio")
    .regex(/^\d+$/, "Phone Number ID: solo números"),
  businessAccountId: z
    .string()
    .min(5, "WABA ID es obligatorio")
    .regex(/^\d+$/, "WABA ID: solo números"),
  // Datos del número
  displayName: z
    .string()
    .min(2, "Nombre: mínimo 2 caracteres")
    .max(40, "Nombre: máximo 40 caracteres"),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s-]+$/, "Formato internacional: +591 70000000"),
  category: z.enum(WA_WA_CATEGORIES_WA, {
    message: "Selecciona una categoría",
  }),
});

export type WaConnectForm = z.infer<typeof waConnectSchema>;

export interface WaModalProps {
  onClose: () => void;
  onSave?: (data: WaConnectForm) => void;
  brand?: { id?: string | number; name?: string; slug?: string } | null;
}

export const _lbl = "text-[12px] font-semibold block mb-2";
export const _lblS: React.CSSProperties = { color: "var(--color-text-secondary)" };
export const _hlp = "text-[11.5px] mt-1.5";
export const _hlpS: React.CSSProperties = { color: "var(--color-text-tertiary)" };
export const _err = "text-[11.5px] mt-1.5";
export const _errS: React.CSSProperties = { color: "var(--color-error)" };


// Tipo mockado local de una cuenta WA conectada (suficiente para UI)
export type WaAccount = {
  id: string;
  displayName: string;
  phoneNumber: string;
  phoneNumberId: string;
  category: string;
  connectedAt: string;
  health: "ok" | "warn" | "err";
};

export const _WA_SEED: WaAccount[] = [];

// SECTIONS
export const SECTIONS = [
  { id: "account", label: "Mi cuenta", icon: "user" as const },
  { id: "security", label: "Seguridad", icon: "shield" as const },
  { id: "team", label: "Equipo", icon: "users" as const },
  { id: "notifs", label: "Notificaciones", icon: "bell" as const },
  { id: "session", label: "Sesión", icon: "logout" as const },
  { id: "channel", label: "Canales", icon: "channel" as const },
];

export const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-ui)",
};

export type NotifPrefs = {
  reports: boolean;
  connections: boolean;
  approvals: boolean;
  insights: boolean;
  digest: boolean;
};

export const NOTIF_DEFAULTS: NotifPrefs = {
  reports: true,
  connections: true,
  approvals: true,
  insights: false,
  digest: true,
};


// NOTIFY

export const NOTIF_KEY = "fobo-notif-prefs";

export function loadNotifs(): NotifPrefs {
  if (typeof window === "undefined") return NOTIF_DEFAULTS;
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return NOTIF_DEFAULTS;
    return { ...NOTIF_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return NOTIF_DEFAULTS;
  }
}

export function saveNotifs(p: NotifPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_KEY, JSON.stringify(p));
}
