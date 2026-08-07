// All analytics mock data — matches ui_kits/portal/data-modules.jsx exactly

// ── Social Analytics ─────────────────────────────────────────────────────────
export const SA_KPIS = [
  { label: "Alcance",           value: "1.94M",  delta: 14.2, spark: [40,52,48,61,58,72,80] },
  { label: "Impresiones",       value: "5.1M",   delta: 9.4,  spark: [60,58,64,70,68,76,82] },
  { label: "Engagement",        value: "4.8%",   delta: 0.6,  spark: [42,44,46,45,47,48,48] },
  { label: "Nuevos seguidores", value: "+8.4K",  delta: 22.1, spark: [20,28,26,34,40,46,54] },
];

export const SA_TREND = {
  reach:  [128,142,135,168,154,182,176,198,205,221,214,242,238,261],
  labels: ["1","","","","5","","","","9","","","","13","14"],
};

export const SA_NETWORKS = [
  { ch: "instagram", followers: "198K", growth: 3.1, eng: "5.4%", posts: 42 },
  { ch: "facebook",  followers: "284K", growth: 1.2, eng: "3.1%", posts: 38 },
  { ch: "tiktok",    followers: "94K",  growth: 9.8, eng: "8.2%", posts: 21 },
  { ch: "youtube",   followers: "22K",  growth: 4.4, eng: "6.0%", posts: 6  },
];

export const SA_AUDIENCE_AGE = [
  { label: "18–24", value: 28, pct: 88 },
  { label: "25–34", value: 36, pct: 100 },
  { label: "35–44", value: 21, pct: 58 },
  { label: "45–54", value: 10, pct: 28 },
  { label: "55+",   value: 5,  pct: 14 },
];

export const SA_GENDER = [
  { label: "Mujeres", value: 54, color: "#34BDF6" },
  { label: "Hombres", value: 44, color: "#0D5CA6" },
  { label: "Otro",    value: 2,  color: "#AFD3EC" },
];

export const SA_GEO = [
  { label: "Santa Cruz",  value: "41%", pct: 100 },
  { label: "La Paz",      value: "23%", pct: 56  },
  { label: "Cochabamba",  value: "18%", pct: 44  },
  { label: "El Alto",     value: "9%",  pct: 22  },
  { label: "Otras",       value: "9%",  pct: 22  },
];

export const TOP_POSTS = [
  { ch: "tiktok",    caption: "Test drive Hilux GR-Sport en el Cristo 🏔️",            reach: "412K", eng: "11.4%", likes: "38K", date: "2 jun" },
  { ch: "instagram", caption: "Nuevo Corolla Cross Hybrid — reserva abierta",          reach: "286K", eng: "6.2%",  likes: "21K", date: "29 may" },
  { ch: "facebook",  caption: "Feria del 0km · hasta 30% de bono",                    reach: "198K", eng: "4.0%",  likes: "9.1K",date: "27 may" },
  { ch: "instagram", caption: "Detrás de cámaras: sesión de fotos RAV4",              reach: "164K", eng: "7.8%",  likes: "14K", date: "24 may" },
];

// ── Paid Media / Ads ─────────────────────────────────────────────────────────
export const ADS_KPIS = [
  { label: "Inversión",     value: "$12.4K", delta: 6.1,  spark: [30,34,38,42,40,48,52] },
  { label: "ROAS",          value: "3.7x",   delta: -3.1, goodDown: false, spark: [42,40,44,41,39,40,38] },
  { label: "Conversiones",  value: "1,284",  delta: 12.8, spark: [22,30,28,36,42,48,55] },
  { label: "CPA",           value: "$9.66",  delta: -8.2, goodDown: true,  spark: [50,46,44,42,40,38,36] },
];

export const ADS_PLATFORMS = [
  { ch: "metaads",   spend: "$6.8K", roas: "4.1x", conv: 712, cpa: "$9.55",  pct: 100 },
  { ch: "googleads", spend: "$3.9K", roas: "3.4x", conv: 388, cpa: "$10.05", pct: 57  },
  { ch: "tiktokads", spend: "$1.7K", roas: "3.0x", conv: 184, cpa: "$9.24",  pct: 25  },
];

export const ADS_CAMPAIGNS = [
  { name: "0km Junio — Conversión",  platform: "metaads",   status: "active",  spend: "$3.2K", roas: "4.4x", conv: 341, budget: 78 },
  { name: "Hilux GR — Tráfico",      platform: "tiktokads", status: "active",  spend: "$1.7K", roas: "3.0x", conv: 184, budget: 64 },
  { name: "Corolla Cross — Leads",   platform: "googleads", status: "active",  spend: "$2.1K", roas: "3.6x", conv: 210, budget: 52 },
  { name: "Retargeting Web",         platform: "metaads",   status: "paused",  spend: "$1.4K", roas: "5.2x", conv: 198, budget: 41 },
  { name: "Branding Q2",             platform: "googleads", status: "active",  spend: "$1.8K", roas: "2.1x", conv: 88,  budget: 90 },
];

export const ADS_SPEND_TREND = [180,210,240,220,260,290,310,280,330,360,340,390];

// ── Web / GA4 ─────────────────────────────────────────────────────────────────
export const WEB_KPIS = [
  { label: "Sesiones",   value: "184K",   delta: 11.3, spark: [40,46,44,52,58,64,70] },
  { label: "Usuarios",   value: "142K",   delta: 9.1,  spark: [38,42,46,50,54,60,66] },
  { label: "Rebote",     value: "38.4%",  delta: -2.2, goodDown: true, spark: [52,50,48,46,44,42,40] },
  { label: "Conv. web",  value: "2.9%",   delta: 0.4,  spark: [30,32,34,33,36,38,40] },
];

