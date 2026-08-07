import type { Brand } from "@/store/ui";

export const BRANDS: Brand[] = [
  {
    id: "auto",
    name: "Toyosa Motors",
    short: "TM",
    industry: "Automotriz",
    tint: "#0D5CA6",
    plan: "360°",
    team: 5,
    channels: ["facebook", "instagram", "tiktok", "ga4", "metaads", "googleads"],
    followers: "284K",
    reach: "1.9M",
    eng: "4.8%",
    spend: "$12.4K",
  },
  {
    id: "food",
    name: "La Casa del Camba",
    short: "CC",
    industry: "Gastronomía",
    tint: "#E1306C",
    plan: "Social + Ads",
    team: 3,
    channels: ["facebook", "instagram", "tiktok", "metaads"],
    followers: "152K",
    reach: "980K",
    eng: "6.1%",
    spend: "$4.2K",
  },
  {
    id: "bank",
    name: "Banco Ganadero",
    short: "BG",
    industry: "Finanzas",
    tint: "#1E8A5B",
    plan: "360°",
    team: 6,
    channels: ["facebook", "instagram", "linkedin", "ga4", "googleads", "youtube"],
    followers: "410K",
    reach: "2.6M",
    eng: "3.2%",
    spend: "$22.8K",
  },
  {
    id: "retail",
    name: "Hipermaxi",
    short: "HM",
    industry: "Retail",
    tint: "#F09030",
    plan: "Social",
    team: 4,
    channels: ["facebook", "instagram", "tiktok"],
    followers: "338K",
    reach: "2.1M",
    eng: "5.4%",
    spend: "—",
  },
];

export const KPIS = [
  { id: "reach", label: "Alcance total",      value: "1.9M",  delta: 14.2, spark: [40, 52, 48, 61, 58, 72, 80] },
  { id: "eng",   label: "Engagement",         value: "4.8%",  delta: 0.6,  spark: [42, 44, 46, 45, 47, 48, 48] },
  { id: "fans",  label: "Nuevos seguidores",  value: "+8.4K", delta: 22.1, spark: [20, 28, 26, 34, 40, 46, 54] },
  { id: "roas",  label: "ROAS (Ads)",         value: "3.7x",  delta: -3.1, spark: [42, 40, 44, 41, 39, 40, 38] },
];

export const ALERTS = [
  { type: "err",  text: "GA4 de Toyosa requiere reautenticación", brand: "Toyosa Motors" },
  { type: "warn", text: "Token de TikTok expira en 6 días",        brand: "Toyosa Motors" },
  { type: "ok",   text: "Reporte mensual de Banco Ganadero enviado", brand: "Banco Ganadero" },
];

// ── Channel metadata ──────────────────────────────────────────────────────────
export const CHANNEL_META: Record<string, { label: string; color: string; letter: string; cat: string; scopes: string[] }> = {
  facebook:  { label: "Facebook",           color: "#1877F2", letter: "f",  cat: "social",    scopes: ["Páginas", "Insights", "Publicaciones", "Comentarios"] },
  instagram: { label: "Instagram (via Facebook)", color: "#E1306C", letter: "◎",  cat: "social",    scopes: ["Perfil business", "Insights", "Media", "Mensajes"] },
  instagramlogin: { label: "Instagram (login directo)", color: "#E1306C", letter: "◉",  cat: "social",    scopes: ["Perfil", "Insights", "Publicar", "Mensajes", "Comentarios"] },
  tiktok:    { label: "TikTok",             color: "#010101", letter: "♪",  cat: "social",    scopes: ["Perfil", "Videos", "Analítica", "Comentarios"] },
  linkedin:  { label: "LinkedIn",           color: "#0A66C2", letter: "in", cat: "social",    scopes: ["Company Page", "Analítica", "Publicaciones"] },
  youtube:   { label: "YouTube",            color: "#FF0000", letter: "▶",  cat: "social",    scopes: ["Canal", "Videos", "YouTube Analytics"] },
  metaads:   { label: "Meta Ads",           color: "#1877F2", letter: "f",  cat: "ads",       scopes: ["Ad Account", "Campañas", "Insights", "Audiencias"] },
  googleads: { label: "Google Ads",         color: "#4285F4", letter: "▴",  cat: "ads",       scopes: ["Cuenta MCC", "Campañas", "Conversiones"] },
  tiktokads:  { label: "TikTok Ads",         color: "#010101", letter: "♪",  cat: "ads",       scopes: ["Ads Manager", "Campañas", "Reportes", "Píxel"] },
  linkedinads:{ label: "LinkedIn Ads",       color: "#0A66C2", letter: "in", cat: "ads",       scopes: ["Ad accounts", "Reporting", "Campañas"] },
  ga4:       { label: "Google Analytics 4", color: "#E8710A", letter: "▲",  cat: "analytics", scopes: ["Propiedad GA4", "Eventos", "Conversiones", "Audiencias"] },
  website:   { label: "Sitio Web",          color: "#0D5CA6", letter: "⊕",  cat: "web",       scopes: ["Tracking script", "Uptime", "Formularios"] },
  whatsapp:     { label: "WhatsApp",        color: "#65f042ff", letter: "W",  cat: "inbox",       scopes: ["Tracking script", "Uptime", "Formularios"] },
  facebookInbox:{ label: "Facebook Inbox",  color: "#65f042ff", letter: "f",  cat: "inbox",       scopes: ["Tracking script", "Uptime", "Formularios"] },
  instagramInbox:{ label: "Instagram Inbox",  color: "#65f042ff", letter: "◎",  cat: "inbox",       scopes: ["Tracking script", "Uptime", "Formularios"] },
  tiktokInbox:{ label: "TikTok Inbox",     color: "#65f042ff", letter: "♪",  cat: "inbox",       scopes: ["Tracking script", "Uptime", "Formularios"] },
};

