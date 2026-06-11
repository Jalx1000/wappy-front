import { http, HttpResponse } from "msw";
import { BRANDS, KPIS, ALERTS, CONNECTIONS, MOCK_ACCOUNTS } from "./data";
import {
  SA_KPIS, SA_TREND, SA_NETWORKS, SA_AUDIENCE_AGE, SA_GENDER, SA_GEO, TOP_POSTS,
  ADS_KPIS, ADS_PLATFORMS, ADS_CAMPAIGNS, ADS_SPEND_TREND,
  WEB_KPIS, WEB_SESSIONS_THIS, WEB_SESSIONS_PREV, WEB_SESSION_LABELS,
  WEB_SOURCES, WEB_PAGES, WEB_DEVICES, WEB_FUNNEL,
  APPROVALS_DATA, CAMPAIGNS_DATA, INFLUENCERS_DATA,
  INBOX_ITEMS, INBOX_THREAD,
  REQUESTS_DATA, AI_INSIGHTS, POSTS_DATA,
  CAL_POSTS_RAW, POST_STATUS_META,
  BRIEFS_DATA, CONTRACTS_DATA,
  type Brief, type Contract,
} from "./analyticsData";

const BASE = "/api";

export const handlers = [
  // ── Brands ────────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands`, () => HttpResponse.json(BRANDS)),

  http.get(`${BASE}/brands/:brandId/connections`, ({ params }) => {
    const conns = CONNECTIONS[params.brandId as string] ?? [];
    return HttpResponse.json(conns);
  }),

  http.post(`${BASE}/brands/:brandId/connections/:channel/connect`, async ({ params, request }) => {
    const body = await request.json() as { accountId: string };
    const accounts = MOCK_ACCOUNTS[params.channel as string] ?? [];
    const account = accounts.find((a) => a.id === body.accountId) ?? accounts[0];
    return HttpResponse.json({ ok: true, account: account?.name ?? "Account connected" });
  }),

  http.delete(`${BASE}/brands/:brandId/connections/:channel`, () =>
    HttpResponse.json({ ok: true })
  ),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/dashboard`, () =>
    HttpResponse.json({ kpis: KPIS, alerts: ALERTS })
  ),

  // ── Analytics — Social ────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/analytics/social`, () =>
    HttpResponse.json({
      kpis: SA_KPIS,
      trend: SA_TREND,
      networks: SA_NETWORKS,
      audience: { age: SA_AUDIENCE_AGE, gender: SA_GENDER, geo: SA_GEO },
      topPosts: TOP_POSTS,
    })
  ),

  // ── Analytics — Ads ───────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/analytics/ads`, () =>
    HttpResponse.json({
      kpis: ADS_KPIS,
      platforms: ADS_PLATFORMS,
      campaigns: ADS_CAMPAIGNS,
      spendTrend: ADS_SPEND_TREND,
    })
  ),

  // ── Analytics — Web / GA4 ─────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/analytics/web`, () =>
    HttpResponse.json({
      kpis: WEB_KPIS,
      sessions: { current: WEB_SESSIONS_THIS, previous: WEB_SESSIONS_PREV, labels: WEB_SESSION_LABELS },
      sources: WEB_SOURCES,
      pages: WEB_PAGES,
      devices: WEB_DEVICES,
      funnel: WEB_FUNNEL,
    })
  ),

  // ── Posts ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/posts`, () =>
    HttpResponse.json(POSTS_DATA)
  ),

  // ── Calendar ──────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/calendar`, ({ request }) => {
    const url = new URL(request.url);
    const year  = parseInt(url.searchParams.get("year")  ?? "2026");
    const month = parseInt(url.searchParams.get("month") ?? "6");
    return HttpResponse.json({ year, month, posts: CAL_POSTS_RAW, statusMeta: POST_STATUS_META });
  }),

  // ── Approvals ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/approvals`, () =>
    HttpResponse.json(APPROVALS_DATA)
  ),

  http.patch(`${BASE}/brands/:brandId/approvals/:id`, async ({ params, request }) => {
    const body = await request.json() as { status: string; note?: string };
    const item = APPROVALS_DATA.find((a) => a.id === Number(params.id));
    if (!item) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    return HttpResponse.json({ ...item, status: body.status, note: body.note ?? null });
  }),

  // ── Campaigns ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/campaigns`, () =>
    HttpResponse.json(CAMPAIGNS_DATA)
  ),

  // ── Influencers ───────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/influencers`, () =>
    HttpResponse.json(INFLUENCERS_DATA)
  ),

  http.post(`${BASE}/brands/:brandId/influencers`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: `i${Date.now()}`, ...body }, { status: 201 });
  }),

  http.patch(`${BASE}/brands/:brandId/influencers/:id`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const influencer = INFLUENCERS_DATA.find((i) => i.id === (request as any).params.id);
    return HttpResponse.json(influencer ? { ...influencer, ...body } : null);
  }),

  http.delete(`${BASE}/brands/:brandId/influencers/:id`, () =>
    HttpResponse.json({ ok: true })
  ),

  // ── Inbox ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/inbox`, () =>
    HttpResponse.json(INBOX_ITEMS)
  ),

  http.get(`${BASE}/brands/:brandId/inbox/:itemId/thread`, () =>
    HttpResponse.json(INBOX_THREAD)
  ),

  http.post(`${BASE}/brands/:brandId/inbox/:itemId/reply`, async ({ request }) => {
    const body = await request.json() as { text: string };
    return HttpResponse.json({ ok: true, message: { from: "me", text: body.text, when: "ahora", by: "María R." } });
  }),

  // ── Requests ──────────────────────────────────────────────────────────────
  http.get(`${BASE}/requests`, () =>
    HttpResponse.json(REQUESTS_DATA)
  ),

  http.post(`${BASE}/requests`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: `SOL-${Date.now()}`, ...body, status: "abierta" }, { status: 201 });
  }),

  http.patch(`${BASE}/requests/:id`, async ({ params, request }) => {
    const body = await request.json() as { status: string };
    const item = REQUESTS_DATA.find((r) => r.id === params.id);
    if (!item) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    return HttpResponse.json({ ...item, status: body.status });
  }),

  // ── AI Insights ───────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/insights`, () =>
    HttpResponse.json(AI_INSIGHTS)
  ),

  http.post(`${BASE}/brands/:brandId/insights/chat`, async ({ request }) => {
    const body = await request.json() as { message: string };
    const msg = body.message?.toLowerCase() ?? "";

    let reply = "Analizando los datos de tu cuenta... basándome en el rendimiento reciente, te recomendaría enfocarte en los contenidos de TikTok, que siguen siendo los de mayor alcance orgánico.";

    if (msg.includes("roas") || msg.includes("ads")) {
      reply = "Tu ROAS promedio es 3.7x. La campaña con mejor retorno es 'Retargeting Web' (5.2x). Considera aumentar su presupuesto.";
    } else if (msg.includes("tiktok")) {
      reply = "TikTok es tu canal de mayor engagement (8.2%). Los videos tipo 'test drive' y 'POV' tienen 3× más interacciones que el contenido de producto estático.";
    } else if (msg.includes("audiencia") || msg.includes("demografía")) {
      reply = "Tu audiencia principal es mujeres 25–34 (36% del total), concentradas en Santa Cruz (41%). Este segmento tiene el mayor CTR en Meta Ads.";
    }

    return HttpResponse.json({ role: "assistant", content: reply });
  }),

  // ── Reports ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/reports`, () =>
    HttpResponse.json([
      { id: "r1", title: "Reporte Mayo 2026",     brand: "Toyosa Motors",  period: "1–31 may 2026", status: "ready",      format: "PDF", size: "2.4 MB", created: "2 jun" },
      { id: "r2", title: "Reporte Abril 2026",    brand: "Toyosa Motors",  period: "1–30 abr 2026", status: "ready",      format: "PDF", size: "2.1 MB", created: "2 may" },
      { id: "r3", title: "Reporte Q1 2026",       brand: "Banco Ganadero", period: "ene–mar 2026",  status: "ready",      format: "PDF", size: "5.8 MB", created: "5 abr" },
      { id: "r4", title: "Reporte Mayo 2026",     brand: "Banco Ganadero", period: "1–31 may 2026", status: "generating", format: "PDF", size: null,     created: "3 jun" },
      { id: "r5", title: "Reporte Custom Ads Q2", brand: "Toyosa Motors",  period: "abr–jun 2026",  status: "draft",      format: "PDF", size: null,     created: "hoy" },
    ])
  ),

  http.post(`${BASE}/brands/:brandId/reports`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: `r${Date.now()}`, ...body, status: "generating" }, { status: 201 });
  }),

  // ── Briefs ────────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/briefs`, () =>
    HttpResponse.json(BRIEFS_DATA)
  ),

  http.post(`${BASE}/brands/:brandId/briefs`, async ({ request }) => {
    const body = await request.json() as Omit<Brief, "id" | "createdAt">;
    return HttpResponse.json({
      id: `BR-${Date.now()}`,
      ...body,
      createdAt: new Date().toLocaleDateString("es-BO")
    }, { status: 201 });
  }),

  http.patch(`${BASE}/brands/:brandId/briefs/:id`, async ({ request }) => {
    const body = await request.json() as Partial<Brief>;
    const brief = BRIEFS_DATA.find((b) => b.id === (request as any).params.id);
    return HttpResponse.json(brief ? { ...brief, ...body } : null);
  }),

  http.delete(`${BASE}/brands/:brandId/briefs/:id`, () =>
    HttpResponse.json({ ok: true })
  ),

  // ── Contracts ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/brands/:brandId/contracts`, () =>
    HttpResponse.json(CONTRACTS_DATA)
  ),

  http.post(`${BASE}/brands/:brandId/contracts`, async ({ request }) => {
    const body = await request.json() as Omit<Contract, "id" | "createdAt">;
    return HttpResponse.json({
      id: `CT-${Date.now()}`,
      ...body,
      createdAt: new Date().toLocaleDateString("es-BO")
    }, { status: 201 });
  }),

  http.patch(`${BASE}/brands/:brandId/contracts/:id`, async ({ request }) => {
    const body = await request.json() as Partial<Contract>;
    const contract = CONTRACTS_DATA.find((c) => c.id === (request as any).params.id);
    return HttpResponse.json(contract ? { ...contract, ...body } : null);
  }),

  http.delete(`${BASE}/brands/:brandId/contracts/:id`, () =>
    HttpResponse.json({ ok: true })
  ),

  // ── Auth ──────────────────────────────────────────────────────────────────
  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({
      id: "mock-user-1",
      name: "María Rojas",
      email: "maria@foboagency.bo",
      role: "agency",
      brandId: null,
    })
  ),
];