export const WEB_SESSIONS_THIS  = [4.2, 4.8, 5.1, 4.6, 5.4, 6.8, 7.2];
export const WEB_SESSIONS_PREV  = [3.8, 4.1, 4.4, 4.0, 4.7, 5.9, 6.3];
export const WEB_SESSION_LABELS = ["L","M","M","J","V","S","D"];

export const WEB_SOURCES = [
  { label: "Búsqueda orgánica", value: "38%", pct: 100, color: "#0D5CA6" },
  { label: "Social",            value: "27%", pct: 71,  color: "#34BDF6" },
  { label: "Directo",           value: "19%", pct: 50,  color: "#0B6E9E" },
  { label: "Paid",              value: "12%", pct: 31,  color: "#F09030" },
  { label: "Referral",          value: "4%",  pct: 11,  color: "#AFD3EC" },
];

export const WEB_PAGES = [
  { path: "/0km/hilux-gr-sport",  views: "42.1K", time: "2:48" },
  { path: "/0km/corolla-cross",   views: "31.6K", time: "3:12" },
  { path: "/",                    views: "28.9K", time: "1:04" },
  { path: "/financiamiento",      views: "19.4K", time: "4:20" },
  { path: "/agencias",            views: "12.2K", time: "1:51" },
];

export const WEB_DEVICES = [
  { label: "Móvil",   value: 71, color: "#0D5CA6" },
  { label: "Desktop", value: 24, color: "#34BDF6" },
  { label: "Tablet",  value: 5,  color: "#AFD3EC" },
];

export const WEB_FUNNEL = [
  { label: "Visita",    count: 184000, pct: 100 },
  { label: "Interés",   count: 42800,  pct: 23.3 },
  { label: "Solicitud", count: 9100,   pct: 4.9 },
  { label: "Conversión",count: 1284,   pct: 0.7 },
];

// ── Calendar ──────────────────────────────────────────────────────────────────
export const CAL_MONTH = "Junio 2026";
export type PostStatus = "published" | "scheduled" | "review" | "draft";
export type CalPost = { id: string; day: number; ch: string; st: PostStatus; t: string; time: string };

export const CAL_POSTS_RAW: Record<number, Array<{ ch: string; st: PostStatus; t: string }>> = {
  3:  [{ ch: "instagram", st: "scheduled", t: "Reel: city drive" }],
  4:  [{ ch: "facebook",  st: "published", t: "Promo financiamiento" }, { ch: "tiktok", st: "scheduled", t: "Trend audio" }],
  6:  [{ ch: "instagram", st: "draft",     t: "Carrusel specs" }],
  9:  [{ ch: "tiktok",    st: "scheduled", t: "POV test drive" }, { ch: "youtube",   st: "review",    t: "Review largo" }],
  11: [{ ch: "facebook",  st: "scheduled", t: "Evento feria" }],
  12: [{ ch: "instagram", st: "scheduled", t: "Story interactiva" }, { ch: "instagram", st: "scheduled", t: "Reel BTS" }],
  16: [{ ch: "tiktok",    st: "draft",     t: "Duet cliente" }],
  18: [{ ch: "youtube",   st: "scheduled", t: "Walkaround RAV4" }],
  19: [{ ch: "facebook",  st: "review",    t: "Testimonios" }],
  23: [{ ch: "instagram", st: "scheduled", t: "Lanzamiento Hybrid" }, { ch: "tiktok", st: "scheduled", t: "Teaser" }, { ch: "facebook", st: "scheduled", t: "Live evento" }],
  25: [{ ch: "instagram", st: "draft",     t: "UGC repost" }],
  27: [{ ch: "tiktok",    st: "scheduled", t: "Behind scenes" }],
};

export const POST_STATUS_META: Record<PostStatus, { color: string; label: string }> = {
  published: { color: "#40AD5A", label: "Publicado" },
  scheduled: { color: "#0D5CA6", label: "Programado" },
  review:    { color: "#F09030", label: "En revisión" },
  draft:     { color: "#939393", label: "Borrador" },
};

// ── Approvals ─────────────────────────────────────────────────────────────────
export type ApprovalStatus = "pending" | "approved" | "rejected" | "changes";
export type Approval = {
  id: number; ch: string; title: string; by: string; role: string;
  when: string; caption: string; ratio: string; due: string;
  status: ApprovalStatus;
};

