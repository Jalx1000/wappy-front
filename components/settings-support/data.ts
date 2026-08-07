import type { CSSProperties } from "react";
import type { IconName } from "@/components/ui/Icon";

// ── Channels (support) ───────────────────────────────────────────────────────
export const CHANNELS: Record<string, { label: string; color: string; glyph: string }> = {
  whatsapp: { label: "WhatsApp", color: "#25D366", glyph: "W" },
  messenger: { label: "Messenger", color: "#0A7CFF", glyph: "M" },
  instagram: { label: "Instagram", color: "#E1306C", glyph: "I" },
  email: { label: "Email", color: "#5B6B7B", glyph: "@" },
  web: { label: "Widget web", color: "#0E1300", glyph: "●" },
};
export const CHANNEL_ORDER = ["whatsapp", "messenger", "instagram", "email", "web"];
export const CHANNEL_FIELD: Record<string, { label: string; ph: string }> = {
  whatsapp: { label: "Número de teléfono", ph: "+34 600 900 000" },
  messenger: { label: "Página de Facebook", ph: "@tupagina" },
  instagram: { label: "Usuario de Instagram", ph: "@tumarca" },
  email: { label: "Dirección de correo", ph: "soporte@wappy.dev" },
  web: { label: "Sitio / nombre del widget", ph: "wappy.dev" },
};

// ── Roles / permissions ──────────────────────────────────────────────────────
export type RoleColor = "primary" | "success" | "warning" | "neutral";
export const ROLE_TINT: Record<RoleColor, { bg: string; fg: string }> = {
  primary: { bg: "var(--color-primary-subtle)", fg: "var(--color-primary-ink)" },
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
  neutral: { bg: "var(--neutral-200)", fg: "var(--color-text-secondary)" },
};
export type PermKey = "inbox" | "contacts" | "settings" | "billing" | "team" | "export";
export const PERMISSIONS: { key: PermKey; label: string; hint: string }[] = [
  { key: "inbox", label: "Acceso a todas las bandejas", hint: "Ver y responder cualquier conversación" },
  { key: "contacts", label: "Gestionar contactos", hint: "Crear, editar y eliminar contactos" },
  { key: "settings", label: "Gestionar configuración", hint: "Canales, horario, identidad" },
  { key: "billing", label: "Gestionar facturación", hint: "Plan, método de pago, facturas" },
  { key: "team", label: "Gestionar equipo y roles", hint: "Invitar miembros y asignar roles" },
  { key: "export", label: "Exportar datos", hint: "Descargar contactos y reportes" },
];

// ── Plans / invoices ─────────────────────────────────────────────────────────
export const PLANS = [
  { id: "starter", name: "Starter", price: 29, blurb: "Para equipos pequeños", feats: ["2 asientos", "3 canales", "1.000 conversaciones"] },
  { id: "growth", name: "Growth", price: 99, blurb: "El más popular", feats: ["10 asientos", "Canales ilimitados", "10.000 conversaciones"] },
  { id: "scale", name: "Scale", price: 249, blurb: "Alto volumen", feats: ["Asientos ilimitados", "Canales ilimitados", "Conversaciones ilimitadas"] },
];
export const INVOICES = [
  { id: "INV-0042", date: "1 jun 2026", amount: "$99.00", status: "Pagada" },
  { id: "INV-0041", date: "1 may 2026", amount: "$99.00", status: "Pagada" },
  { id: "INV-0040", date: "1 abr 2026", amount: "$99.00", status: "Pagada" },
];

// ── Types ────────────────────────────────────────────────────────────────────
export interface ChannelAccount { id: string; label: string; detail: string; connected: boolean }
export interface Member { id: string; name: string; email: string; roleId: string; online: boolean; tint: RoleColor }
export interface Role { id: string; name: string; color: RoleColor; system: boolean; perms: Record<PermKey, boolean> }
export interface HourSegment { from: string; to: string }
export interface DayHours { on: boolean; segments: HourSegment[] }
export interface Notifications {
  assigned: boolean; replies: boolean; mentions: boolean; csat: boolean; digest: boolean;
  push: boolean; sound: boolean; quietEnabled: boolean; quietFrom: string; quietTo: string;
}
export interface Workspace {
  name: string; slug: string;
  channelAccounts: Record<string, ChannelAccount[]>;
  notifications: Notifications;
  hours: { enabled: boolean; tz: string; days: Record<string, DayHours> };
  team: Member[];
  roles: Role[];
}