export const CHANNEL_CATEGORIES = [
  { id: "social",    label: "Redes Sociales",   icon: "users"     as const },
  { id: "ads",       label: "Publicidad / Ads",  icon: "megaphone" as const },
  { id: "analytics", label: "Analítica",          icon: "chart"     as const },
  { id: "web",       label: "Sitio Web",          icon: "globe"     as const },
  { id: "inbox",     label: "Inbox",          icon: "inbox"     as const },
];

// ── Connection records ────────────────────────────────────────────────────────
export type ConnRecord = {
  id?: number;
  ch: string;
  account: string | null;
  status: "connected" | "reauth" | "available";
  health: "ok" | "warn" | "err" | null;
  since?: string;
  lastSync?: string;
  // Solo presentes en conexiones reales del backend (no en mocks).
  lastSyncAt?: string | null;
  scopes?: string[];
  brandId?: number;
  accountId?: string;
};

export const CONNECTIONS: Record<string, ConnRecord[]> = {
  auto: [
    { ch: "facebook",  account: "Toyosa Bolivia",      status: "connected", health: "ok",   since: "Mar 2023", lastSync: "hace 5 min" },
    { ch: "instagram", account: "@toyosabolivia",       status: "connected", health: "ok",   since: "Mar 2023", lastSync: "hace 5 min" },
    { ch: "tiktok",    account: "@toyosa.bo",           status: "connected", health: "warn", since: "Ene 2024", lastSync: "hace 12 min" },
    { ch: "linkedin",  account: null,                   status: "available", health: null },
    { ch: "youtube",   account: null,                   status: "available", health: null },
    { ch: "metaads",   account: "Toyosa Ad Account",    status: "connected", health: "ok",   since: "Mar 2023", lastSync: "hace 8 min" },
    { ch: "googleads", account: "987-654-3210",         status: "connected", health: "ok",   since: "Jun 2023", lastSync: "hace 10 min" },
    { ch: "tiktokads", account: "Toyosa TikTok Ads",    status: "connected", health: "ok",   since: "Feb 2024", lastSync: "hace 8 min" },
    { ch: "ga4",       account: "GA4 · toyosa.com.bo",  status: "reauth",    health: "err",  since: "May 2023" },
    { ch: "website",   account: null,                   status: "available", health: null },
  ],
  food: [
    { ch: "facebook",  account: "La Casa del Camba",    status: "connected", health: "ok",   since: "Jun 2023", lastSync: "hace 3 min" },
    { ch: "instagram", account: "@lacasadelcamba.bo",   status: "connected", health: "ok",   since: "Jun 2023", lastSync: "hace 3 min" },
    { ch: "tiktok",    account: "@camba.bo",            status: "connected", health: "ok",   since: "Nov 2023", lastSync: "hace 20 min" },
    { ch: "linkedin",  account: null,                   status: "available", health: null },
    { ch: "youtube",   account: null,                   status: "available", health: null },
    { ch: "metaads",   account: "Camba Ad Account",     status: "connected", health: "warn", since: "Jun 2023", lastSync: "hace 1 h" },
    { ch: "googleads", account: null,                   status: "available", health: null },
    { ch: "tiktokads", account: null,                   status: "available", health: null },
    { ch: "ga4",       account: null,                   status: "available", health: null },
    { ch: "website",   account: "casadelcamba.com.bo",  status: "connected", health: "ok",   since: "Ago 2023", lastSync: "hace 2 min" },
  ],
  bank: [
    { ch: "facebook",  account: "Banco Ganadero",       status: "connected", health: "ok",   since: "Ene 2022", lastSync: "hace 4 min" },
    { ch: "instagram", account: "@bancoganaadero.bo",   status: "connected", health: "ok",   since: "Ene 2022", lastSync: "hace 4 min" },
    { ch: "tiktok",    account: null,                   status: "available", health: null },
    { ch: "linkedin",  account: "Banco Ganadero S.A.",  status: "connected", health: "ok",   since: "Mar 2022", lastSync: "hace 15 min" },
    { ch: "youtube",   account: "Banco Ganadero",       status: "connected", health: "ok",   since: "Jul 2022", lastSync: "hace 30 min" },
    { ch: "metaads",   account: null,                   status: "available", health: null },
    { ch: "googleads", account: "BG-MCC-441-882",       status: "connected", health: "ok",   since: "Feb 2022", lastSync: "hace 6 min" },
    { ch: "tiktokads", account: null,                   status: "available", health: null },
    { ch: "ga4",       account: "GA4 · bgbolivia.com",  status: "connected", health: "ok",   since: "Abr 2022", lastSync: "hace 7 min" },
    { ch: "website",   account: "bgbolivia.com",        status: "connected", health: "ok",   since: "Ene 2022", lastSync: "hace 2 min" },
  ],
  retail: [
    { ch: "facebook",  account: "Hipermaxi Bolivia",    status: "connected", health: "ok",   since: "Abr 2023", lastSync: "hace 6 min" },
    { ch: "instagram", account: "@hipermaxi.bo",        status: "connected", health: "ok",   since: "Abr 2023", lastSync: "hace 6 min" },
    { ch: "tiktok",    account: "@hipermaxi",           status: "connected", health: "warn", since: "Sep 2023", lastSync: "hace 45 min" },
    { ch: "linkedin",  account: null,                   status: "available", health: null },
    { ch: "youtube",   account: null,                   status: "available", health: null },
    { ch: "metaads",   account: null,                   status: "available", health: null },
    { ch: "googleads", account: null,                   status: "available", health: null },
    { ch: "tiktokads", account: null,                   status: "available", health: null },
    { ch: "ga4",       account: null,                   status: "available", health: null },
    { ch: "website",   account: "hipermaxi.com.bo",     status: "connected", health: "ok",   since: "May 2023", lastSync: "hace 2 min" },
  ],
};