export const APPROVALS_DATA: Approval[] = [
  { id: 1, ch: "instagram", title: "Reel — Lanzamiento Corolla Cross Hybrid", by: "Diego Áñez",   role: "Content", when: "hace 2 h", caption: "El primer híbrido de su clase llega a Bolivia ⚡ Reserva ya en toyosa.com.bo",     ratio: "9/16", due: "Hoy 18:00",  status: "pending" },
  { id: 2, ch: "facebook",  title: "Post — Feria del 0km, bono hasta 30%",    by: "Lucía Vargas", role: "Copy",    when: "hace 4 h", caption: "Del 20 al 30 de junio · financiamiento desde 0% de interés",                       ratio: "1/1",  due: "Mañana",     status: "pending" },
  { id: 3, ch: "tiktok",    title: "Video — POV test drive Hilux GR",          by: "Diego Áñez",   role: "Content", when: "ayer",     caption: "POV: te entregan la Hilux GR-Sport 2026 🔥",                                       ratio: "9/16", due: "23 jun",     status: "pending" },
  { id: 4, ch: "instagram", title: "Carrusel — Specs Corolla Cross",           by: "Lucía Vargas", role: "Copy",    when: "ayer",     caption: "Todo lo que necesitas saber sobre el Corolla Cross 2026 en una sola publicación", ratio: "1/1",  due: "24 jun",     status: "changes" },
];

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const CAMPAIGNS_DATA = [
  { id: "c1", name: "Lanzamiento Corolla Cross Hybrid", status: "active",    channels: ["instagram","tiktok","metaads","googleads"], start: "1 jun",  end: "30 jun", budget: "$8.0K",  spent: 62,  kpi: "1,284 leads",   goal: "Leads" },
  { id: "c2", name: "Feria del 0km — Junio",           status: "active",    channels: ["facebook","instagram","metaads"],           start: "20 jun", end: "30 jun", budget: "$5.5K",  spent: 18,  kpi: "418 reservas",  goal: "Conversión" },
  { id: "c3", name: "Always-On Branding Q2",           status: "active",    channels: ["instagram","youtube","googleads"],          start: "1 abr",  end: "30 jun", budget: "$12K",   spent: 84,  kpi: "2.6M alcance",  goal: "Awareness" },
  { id: "c4", name: "Hilux GR-Sport — Hype",           status: "scheduled", channels: ["tiktok","tiktokads"],                       start: "25 jun", end: "15 jul", budget: "$4.2K",  spent: 0,   kpi: "—",             goal: "Tráfico" },
  { id: "c5", name: "Día del Padre",                   status: "ended",     channels: ["facebook","instagram"],                     start: "5 jun",  end: "16 jun", budget: "$2.8K",  spent: 100, kpi: "3.1x ROAS",     goal: "Conversión" },
];

export const CAMP_STATUS_META: Record<string, { variant: string; label: string }> = {
  active:    { variant: "success", label: "Activa" },
  scheduled: { variant: "primary", label: "Programada" },
  ended:     { variant: "neutral", label: "Finalizada" },
  paused:    { variant: "warning", label: "Pausada" },
};

// ── Influencers ───────────────────────────────────────────────────────────────
export type InfluencerTier = "Nano" | "Micro" | "Macro" | "Mega";
export type InfluencerStatus = "active" | "negotiation" | "prospect";

export type InfluencerItem = {
  id: string;
  name: string;
  handle: string;
  ch: string;
  followers: string;
  eng: string;
  tier: InfluencerTier;
  status: InfluencerStatus;
  deals: number;
  category?: string;
  city?: string;
  rating?: number;
  networks?: { ch: string; followers: string }[];
  tint?: string;
  contact?: {
    email: string;
    phone: string;
    manager: string;
  };
  joinedAt?: string;
  rateCard?: Record<string, number>;
  cpe?: number;
  cpm?: number;
  roi?: number;
  reach?: string;
  audience?: {
    gender: { label: string; value: number }[];
    ageBands: { label: string; value: number }[];
    cities: { label: string; value: number }[];
  };
  monthlyMetrics?: { date: string; followers: number; engagement: number }[];
};

