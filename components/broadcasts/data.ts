import type { IconName } from "@/components/ui/Icon";
import type { BadgeVariant } from "@/components/ui/Badge";

// ── Types ────────────────────────────────────────────────────────────────────
export type CampaignType = "whatsapp" | "in_app" | "email" | "push";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused";
export type WaCategory = "marketing" | "utility" | "otp";
export type WaMsgType = "normal" | "list" | "product" | "buttons";
export type WaButtonType = "quick" | "url" | "phone";

export interface WaButton {
  type: WaButtonType;
  label: string;
}

export interface WaConfig {
  category?: WaCategory;
  msgType?: WaMsgType;
  header?: string;
  body?: string;
  footer?: string;
  buttons?: WaButton[];
  rows?: string[];
  productId?: string;
  expiry?: number | string;
  copyLabel?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  audience: string;
  subject?: string;
  preheader?: string;
  body: string;
  wa?: WaConfig;
  when?: "now" | "later";
  sentAt?: string;
  scheduledAt?: string;
  recipients: number;
  opened: number;
  clicked: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
}

interface TypeMeta {
  id: CampaignType;
  label: string;
  icon: IconName;
  blurb: string;
  tint: { bg: string; fg: string };
}

// ── Channels ─────────────────────────────────────────────────────────────────
export const CAMPAIGN_TYPES: Record<CampaignType, TypeMeta> = {
  whatsapp: { id: "whatsapp", label: "WhatsApp", icon: "whatsapp", blurb: "Un mensaje de plantilla por WhatsApp", tint: { bg: "#DDF6E4", fg: "#128C45" } },
  in_app:   { id: "in_app", label: "Mensaje in-app", icon: "messageCircle", blurb: "Un mensaje dentro de tu widget", tint: { bg: "var(--color-primary-subtle)", fg: "var(--color-primary-ink)" } },
  email:    { id: "email", label: "Email", icon: "mail", blurb: "Un correo de difusión puntual", tint: { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)" } },
  push:     { id: "push", label: "Notificación push", icon: "bell", blurb: "Un push nativo móvil", tint: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" } },
};
export const CAMPAIGN_TYPE_ORDER: CampaignType[] = ["whatsapp", "in_app", "email", "push"];

// WhatsApp template categories (Meta-style) + message types
interface WaCategoryMeta {
  id: WaCategory;
  label: string;
  blurb: string;
  icon: IconName;
  tint: { bg: string; fg: string };
}
export const WA_CATEGORIES: Record<WaCategory, WaCategoryMeta> = {
  marketing: { id: "marketing", label: "Marketing", blurb: "Promociones, ofertas, anuncios", icon: "megaphone", tint: { bg: "var(--color-primary-subtle)", fg: "var(--color-primary-ink)" } },
  utility:   { id: "utility", label: "Utilidad", blurb: "Actualizaciones, recordatorios, alertas", icon: "bell", tint: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" } },
  otp:       { id: "otp", label: "Autenticación", blurb: "Códigos de un solo uso (OTP)", icon: "shield", tint: { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)" } },
};
export const WA_CATEGORY_ORDER: WaCategory[] = ["marketing", "utility", "otp"];

interface WaMsgTypeMeta {
  id: WaMsgType;
  label: string;
  icon: IconName;
  blurb: string;
}
export const WA_MESSAGE_TYPES: Record<WaMsgType, WaMsgTypeMeta> = {
  normal:  { id: "normal", label: "Texto", icon: "messageCircle", blurb: "Encabezado, cuerpo, pie y botones" },
  list:    { id: "list", label: "Lista", icon: "sort", blurb: "Un menú de filas seleccionables" },
  product: { id: "product", label: "Producto", icon: "box", blurb: "Un artículo del catálogo con precio" },
  buttons: { id: "buttons", label: "Botones", icon: "cursor", blurb: "Hasta 3 botones de respuesta rápida" },
};
export const WA_MESSAGE_TYPE_ORDER: WaMsgType[] = ["normal", "list", "product", "buttons"];

// ── Status ───────────────────────────────────────────────────────────────────
export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; variant: BadgeVariant }> = {
  draft:     { label: "Borrador", variant: "neutral" },
  scheduled: { label: "Programada", variant: "warning" },
  sending:   { label: "Enviando", variant: "primary" },
  sent:      { label: "Enviada", variant: "success" },
  paused:    { label: "Pausada", variant: "neutral" },
};

// ── Audiences (match the contact model) ──────────────────────────────────────
export interface AudienceFilter {
  id: string;
  label: string;
  count: number;
}
export const AUDIENCE_FILTERS: AudienceFilter[] = [
  { id: "all", label: "Todos los contactos", count: 4820 },
  { id: "customers", label: "Clientes", count: 3110 },
  { id: "leads", label: "Leads", count: 1710 },
  { id: "vip", label: "Etiqueta VIP", count: 240 },
  { id: "trial", label: "En prueba", count: 530 },
  { id: "inactive", label: "Inactivos 30d+", count: 980 },
];

// ── Local WhatsApp catalog (mock) ────────────────────────────────────────────
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  { id: "cp1", name: "Plan Pro (anual)", price: 290 },
  { id: "cp2", name: "Plan Starter (mensual)", price: 29 },
  { id: "cp3", name: "Complemento WhatsApp API", price: 49 },
  { id: "cp4", name: "Asientos adicionales (x5)", price: 75 },
];

// ── Seed campaigns ───────────────────────────────────────────────────────────
export const CAMPAIGNS_SEED: Campaign[] = [
  { id: "cmp0", name: "Aviso de pedido enviado", type: "whatsapp", status: "sent", audience: "customers",
    wa: { category: "utility", msgType: "normal", header: "Tu pedido va en camino 📦", body: "Hola {{name}}, el pedido #{{1}} se ha enviado y llega en 2–3 días.", footer: "Wappy", buttons: [{ type: "url", label: "Rastrear pedido" }] },
    body: "Hola {{name}}, el pedido #{{1}} se ha enviado y llega en 2–3 días.",
    sentAt: "3 jun 2026", recipients: 3110, opened: 2980, clicked: 1240 },
  { id: "cmp1", name: "Bienvenida a Wappy", type: "in_app", status: "sent", audience: "leads",
    subject: "", body: "👋 ¡Bienvenido! ¿Necesitas ayuda para empezar? Escríbenos cuando quieras.",
    sentAt: "2 jun 2026", recipients: 1710, opened: 1204, clicked: 388 },
  { id: "cmp2", name: "Novedades de mayo", type: "email", status: "sent", audience: "customers",
    subject: "Lo nuevo en Wappy este mes", body: "Hola {{name}}, esto es todo lo que lanzamos en mayo — bandeja más rápida, nuevos bloques de bot y más.",
    sentAt: "31 may 2026", recipients: 3110, opened: 1865, clicked: 712 },
  { id: "cmp3", name: "Recordatorio de fin de prueba", type: "email", status: "scheduled", audience: "trial",
    subject: "Tu prueba termina en 3 días", body: "Hola {{name}}, tu prueba termina pronto. Mejora tu plan para no interrumpir tus conversaciones.",
    scheduledAt: "8 jun 2026, 09:00", recipients: 530, opened: 0, clicked: 0 },
  { id: "cmp4", name: "Reactivar usuarios inactivos", type: "push", status: "draft", audience: "inactive",
    subject: "", body: "¡Te extrañamos! Esto es lo nuevo desde que te fuiste.",
    recipients: 980, opened: 0, clicked: 0 },
  { id: "cmp5", name: "Oferta Black Friday", type: "in_app", status: "paused", audience: "all",
    subject: "", body: "🔥 Solo 48h — 30% en planes anuales. Toca para reclamar.",
    recipients: 4820, opened: 920, clicked: 410 },
];

export function rate(n: number, d: number): string {
  return d > 0 ? Math.round((n / d) * 100) + "%" : "—";
}