// OAuth mock accounts per channel
export const MOCK_ACCOUNTS: Record<string, Array<{ id: string; name: string; meta: string }>> = {
  facebook:  [{ id: "a1", name: "Página principal", meta: "Página · business" }, { id: "a2", name: "Página secundaria", meta: "Página · 41K seguidores" }],
  instagram: [{ id: "a1", name: "@cuenta_business", meta: "Business · conectado vía Facebook" }],
  tiktok:    [{ id: "a1", name: "@cuenta_tiktok",   meta: "Business account" }],
  linkedin:  [{ id: "a1", name: "Company Page",     meta: "Página de empresa" }],
  youtube:   [{ id: "a1", name: "Canal oficial",    meta: "YouTube Analytics" }],
  metaads:   [{ id: "a1", name: "Ad Account principal", meta: "BOB · activo" }, { id: "a2", name: "Ad Account performance", meta: "USD · activo" }],
  googleads: [{ id: "a1", name: "Cuenta MCC",       meta: "Google Ads Manager" }],
  tiktokads: [{ id: "a1", name: "TikTok Ads Manager", meta: "Advertiser activo" }],
  ga4:       [{ id: "a1", name: "Propiedad GA4",    meta: "sitio web · GA4" }],
  website:   [{ id: "a1", name: "Dominio verificado", meta: "Script instalado" }],
};