export const INFLUENCERS_DATA: InfluencerItem[] = [
  {
    id: "i1",
    name: "Cami Justiniano",
    handle: "@camijusti",
    ch: "instagram",
    followers: "412K",
    eng: "6.8%",
    tier: "Macro",
    status: "active",
    deals: 3,
    category: "Moda & Lifestyle",
    city: "Santa Cruz",
    rating: 4.8,
    networks: [{ ch: "instagram", followers: "412K" }, { ch: "tiktok", followers: "128K" }],
    tint: "#0D5CA6",
    contact: { email: "cami@camimedia.bo", phone: "+591 700 11 220", manager: "Lia Roca (Mgmt)" },
    joinedAt: "Mar 2023",
    rateCard: { Post: 1200, Story: 450, Reel: 1800, Video: 2600 },
    cpe: 0.42,
    cpm: 8.10,
    roi: 4.2,
    reach: "184K",
    audience: {
      gender: [{ label: "Mujeres", value: 64 }, { label: "Hombres", value: 34 }, { label: "Otro", value: 2 }],
      ageBands: [{ label: "18–24", value: 31 }, { label: "25–34", value: 36 }, { label: "35–44", value: 22 }, { label: "45+", value: 11 }],
      cities: [{ label: "Santa Cruz", value: 47 }, { label: "Cochabamba", value: 19 }, { label: "La Paz", value: 16 }, { label: "Otros", value: 18 }],
    },
    monthlyMetrics: [
      { date: "Dic", followers: 380, engagement: 6.2 },
      { date: "Ene", followers: 388, engagement: 6.4 },
      { date: "Feb", followers: 392, engagement: 6.3 },
      { date: "Mar", followers: 398, engagement: 6.6 },
      { date: "Abr", followers: 401, engagement: 6.7 },
      { date: "May", followers: 407, engagement: 6.8 },
      { date: "Jun", followers: 412, engagement: 6.8 },
    ],
  },
  {
    id: "i2",
    name: "El Choco Bolivia",
    handle: "@elchoco.bo",
    ch: "tiktok",
    followers: "1.2M",
    eng: "9.4%",
    tier: "Mega",
    status: "active",
    deals: 2,
    category: "Comedia & Entretenimiento",
    city: "Santa Cruz",
    rating: 4.9,
    networks: [{ ch: "tiktok", followers: "1.2M" }, { ch: "instagram", followers: "580K" }, { ch: "youtube", followers: "320K" }],
    tint: "#11181C",
    contact: { email: "bookings@elchoco.bo", phone: "+591 712 99 010", manager: "Choco Media SRL" },
    joinedAt: "Ene 2024",
    rateCard: { Post: 2500, Story: 900, Reel: 4000, Video: 5500 },
    cpe: 0.31,
    cpm: 6.40,
    roi: 5.1,
    reach: "640K",
    audience: {
      gender: [{ label: "Mujeres", value: 49 }, { label: "Hombres", value: 49 }, { label: "Otro", value: 2 }],
      ageBands: [{ label: "18–24", value: 42 }, { label: "25–34", value: 33 }, { label: "35–44", value: 17 }, { label: "45+", value: 8 }],
      cities: [{ label: "Santa Cruz", value: 38 }, { label: "La Paz", value: 24 }, { label: "El Alto", value: 14 }, { label: "Otros", value: 24 }],
    },
    monthlyMetrics: [
      { date: "Dic", followers: 1080, engagement: 8.6 },
      { date: "Ene", followers: 1110, engagement: 8.9 },
      { date: "Feb", followers: 1140, engagement: 9.0 },
      { date: "Mar", followers: 1155, engagement: 9.2 },
      { date: "Abr", followers: 1170, engagement: 9.3 },
      { date: "May", followers: 1188, engagement: 9.4 },
      { date: "Jun", followers: 1200, engagement: 9.4 },
    ],
  },
  {
    id: "i3",
    name: "Cruceño al Volante",
    handle: "@cruvolante",
    ch: "youtube",
    followers: "94K",
    eng: "7.2%",
    tier: "Micro",
    status: "active",
    deals: 3,
    category: "Autos & Motor",
    city: "Santa Cruz",
    rating: 4.7,
    networks: [{ ch: "youtube", followers: "94K" }, { ch: "instagram", followers: "52K" }],
    tint: "#CF3136",
    contact: { email: "alfredo@cruvolante.bo", phone: "+591 707 33 441", manager: "Directo" },
    joinedAt: "Jun 2023",
    rateCard: { Post: 400, Story: 150, Reel: 600, Video: 1100 },
    cpe: 0.28,
    cpm: 5.20,
    roi: 6.0,
    reach: "61K",
    audience: {
      gender: [{ label: "Mujeres", value: 22 }, { label: "Hombres", value: 76 }, { label: "Otro", value: 2 }],
      ageBands: [{ label: "18–24", value: 24 }, { label: "25–34", value: 38 }, { label: "35–44", value: 26 }, { label: "45+", value: 12 }],
      cities: [{ label: "Santa Cruz", value: 52 }, { label: "Cochabamba", value: 21 }, { label: "La Paz", value: 15 }, { label: "Otros", value: 12 }],
    },
    monthlyMetrics: [
      { date: "Dic", followers: 82, engagement: 6.6 },
      { date: "Ene", followers: 84, engagement: 6.8 },
      { date: "Feb", followers: 86, engagement: 6.9 },
      { date: "Mar", followers: 88, engagement: 7.0 },
      { date: "Abr", followers: 90, engagement: 7.1 },
      { date: "May", followers: 92, engagement: 7.2 },
      { date: "Jun", followers: 94, engagement: 7.2 },
    ],
  },
  {
    id: "i4",
    name: "Naty Style",
    handle: "@natystyle",
    ch: "instagram",
    followers: "186K",
    eng: "5.1%",
    tier: "Macro",
    status: "negotiation",
    deals: 1,
    category: "Moda & Belleza",
    city: "Cochabamba",
    rating: 4.4,
    networks: [{ ch: "instagram", followers: "186K" }],
    tint: "#E1306C",
    contact: { email: "naty@natystyle.bo", phone: "+591 715 22 880", manager: "Glam Agency" },
    joinedAt: "—",
    rateCard: { Post: 900, Story: 350, Reel: 1300, Video: 1900 },
    cpe: 0.55,
    cpm: 9.80,
    roi: 3.4,
    reach: "78K",
    audience: {
      gender: [{ label: "Mujeres", value: 81 }, { label: "Hombres", value: 17 }, { label: "Otro", value: 2 }],
      ageBands: [{ label: "18–24", value: 38 }, { label: "25–34", value: 34 }, { label: "35–44", value: 18 }, { label: "45+", value: 10 }],
      cities: [{ label: "Cochabamba", value: 44 }, { label: "Santa Cruz", value: 26 }, { label: "La Paz", value: 18 }, { label: "Otros", value: 12 }],
    },
    monthlyMetrics: [
      { date: "Dic", followers: 172, engagement: 4.8 },
      { date: "Ene", followers: 175, engagement: 4.9 },
      { date: "Feb", followers: 178, engagement: 5.0 },
      { date: "Mar", followers: 180, engagement: 5.0 },
      { date: "Abr", followers: 182, engagement: 5.1 },
      { date: "May", followers: 184, engagement: 5.1 },
      { date: "Jun", followers: 186, engagement: 5.1 },
    ],
  },
  {
    id: "i5",
    name: "Andrea Foodie",
    handle: "@andreafoodie",
    ch: "tiktok",
    followers: "58K",
    eng: "11.0%",
    tier: "Micro",
    status: "prospect",
    deals: 0,
    category: "Gastronomía",
    city: "Santa Cruz",
    rating: 4.6,
    networks: [{ ch: "tiktok", followers: "58K" }, { ch: "instagram", followers: "34K" }],
    tint: "#F09030",
    contact: { email: "andrea.foodie@gmail.com", phone: "+591 709 44 112", manager: "Directo" },
    joinedAt: "—",
    rateCard: { Post: 280, Story: 120, Reel: 450, Video: 700 },
    cpe: 0.22,
    cpm: 4.10,
    roi: 0,
    reach: "44K",
    audience: {
      gender: [{ label: "Mujeres", value: 68 }, { label: "Hombres", value: 30 }, { label: "Otro", value: 2 }],
      ageBands: [{ label: "18–24", value: 36 }, { label: "25–34", value: 38 }, { label: "35–44", value: 18 }, { label: "45+", value: 8 }],
      cities: [{ label: "Santa Cruz", value: 58 }, { label: "La Paz", value: 16 }, { label: "Cochabamba", value: 14 }, { label: "Otros", value: 12 }],
    },
    monthlyMetrics: [
      { date: "Dic", followers: 48, engagement: 10.2 },
      { date: "Ene", followers: 50, engagement: 10.5 },
      { date: "Feb", followers: 52, engagement: 10.7 },
      { date: "Mar", followers: 54, engagement: 10.8 },
      { date: "Abr", followers: 55, engagement: 10.9 },
      { date: "May", followers: 57, engagement: 11.0 },
      { date: "Jun", followers: 58, engagement: 11.0 },
    ],
  },
  {
    id: "i6",
    name: "Dani Vlogs",
    handle: "@danivlogs.bo",
    ch: "instagram",
    followers: "240K",
    eng: "6.0%",
    tier: "Macro",
    status: "active",
    deals: 2,
    category: "Viajes & Lifestyle",
    city: "La Paz",
    rating: 4.5,
    networks: [{ ch: "instagram", followers: "240K" }, { ch: "tiktok", followers: "180K" }, { ch: "youtube", followers: "95K" }],
    tint: "#0B6E9E",
    contact: { email: "hola@danivlogs.bo", phone: "+591 718 60 905", manager: "Andes Talent" },
    joinedAt: "Feb 2024",
    rateCard: { Post: 1000, Story: 380, Reel: 1500, Video: 2200 },
    cpe: 0.47,
    cpm: 8.60,
    roi: 3.8,
    reach: "112K",
    audience: {
      gender: [{ label: "Mujeres", value: 52 }, { label: "Hombres", value: 46 }, { label: "Otro", value: 2 }],
      ageBands: [{ label: "18–24", value: 29 }, { label: "25–34", value: 38 }, { label: "35–44", value: 23 }, { label: "45+", value: 10 }],
      cities: [{ label: "La Paz", value: 41 }, { label: "Santa Cruz", value: 28 }, { label: "Cochabamba", value: 17 }, { label: "Otros", value: 14 }],
    },
    monthlyMetrics: [
      { date: "Dic", followers: 218, engagement: 5.6 },
      { date: "Ene", followers: 224, engagement: 5.7 },
      { date: "Feb", followers: 228, engagement: 5.8 },
      { date: "Mar", followers: 232, engagement: 5.9 },
      { date: "Abr", followers: 235, engagement: 5.9 },
      { date: "May", followers: 238, engagement: 6.0 },
      { date: "Jun", followers: 240, engagement: 6.0 },
    ],
  },
  {
    id: "i7",
    name: "Fer Fitness",
    handle: "@ferfit.bo",
    ch: "instagram",
    followers: "72K",
    eng: "8.4%",
    tier: "Micro",
    status: "active",
    deals: 1,
    category: "Fitness & Salud",
    city: "Santa Cruz",
    rating: 4.7,
    networks: [{ ch: "instagram", followers: "72K" }, { ch: "tiktok", followers: "48K" }],
    tint: "#1E8A5B",
    contact: { email: "fer@ferfit.bo", phone: "+591 703 77 559", manager: "Directo" },
    joinedAt: "May 2024",
    rateCard: { Post: 350, Story: 130, Reel: 520, Video: 850 },
    cpe: 0.26,
    cpm: 4.90,
    roi: 4.7,
    reach: "39K",
    audience: {
      gender: [{ label: "Mujeres", value: 58 }, { label: "Hombres", value: 40 }, { label: "Otro", value: 2 }],
      ageBands: [{ label: "18–24", value: 34 }, { label: "25–34", value: 38 }, { label: "35–44", value: 19 }, { label: "45+", value: 9 }],
      cities: [{ label: "Santa Cruz", value: 61 }, { label: "Cochabamba", value: 15 }, { label: "La Paz", value: 13 }, { label: "Otros", value: 11 }],
    },
    monthlyMetrics: [
      { date: "Dic", followers: 62, engagement: 7.8 },
      { date: "Ene", followers: 64, engagement: 8.0 },
      { date: "Feb", followers: 66, engagement: 8.1 },
      { date: "Mar", followers: 68, engagement: 8.2 },
      { date: "Abr", followers: 69, engagement: 8.3 },
      { date: "May", followers: 71, engagement: 8.4 },
      { date: "Jun", followers: 72, engagement: 8.4 },
    ],
  },
];