export const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_FULL: Record<string, string> = { Mon: "Lunes", Tue: "Martes", Wed: "Miércoles", Thu: "Jueves", Fri: "Viernes", Sat: "Sábado", Sun: "Domingo" };

const allPerms = (v: boolean): Record<PermKey, boolean> => ({ inbox: v, contacts: v, settings: v, billing: v, team: v, export: v });

export const DEFAULT_WORKSPACE: Workspace = {
  name: "Wappy",
  slug: "wappy",
  channelAccounts: {
    whatsapp: [{ id: "wa1", label: "Línea de soporte", detail: "+34 600 900 000", connected: true }],
    messenger: [{ id: "ms1", label: "Página principal", detail: "@wappy", connected: true }],
    instagram: [],
    email: [{ id: "em1", label: "Buzón de soporte", detail: "soporte@wappy.dev", connected: true }],
    web: [{ id: "web1", label: "Widget del sitio", detail: "wappy.dev", connected: true }],
  },
  notifications: {
    assigned: true, replies: true, mentions: true, csat: true, digest: false,
    push: true, sound: false, quietEnabled: false, quietFrom: "22:00", quietTo: "08:00",
  },
  hours: {
    enabled: true, tz: "Europe/Madrid",
    days: {
      Mon: { on: true, segments: [{ from: "09:00", to: "14:00" }, { from: "15:00", to: "18:00" }] },
      Tue: { on: true, segments: [{ from: "09:00", to: "18:00" }] },
      Wed: { on: true, segments: [{ from: "09:00", to: "18:00" }] },
      Thu: { on: true, segments: [{ from: "09:00", to: "18:00" }] },
      Fri: { on: true, segments: [{ from: "09:00", to: "15:00" }] },
      Sat: { on: false, segments: [] },
      Sun: { on: false, segments: [] },
    },
  },
  team: [
    { id: "t_you", name: "Super Admin", email: "admin@wappy.dev", roleId: "r_admin", online: true, tint: "primary" },
    { id: "t_ana", name: "Ana García", email: "ana@wappy.dev", roleId: "r_admin", online: true, tint: "success" },
    { id: "t_marco", name: "Marco Rossi", email: "marco@wappy.dev", roleId: "r_agent", online: true, tint: "warning" },
    { id: "t_sofia", name: "Sofia Petrova", email: "sofia@wappy.dev", roleId: "r_agent", online: false, tint: "primary" },
  ],
  roles: [
    { id: "r_admin", name: "Administrador", color: "primary", system: true, perms: allPerms(true) },
    { id: "r_agent", name: "Agente", color: "success", system: true, perms: { inbox: true, contacts: true, settings: false, billing: false, team: false, export: false } },
  ],
};

// Shared inline styles (ported from the design's setStyles).
export const st: Record<string, CSSProperties> = {
  content: { flex: 1, overflowY: "auto", padding: "28px 36px" },
  h1: { margin: "0 0 4px", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" },
  lead: { fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 24px" },
  card: { background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", marginBottom: 18, overflow: "hidden" },
  cardHead: { padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" },
  cardSub: { fontSize: 12.5, color: "var(--color-text-tertiary)", marginTop: 2 },
  row: { display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--color-border)" },
  label: { fontSize: 13.5, fontWeight: 500, color: "var(--color-text-primary)" },
  hint: { fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 },
  field: { marginBottom: 16 },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 },
};

export const NAV: { group: string; items: [string, string, IconName][] }[] = [
  { group: "Workspace", items: [["workspace", "General", "building"], ["channels", "Canales", "megaphone"], ["team", "Equipo", "users"], ["roles", "Roles", "shield"]] },
  { group: "Preferencias", items: [["notifications", "Notificaciones", "bell"], ["hours", "Horario", "clock"], ["billing", "Plan y facturación", "card"]] },
];