export const INF_STATUS_META: Record<InfluencerStatus, { variant: string; label: string }> = {
  active:      { variant: "success", label: "Activo" },
  negotiation: { variant: "warning", label: "Negociando" },
  prospect:    { variant: "neutral", label: "Prospecto" },
};

export const TIER_COLORS: Record<InfluencerTier, string> = {
  Mega:  "#F09030",
  Macro: "#0D5CA6",
  Micro: "#34BDF6",
  Nano:  "#AFD3EC",
};

// ── Briefs ────────────────────────────────────────────────────────────────────
export type BriefStatus = "borrador" | "enviado" | "firmado" | "activo";
export type Brief = {
  id: string; influencerId: string; title: string; objective: string;
  deliverables: string; startDate: string; endDate: string; status: BriefStatus;
  hashtags: string[]; mentions: string[]; dos: string; donts: string;
  createdAt: string;
};

export const BRIEFS_META: Record<BriefStatus, { variant: string; label: string }> = {
  borrador: { variant: "neutral", label: "Borrador" },
  enviado:  { variant: "primary", label: "Enviado" },
  firmado:  { variant: "success", label: "Firmado" },
  activo:   { variant: "success", label: "Activo" },
};

export const BRIEFS_DATA: Brief[] = [
  { id: "BR-001", influencerId: "i1", title: "Reel: City Drive", objective: "2M alcance, 5% engagement", deliverables: "1 Reel 60-90s\n3 Stories\nCarousel", startDate: "5 jun", endDate: "19 jun", status: "enviado", hashtags: ["#Toyosa", "#0km", "#CityDrive"], mentions: ["@toyosa", "@vehiculos"], dos: "Mostrar el interior del auto\nDestacad velocidad", donts: "No mostrar accidentes", createdAt: "1 jun" },
  { id: "BR-002", influencerId: "i2", title: "TikTok: Test Drive x2", objective: "3M reach, 8% engagement", deliverables: "2 TikToks 30-45s\n5 Duets permitidos", startDate: "10 jun", endDate: "25 jun", status: "firmado", hashtags: ["#HiluxGR", "#TestDrive"], mentions: ["@toyosa"], dos: "Energía alta\nMúsica uptempo", donts: "Nada estático", createdAt: "2 jun" },
  { id: "BR-003", influencerId: "i3", title: "Instagram: Specs Corolla", objective: "1.5M reach", deliverables: "1 Carrusel 10 slides", startDate: "11 jun", endDate: "20 jun", status: "borrador", hashtags: ["#Corolla", "#Hybrid"], mentions: ["@toyosa", "@eco"], dos: "Detalles técnicos", donts: "Comparaciones con competencia", createdAt: "3 jun" },
  { id: "BR-004", influencerId: "i4", title: "YouTube: Walkaround RAV4", objective: "500K views", deliverables: "1 Video 3-5 min", startDate: "15 jun", endDate: "30 jun", status: "activo", hashtags: ["#RAV4", "#2026"], mentions: ["@toyosa"], dos: "Review honesto", donts: "Spoilers de próximos modelos", createdAt: "4 jun" },
  { id: "BR-005", influencerId: "i5", title: "TikTok: POV Test Drive", objective: "5M reach, 10% eng", deliverables: "3 TikToks 15-20s\nChoreography trend", startDate: "8 jun", endDate: "22 jun", status: "borrador", hashtags: ["#POV", "#TestDrive"], mentions: ["@toyosa"], dos: "Uso de trending audio", donts: "Demasiado branding", createdAt: "5 jun" },
  { id: "BR-006", influencerId: "i1", title: "Instagram: BTS Sesión Fotos", objective: "Reach 800K", deliverables: "5 Posts + 10 Stories", startDate: "12 jun", endDate: "28 jun", status: "firmado", hashtags: ["#BTS", "#Behind"], mentions: ["@toyosa"], dos: "Mostrar proceso", donts: "Caras sin autorizar", createdAt: "6 jun" },
];

// ── Products ────────────────────────────────────────────────────────────────────
export type ProductStatus = "borrador" | "enviado" | "firmado" | "activo";
export type Product = {
  id: string; influencerId: string; title: string; objective: string;
  deliverables: string; startDate: string; endDate: string; status: ProductStatus;
  hashtags: string[]; mentions: string[]; dos: string; donts: string;
  createdAt: string;
};

export const PRODUCTS_META: Record<ProductStatus, { variant: string; label: string }> = {
  borrador: { variant: "neutral", label: "Borrador" },
  enviado:  { variant: "primary", label: "Enviado" },
  firmado:  { variant: "success", label: "Firmado" },
  activo:   { variant: "success", label: "Activo" },
};

export const PRODUCTS_DATA: Product[] = [
  { id: "PR-001", influencerId: "i1", title: "Reel: City Drive", objective: "2M alcance, 5% engagement", deliverables: "1 Reel 60-90s\n3 Stories\nCarousel", startDate: "5 jun", endDate: "19 jun", status: "enviado", hashtags: ["#Toyosa", "#0km", "#CityDrive"], mentions: ["@toyosa", "@vehiculos"], dos: "Mostrar el interior del auto\nDestacad velocidad", donts: "No mostrar accidentes", createdAt: "1 jun" },
  { id: "BR-002", influencerId: "i2", title: "TikTok: Test Drive x2", objective: "3M reach, 8% engagement", deliverables: "2 TikToks 30-45s\n5 Duets permitidos", startDate: "10 jun", endDate: "25 jun", status: "firmado", hashtags: ["#HiluxGR", "#TestDrive"], mentions: ["@toyosa"], dos: "Energía alta\nMúsica uptempo", donts: "Nada estático", createdAt: "2 jun" },
  { id: "BR-003", influencerId: "i3", title: "Instagram: Specs Corolla", objective: "1.5M reach", deliverables: "1 Carrusel 10 slides", startDate: "11 jun", endDate: "20 jun", status: "borrador", hashtags: ["#Corolla", "#Hybrid"], mentions: ["@toyosa", "@eco"], dos: "Detalles técnicos", donts: "Comparaciones con competencia", createdAt: "3 jun" },
  { id: "BR-004", influencerId: "i4", title: "YouTube: Walkaround RAV4", objective: "500K views", deliverables: "1 Video 3-5 min", startDate: "15 jun", endDate: "30 jun", status: "activo", hashtags: ["#RAV4", "#2026"], mentions: ["@toyosa"], dos: "Review honesto", donts: "Spoilers de próximos modelos", createdAt: "4 jun" },
  { id: "BR-005", influencerId: "i5", title: "TikTok: POV Test Drive", objective: "5M reach, 10% eng", deliverables: "3 TikToks 15-20s\nChoreography trend", startDate: "8 jun", endDate: "22 jun", status: "borrador", hashtags: ["#POV", "#TestDrive"], mentions: ["@toyosa"], dos: "Uso de trending audio", donts: "Demasiado branding", createdAt: "5 jun" },
  { id: "BR-006", influencerId: "i1", title: "Instagram: BTS Sesión Fotos", objective: "Reach 800K", deliverables: "5 Posts + 10 Stories", startDate: "12 jun", endDate: "28 jun", status: "firmado", hashtags: ["#BTS", "#Behind"], mentions: ["@toyosa"], dos: "Mostrar proceso", donts: "Caras sin autorizar", createdAt: "6 jun" },
];

// ── Contracts ─────────────────────────────────────────────────────────────────
export type ContractType = "Reel" | "Reels" | "Stories" | "Post" | "Campaña" | "Video";
export type SignatureStatus = "pendiente" | "firmado" | "vencido";
export type Contract = {
  id: string; influencerId: string; briefId: string; type: ContractType;
  amount: number; conditions: string; signatureStatus: SignatureStatus;
  expiresAt: string; createdAt: string;
};

export const CONTRACT_TYPES: ContractType[] = ["Reel", "Reels", "Stories", "Post", "Campaña", "Video"];

export const CONTRACTS_META: Record<SignatureStatus, { variant: string; label: string }> = {
  pendiente: { variant: "warning", label: "Pendiente" },
  firmado:   { variant: "success", label: "Firmado" },
  vencido:   { variant: "error", label: "Vencido" },
};

export const CONTRACTS_DATA: Contract[] = [
  { id: "CT-001", influencerId: "i1", briefId: "BR-001", type: "Reel", amount: 500, conditions: "Cumplimiento de briefing 100%\nDerechos de uso por 90 días", signatureStatus: "firmado", expiresAt: "19 jun 2026", createdAt: "5 jun" },
  { id: "CT-002", influencerId: "i2", briefId: "BR-002", type: "Reels", amount: 800, conditions: "Exclusividad en TikTok por 60 días\nMáximo 2 cambios de creatividad", signatureStatus: "pendiente", expiresAt: "25 jun 2026", createdAt: "10 jun" },
  { id: "CT-003", influencerId: "i3", briefId: "BR-003", type: "Post", amount: 350, conditions: "Fijo a la fecha especificada\nPermanente en el perfil", signatureStatus: "pendiente", expiresAt: "20 jun 2026", createdAt: "11 jun" },
  { id: "CT-004", influencerId: "i4", briefId: "BR-004", type: "Video", amount: 1200, conditions: "YouTube monetization compartida 50/50\n4 revisiones permitidas", signatureStatus: "firmado", expiresAt: "30 jun 2026", createdAt: "15 jun" },
  { id: "CT-005", influencerId: "i5", briefId: "BR-005", type: "Reels", amount: 600, conditions: "3 cambios de concepto\nLanzamiento en fecha acordada", signatureStatus: "pendiente", expiresAt: "22 jun 2026", createdAt: "8 jun" },
  { id: "CT-006", influencerId: "i1", briefId: "BR-006", type: "Post", amount: 400, conditions: "Coautoría editorial\nDerecho a editar hasta 24h antes", signatureStatus: "firmado", expiresAt: "28 jun 2026", createdAt: "12 jun" },
  { id: "CT-007", influencerId: "i2", briefId: "BR-001", type: "Campaña", amount: 2500, conditions: "Contrato maestro por 6 meses\nRevision mensual de KPIs", signatureStatus: "vencido", expiresAt: "5 jun 2026", createdAt: "1 may" },
];

// ── Social Inbox ──────────────────────────────────────────────────────────────
export const INBOX_ITEMS = [
  { id: 1, ch: "instagram", kind: "DM",         who: "@mariela_sc",  msg: "Hola! Está disponible la Hilux GR en color blanco?",    when: "hace 4 min",  unread: true,  avatar: "MS", tint: "#0D5CA6" },
  { id: 2, ch: "tiktok",    kind: "Comentario", who: "@juancho.bo",  msg: "Cuánto sale el inicial? 👀",                             when: "hace 12 min", unread: true,  avatar: "JB", tint: "#E1306C" },
  { id: 3, ch: "facebook",  kind: "Comentario", who: "Rosa Mendoza", msg: "Hacen envíos a Cochabamba?",                             when: "hace 38 min", unread: true,  avatar: "RM", tint: "#40AD5A" },
  { id: 4, ch: "instagram", kind: "Comentario", who: "@andres.q",    msg: "El mejor 0km del mercado 🔥🔥",                          when: "hace 1 h",   unread: false, avatar: "AQ", tint: "#F09030" },
  { id: 5, ch: "facebook",  kind: "DM",         who: "Pablo Áñez",   msg: "Quisiera agendar un test drive para el sábado",         when: "hace 2 h",   unread: false, avatar: "PA", tint: "#0B6E9E" },
];

export const INBOX_THREAD = [
  { from: "them" as const, text: "Hola! Está disponible la Hilux GR en color blanco?",                                                       when: "10:24" },
  { from: "me"   as const, text: "¡Hola Mariela! 👋 Sí, tenemos unidades en blanco perla disponibles en la agencia de 3er Anillo.",          when: "10:26", by: "María R." },
  { from: "them" as const, text: "Perfecto. Cuál es el precio y financiamiento?",                                                             when: "10:28" },
];

// ── Requests ──────────────────────────────────────────────────────────────────
export const REQUESTS_DATA = [
  { id: "SOL-241", title: "Arte para promo Día del Padre",       brand: "Toyosa Motors",      pri: "alta",  status: "abierta",  by: "Cliente · Marketing", when: "hace 1 h", type: "Diseño" },
  { id: "SOL-238", title: "Reporte mensual mayo en PDF",         brand: "Banco Ganadero",     pri: "media", status: "progreso", by: "Cuenta",              when: "hace 5 h", type: "Reporte" },
  { id: "SOL-235", title: "Programar campaña feria 0km",         brand: "Toyosa Motors",      pri: "alta",  status: "progreso", by: "Pauta",               when: "ayer",     type: "Pauta" },
  { id: "SOL-230", title: "Responder reseñas Google",            brand: "Hipermaxi",          pri: "baja",  status: "abierta",  by: "Community",           when: "ayer",     type: "CM" },
  { id: "SOL-228", title: "Sesión de fotos producto",            brand: "La Casa del Camba",  pri: "media", status: "cerrada",  by: "Producción",          when: "2 jun",    type: "Producción" },
];

export const REQ_PRI_META: Record<string, string>    = { alta: "error", media: "warning", baja: "neutral" };
export const REQ_STATUS_META: Record<string, { variant: string; label: string }> = {
  abierta:  { variant: "primary", label: "Abierta" },
  progreso: { variant: "warning", label: "En progreso" },
  cerrada:  { variant: "success", label: "Cerrada" },
};

// ── AI Insights ───────────────────────────────────────────────────────────────
export const AI_INSIGHTS = [
  { kind: "win",  icon: "arrowUp", title: "TikTok es tu canal de mayor crecimiento",   body: "El engagement en TikTok (8.2%) supera 2.6× el promedio de tus otras redes. Los videos de test drive concentran el 71% del alcance del mes.",          action: "Duplicar presupuesto de contenido TikTok" },
  { kind: "warn", icon: "bell",    title: "El ROAS de 'Branding Q2' cayó 18%",         body: "La campaña de Google Ads gastó el 90% del presupuesto con un ROAS de 2.1x, por debajo del objetivo de 3.0x. La fatiga de creativos es probable.",     action: "Refrescar creativos y reasignar pauta" },
  { kind: "idea", icon: "spark",   title: "Mejor horario para publicar: 19:00–21:00",  body: "Las publicaciones entre las 19h y 21h obtienen 34% más engagement. Actualmente solo el 22% de tu contenido sale en esa franja.",                     action: "Reprogramar calendario de junio" },
  { kind: "win",  icon: "users",   title: "Audiencia femenina 25–34 en alza",          body: "El segmento mujeres 25–34 creció 4 pts este mes y muestra el mayor CTR en Ads. Vale la pena un mensaje dedicado.",                                   action: "Crear audiencia personalizada en Meta" },
];

export const AI_TONE: Record<string, { bg: string; color: string }> = {
  win:  { bg: "var(--color-success-bg)",  color: "var(--color-success)" },
  warn: { bg: "var(--color-warning-bg)",  color: "var(--color-warning)" },
  idea: { bg: "var(--color-secondary-subtle)", color: "var(--color-secondary-ink)" },
};

// ── Posts ─────────────────────────────────────────────────────────────────────
export const POSTS_DATA = [
  { id: "p1", ch: "tiktok",    caption: "Test drive Hilux GR-Sport en el Cristo 🏔️", status: "published", date: "2 jun",  reach: "412K", eng: "11.4%", likes: "38K" },
  { id: "p2", ch: "instagram", caption: "Nuevo Corolla Cross Hybrid — reserva abierta",              status: "published", date: "29 may", reach: "286K", eng: "6.2%",  likes: "21K" },
  { id: "p3", ch: "facebook",  caption: "Feria del 0km · hasta 30% de bono",                        status: "published", date: "27 may", reach: "198K", eng: "4.0%",  likes: "9.1K" },
  { id: "p4", ch: "instagram", caption: "Detrás de cámaras: sesión de fotos RAV4",                   status: "published", date: "24 may", reach: "164K", eng: "7.8%",  likes: "14K" },
  { id: "p5", ch: "tiktok",    caption: "POV test drive Hilux GR",                                   status: "scheduled", date: "10 jun", reach: "—",    eng: "—",      likes: "—" },
  { id: "p6", ch: "instagram", caption: "Reel — Lanzamiento Corolla Cross Hybrid",                   status: "review",    date: "11 jun", reach: "—",    eng: "—",      likes: "—" },
  { id: "p7", ch: "facebook",  caption: "Evento feria 0km — ¡Te esperamos!",                         status: "scheduled", date: "11 jun", reach: "—",    eng: "—",      likes: "—" },
  { id: "p8", ch: "instagram", caption: "Story interactiva: ¿cuál es tu Toyosa ideal?",              status: "draft",     date: "12 jun", reach: "—",    eng: "—",      likes: "—" },
];
