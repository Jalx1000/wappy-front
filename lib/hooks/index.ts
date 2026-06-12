import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandsApi, type CreateBrandDto, type UpdateBrandDto } from "@/lib/api/brands";
import {
  authApi,
  type AuthMe,
  type UpdateMeDto,
} from "@/lib/api/auth";
import {
  membersApi,
  type BrandMember,
  type MemberRole,
} from "@/lib/api/members";
import { filesApi } from "@/lib/api/files";
import { api } from "@/lib/api/client";
import { useUIStore } from "@/store/ui";
import { analyticsApi } from "@/lib/api/analytics";
import { contentApi } from "@/lib/api/content";
import { inboxApi } from "@/lib/api/inbox";
import { requestsApi, type RequestItem } from "@/lib/api/requests";
import { insightsApi } from "@/lib/api/insights";
import type { Brand } from "@/store/ui";
import type { ConnRecord } from "@/lib/mocks/data";
import {
  BRANDS,
  KPIS,
  ALERTS,
  CONNECTIONS,
} from "@/lib/mocks/data";
import {
  SA_KPIS, SA_TREND, SA_NETWORKS, SA_AUDIENCE_AGE, SA_GENDER, SA_GEO, TOP_POSTS,
  ADS_KPIS, ADS_PLATFORMS, ADS_CAMPAIGNS, ADS_SPEND_TREND,
  WEB_KPIS, WEB_SESSIONS_THIS, WEB_SESSIONS_PREV, WEB_SESSION_LABELS,
  WEB_SOURCES, WEB_PAGES, WEB_DEVICES, WEB_FUNNEL,
  APPROVALS_DATA, CAMPAIGNS_DATA, INFLUENCERS_DATA,
  INBOX_ITEMS, INBOX_THREAD,
  REQUESTS_DATA, AI_INSIGHTS, POSTS_DATA,
  CAL_POSTS_RAW, POST_STATUS_META,
  type Approval,
  type CalPost,
} from "@/lib/mocks/analyticsData";

const IS_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// ── Helper types (inferred from mock shapes) ──────────────────────────────────
type KpiItem     = typeof KPIS[number];
type AlertItem   = typeof ALERTS[number];
type SaKpi       = typeof SA_KPIS[number];
type AdsKpi      = typeof ADS_KPIS[number];
type WebKpi      = typeof WEB_KPIS[number];

export type SocialAnalyticsData = {
  kpis: SaKpi[];
  trend: typeof SA_TREND;
  networks: typeof SA_NETWORKS;
  audience: {
    age: typeof SA_AUDIENCE_AGE;
    gender: typeof SA_GENDER;
    geo: typeof SA_GEO;
  };
  topPosts: typeof TOP_POSTS;
};

export type AdsAnalyticsData = {
  kpis: AdsKpi[];
  platforms: typeof ADS_PLATFORMS;
  campaigns: typeof ADS_CAMPAIGNS;
  spendTrend: typeof ADS_SPEND_TREND;
};

export type WebAnalyticsData = {
  kpis: WebKpi[];
  sessions: { current: number[]; previous: number[]; labels: string[] };
  sources: typeof WEB_SOURCES;
  pages: typeof WEB_PAGES;
  devices: typeof WEB_DEVICES;
  funnel: typeof WEB_FUNNEL;
};

export type CalendarData = {
  year: number;
  month: number;
  posts: Record<number, CalPost[]>;
  statusMeta: typeof POST_STATUS_META;
};

export type InboxItem  = typeof INBOX_ITEMS[number];
export type ThreadMsg  = typeof INBOX_THREAD[number];
export type InsightItem = typeof AI_INSIGHTS[number];
export type CampaignItem = typeof CAMPAIGNS_DATA[number];
export type InfluencerItem = typeof INFLUENCERS_DATA[number];
export type PostItem = typeof POSTS_DATA[number];

// ── Brands ────────────────────────────────────────────────────────────────────
export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: () => brandsApi.list(),
    placeholderData: IS_MOCKS ? BRANDS : undefined,
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBrandDto) => brandsApi.create(dto),
    onSuccess: async (newBrand) => {
      await qc.invalidateQueries({ queryKey: ["brands"] });
      useUIStore.getState().setActiveBrand(newBrand);
    },
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandDto }) =>
      brandsApi.update(id, data),
    onSettled: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.remove(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}

// ── Auth (self) ──────────────────────────────────────────────────────────────
export function useMe() {
  return useQuery<AuthMe>({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateMeDto) => authApi.updateMe(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
}

export function useDeleteMe() {
  return useMutation({
    mutationFn: () => authApi.deleteMe(),
  });
}

// ── Brand members ────────────────────────────────────────────────────────────
export function useBrandMembers(brandId: string | undefined) {
  return useQuery<BrandMember[]>({
    queryKey: ["brand-members", brandId],
    queryFn: () => membersApi.list(brandId!),
    enabled: !!brandId,
  });
}

export function useAddMember(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { userId: number; role?: MemberRole }) =>
      membersApi.add(brandId!, dto),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["brand-members", brandId] }),
  });
}

export function useRemoveMember(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => membersApi.remove(brandId!, userId),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["brand-members", brandId] }),
  });
}

// ── Files (real backend) ─────────────────────────────────────────────────────
export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => filesApi.upload(file),
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export type DashboardKpisRaw = {
  followers: number;
  reach: number;
  impressions: number;
  engagement: number;
  engagement_rate: number;
  likes: number;
  shares: number;
  comments: number;
};

export type DashboardData = {
  kpis: KpiItem[];
  alerts: AlertItem[];
  raw: DashboardKpisRaw;
};

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function fmtNum(n: number) {
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}

function formatDashboardKpis(raw: DashboardKpisRaw): KpiItem[] {
  // engagement_rate viene del backend multiplicado por 100 (e.g. 295.56 → 2.96%).
  const engRate = typeof raw.engagement_rate === "number" ? raw.engagement_rate / 100 : 0;
  return [
    { id: "reach",  label: "Alcance total",     value: fmtNum(raw.reach ?? 0),       delta: 0, spark: [] },
    { id: "eng",    label: "Engagement",         value: engRate.toFixed(1) + "%",     delta: 0, spark: [] },
    { id: "fans",   label: "Seguidores",         value: fmtNum(raw.followers ?? 0),   delta: 0, spark: [] },
    { id: "roas",   label: "Impresiones",        value: fmtNum(raw.impressions ?? 0), delta: 0, spark: [] },
  ];
}

export function useDashboard(brandId: string | undefined, days = 30) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", brandId, days],
    queryFn: async () => {
      const from = isoDaysAgo(days);
      const to = isoDaysAgo(0);
      const summary = await api.get<{
        kpis: DashboardKpisRaw;
        topPosts: unknown[];
      }>(`/analytics/social/summary?from=${from}&to=${to}`);
      return {
        kpis: formatDashboardKpis(summary.kpis),
        alerts: [],
        raw: summary.kpis,
      };
    },
    enabled: !!brandId,
    placeholderData: IS_MOCKS
      ? ({
          kpis: KPIS,
          alerts: ALERTS,
          raw: {
            followers: 0, reach: 0, impressions: 0,
            engagement: 0, engagement_rate: 0,
            likes: 0, shares: 0, comments: 0,
          },
        } as DashboardData)
      : undefined,
  });
}

export type DashboardSeriesPoint = { date: string; value: number };
export type DashboardSeries = Record<string, DashboardSeriesPoint[]>;

export function useDashboardSeries(
  brandId: string | undefined,
  connectionId: number | undefined,
  days = 30,
) {
  return useQuery<DashboardSeries>({
    queryKey: ["dashboard-series", brandId, connectionId, days],
    queryFn: async () => {
      const from = isoDaysAgo(days);
      const to = isoDaysAgo(0);
      const data = await api.get<{ series: DashboardSeries }>(
        `/analytics/social/overview?connectionId=${connectionId}&from=${from}&to=${to}`,
      );
      return data.series;
    },
    enabled: !!brandId && typeof connectionId === "number",
  });
}

// ── Connections ───────────────────────────────────────────────────────────────
export function useConnections(brandId: string | undefined) {
  return useQuery<ConnRecord[]>({
    queryKey: ["connections", brandId],
    queryFn: () => brandsApi.getConnections(brandId!) as Promise<ConnRecord[]>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS && brandId ? (CONNECTIONS[brandId] ?? []) : undefined,
  });
}

export function useConnectMutation(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ch, accountId }: { ch: string; accountId: string; accountName: string }) =>
      brandsApi.connect(brandId!, ch, accountId),
    onMutate: async ({ ch, accountName }) => {
      await qc.cancelQueries({ queryKey: ["connections", brandId] });
      const prev = qc.getQueryData<ConnRecord[]>(["connections", brandId]);
      qc.setQueryData<ConnRecord[]>(["connections", brandId], (old = []) =>
        old.map((c) =>
          c.ch === ch
            ? { ...c, status: "connected" as const, health: "ok" as const, account: accountName, since: "Ahora", lastSync: "recién" }
            : c
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["connections", brandId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["connections", brandId] }),
  });
}

export function useDisconnectMutation(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; ch: string }) =>
      brandsApi.disconnect(id),
    onMutate: async ({ id, ch }) => {
      await qc.cancelQueries({ queryKey: ["connections", brandId] });
      const prev = qc.getQueryData<ConnRecord[]>(["connections", brandId]);
      qc.setQueryData<ConnRecord[]>(["connections", brandId], (old = []) =>
        old.map((c) =>
          c.id === id || c.ch === ch
            ? { ...c, status: "available" as const, health: null, account: null, since: undefined, lastSync: undefined, id: undefined }
            : c
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["connections", brandId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["connections", brandId] }),
  });
}

export function useSyncConnectionMutation(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => brandsApi.syncConnection(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ["connections", brandId] }),
  });
}

export function useUpdateConnectionMutation(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accessToken }: { id: number; accessToken: string }) =>
      brandsApi.updateConnection(id, { accessToken }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["connections", brandId] }),
  });
}

// ── Analytics — Social ────────────────────────────────────────────────────────
const CHANNEL_BACKEND_TO_UI: Record<string, string> = {
  facebook_page: "facebook",
  instagram: "instagram",
  tiktok: "tiktok",
  linkedin: "linkedin",
  youtube: "youtube",
  google_ads: "googleads",
  ga4: "ga4",
};

function fmtCompact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}

function isoBack(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function fmtShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-BO", { day: "numeric", month: "short" });
}

function buildLabels(points: { date: string }[]): string[] {
  const n = points.length;
  return points.map((p, i) => {
    if (i === 0 || i === n - 1 || i % Math.max(1, Math.floor(n / 6)) === 0) {
      return p.date.slice(5);
    }
    return "";
  });
}

export function useSocialAnalytics(
  brandId: string | undefined,
  connectionId: number | undefined,
  connectionChannel: string | undefined,
  days = 30,
) {
  return useQuery<SocialAnalyticsData>({
    queryKey: ["analytics", "social", brandId, connectionId, days],
    enabled: !!brandId,
    queryFn: async () => {
      const from = isoBack(days);
      const to = isoBack(0);

      // Summary is brand-scoped (no connectionId needed).
      const summaryP = analyticsApi.socialSummary(from, to);

      // Overview + topPosts require a connectionId. If none, fall back to mocks.
      const haveConn = typeof connectionId === "number";
      const overviewP = haveConn
        ? analyticsApi.socialOverview(connectionId!, from, to)
        : Promise.resolve(null);
      const topPostsP = haveConn
        ? analyticsApi.socialTopPosts(connectionId!, 8)
        : Promise.resolve(null);

      const [summary, overview, topPosts] = await Promise.all([
        summaryP,
        overviewP,
        topPostsP,
      ]);

      // KPIs from summary — defensive: backend may return undefined when brand has no connections
      const k = summary.kpis ?? ({} as Partial<typeof summary.kpis>);
      const engRate = typeof k.engagement_rate === "number" ? k.engagement_rate / 100 : 0;
      const kpis: SaKpi[] = [
        { label: "Alcance", value: fmtCompact(k.reach ?? 0), delta: 0, spark: [] },
        { label: "Impresiones", value: fmtCompact(k.impressions ?? 0), delta: 0, spark: [] },
        { label: "Engagement", value: engRate.toFixed(1) + "%", delta: 0, spark: [] },
        { label: "Seguidores", value: fmtCompact(k.followers ?? 0), delta: 0, spark: [] },
      ];

      // Trend from overview.series.reach
      const reachSeries = overview?.series.reach ?? [];
      const trend = reachSeries.length
        ? {
            reach: reachSeries.map((p) => p.value),
            labels: buildLabels(reachSeries),
          }
        : SA_TREND;

      // Top posts from backend or topPosts response
      const rawPosts =
        (topPosts && Array.isArray(topPosts) && topPosts.length ? topPosts : null) ??
        summary.topPosts ??
        [];
      const channelLabel = connectionChannel
        ? CHANNEL_BACKEND_TO_UI[connectionChannel] ?? connectionChannel
        : "instagram";

      const mappedPosts = rawPosts.slice(0, 8).map((p) => {
        const reach = p.metrics?.reach ?? 0;
        const eng = p.metrics?.engagement ?? 0;
        const engRate = reach > 0 ? (eng / reach) * 100 : 0;
        return {
          ch: channelLabel,
          caption: p.caption ?? "—",
          reach: fmtCompact(reach),
          eng: engRate.toFixed(1) + "%",
          likes: fmtCompact(p.metrics?.likes ?? 0),
          date: fmtShortDate(p.publishedAt),
        };
      });

      return {
        kpis,
        trend,
        networks: SA_NETWORKS,
        audience: { age: SA_AUDIENCE_AGE, gender: SA_GENDER, geo: SA_GEO },
        topPosts: mappedPosts.length ? mappedPosts : TOP_POSTS,
      } as SocialAnalyticsData;
    },
    placeholderData: IS_MOCKS
      ? {
          kpis: SA_KPIS,
          trend: SA_TREND,
          networks: SA_NETWORKS,
          audience: { age: SA_AUDIENCE_AGE, gender: SA_GENDER, geo: SA_GEO },
          topPosts: TOP_POSTS,
        }
      : undefined,
  });
}

// ── Analytics — Ads (NO BACKEND — pure mock) ─────────────────────────────────
export function useAdsAnalytics(brandId: string | undefined) {
  return useQuery<AdsAnalyticsData>({
    queryKey: ["analytics", "ads", brandId],
    queryFn: async () =>
      ({
        kpis: ADS_KPIS,
        platforms: ADS_PLATFORMS,
        campaigns: ADS_CAMPAIGNS,
        spendTrend: ADS_SPEND_TREND,
      }) as AdsAnalyticsData,
    enabled: !!brandId,
    placeholderData: IS_MOCKS
      ? {
          kpis: ADS_KPIS,
          platforms: ADS_PLATFORMS,
          campaigns: ADS_CAMPAIGNS,
          spendTrend: ADS_SPEND_TREND,
        }
      : undefined,
  });
}

// ── Analytics — Web / GA4 (NO BACKEND — pure mock) ───────────────────────────
export function useWebAnalytics(brandId: string | undefined) {
  return useQuery<WebAnalyticsData>({
    queryKey: ["analytics", "web", brandId],
    queryFn: async () =>
      ({
        kpis: WEB_KPIS,
        sessions: { current: WEB_SESSIONS_THIS, previous: WEB_SESSIONS_PREV, labels: WEB_SESSION_LABELS },
        sources: WEB_SOURCES,
        pages: WEB_PAGES,
        devices: WEB_DEVICES,
        funnel: WEB_FUNNEL,
      }) as WebAnalyticsData,
    enabled: !!brandId,
    placeholderData: IS_MOCKS
      ? {
          kpis: WEB_KPIS,
          sessions: { current: WEB_SESSIONS_THIS, previous: WEB_SESSIONS_PREV, labels: WEB_SESSION_LABELS },
          sources: WEB_SOURCES,
          pages: WEB_PAGES,
          devices: WEB_DEVICES,
          funnel: WEB_FUNNEL,
        }
      : undefined,
  });
}

// ── Mock-only modules (no backend yet — UI uses static mocks) ────────────────
// All hooks below intentionally do NOT call the backend. When backend ships,
// swap the queryFn / mutationFn to the real call and drop the DemoBanner on
// the corresponding view. See docs/BACKEND_BACKLOG.md for shapes.

// ── Approvals ─────────────────────────────────────────────────────────────────
export function useApprovals(brandId: string | undefined) {
  return useQuery<Approval[]>({
    queryKey: ["approvals", brandId],
    queryFn: async () => APPROVALS_DATA,
    initialData: APPROVALS_DATA,
    enabled: !!brandId,
  });
}

export function useUpdateApproval(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; status: string; note?: string }) => vars,
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["approvals", brandId] });
      const prev = qc.getQueryData<Approval[]>(["approvals", brandId]);
      qc.setQueryData<Approval[]>(["approvals", brandId], (old = []) =>
        old.map((a) => (a.id === id ? { ...a, status: status as Approval["status"] } : a))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["approvals", brandId], ctx.prev);
    },
  });
}

// ── Calendar ──────────────────────────────────────────────────────────────────
export function useCalendar(brandId: string | undefined, year: number, month: number) {
  return useQuery<CalendarData>({
    queryKey: ["calendar", brandId, year, month],
    queryFn: async () => ({
      year,
      month,
      posts: CAL_POSTS_RAW as unknown as Record<number, CalPost[]>,
      statusMeta: POST_STATUS_META,
    }),
    initialData: {
      year,
      month,
      posts: CAL_POSTS_RAW as unknown as Record<number, CalPost[]>,
      statusMeta: POST_STATUS_META,
    },
    enabled: !!brandId,
  });
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export function useCampaigns(brandId: string | undefined) {
  return useQuery<CampaignItem[]>({
    queryKey: ["campaigns", brandId],
    queryFn: async () => CAMPAIGNS_DATA,
    initialData: CAMPAIGNS_DATA,
    enabled: !!brandId,
  });
}

// ── Influencers ───────────────────────────────────────────────────────────────
export function useInfluencers(brandId: string | undefined) {
  return useQuery<InfluencerItem[]>({
    queryKey: ["influencers", brandId],
    queryFn: async () => INFLUENCERS_DATA,
    initialData: INFLUENCERS_DATA,
    enabled: !!brandId,
  });
}

export function useCreateInflencer(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InfluencerItem) => payload,
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["influencers", brandId] });
      const prev = qc.getQueryData<InfluencerItem[]>(["influencers", brandId]);
      qc.setQueryData<InfluencerItem[]>(["influencers", brandId], (old = []) => [payload, ...old]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["influencers", brandId], ctx.prev);
    },
  });
}

export function useUpdateInfluencer(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; data: Partial<InfluencerItem> }) => vars,
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["influencers", brandId] });
      const prev = qc.getQueryData<InfluencerItem[]>(["influencers", brandId]);
      qc.setQueryData<InfluencerItem[]>(["influencers", brandId], (old = []) =>
        old.map((i) => (i.id === id ? { ...i, ...data } : i))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["influencers", brandId], ctx.prev);
    },
  });
}

export function useDeleteInflencer(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => id,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["influencers", brandId] });
      const prev = qc.getQueryData<InfluencerItem[]>(["influencers", brandId]);
      qc.setQueryData<InfluencerItem[]>(["influencers", brandId], (old = []) => old.filter((i) => i.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["influencers", brandId], ctx.prev);
    },
  });
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export function usePosts(brandId: string | undefined) {
  return useQuery<PostItem[]>({
    queryKey: ["posts", brandId],
    queryFn: async () => POSTS_DATA,
    initialData: POSTS_DATA,
    enabled: !!brandId,
  });
}

// ── Reports ───────────────────────────────────────────────────────────────────
export type ReportItem = {
  id: string; title: string; brand: string; period: string;
  status: string; format: string; size: string | null; created: string;
};

export function useReports(brandId: string | undefined) {
  return useQuery<ReportItem[]>({
    queryKey: ["reports", brandId],
    queryFn: async () => [] as ReportItem[],
    initialData: [] as ReportItem[],
    enabled: !!brandId,
  });
}

// ── Inbox ─────────────────────────────────────────────────────────────────────
export function useInbox(brandId: string | undefined) {
  return useQuery<InboxItem[]>({
    queryKey: ["inbox", brandId],
    queryFn: async () => INBOX_ITEMS,
    initialData: INBOX_ITEMS,
    enabled: !!brandId,
  });
}

export function useInboxThread(brandId: string | undefined, itemId: number | undefined) {
  return useQuery<ThreadMsg[]>({
    queryKey: ["inbox", brandId, "thread", itemId],
    queryFn: async () => INBOX_THREAD,
    initialData: INBOX_THREAD,
    enabled: !!brandId && itemId !== undefined,
  });
}

export function useInboxReply(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { itemId: number; text: string }) => {
      const msg = {
        from: "Tú" as const,
        text: vars.text,
        at: new Date().toISOString(),
      } as unknown as ThreadMsg;
      return { itemId: vars.itemId, message: msg };
    },
    onSuccess: ({ itemId, message }) => {
      qc.setQueryData<ThreadMsg[]>(
        ["inbox", brandId, "thread", itemId],
        (old = []) => [...old, message],
      );
    },
  });
}

// ── Requests ──────────────────────────────────────────────────────────────────
export function useRequests() {
  return useQuery<RequestItem[]>({
    queryKey: ["requests"],
    queryFn: async () => REQUESTS_DATA as unknown as RequestItem[],
    initialData: REQUESTS_DATA as unknown as RequestItem[],
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: string }) => vars,
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["requests"] });
      const prev = qc.getQueryData<RequestItem[]>(["requests"]);
      qc.setQueryData<RequestItem[]>(["requests"], (old = []) =>
        old.map((r) => (r.id === id ? { ...r, status } : r))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["requests"], ctx.prev);
    },
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<RequestItem, "id" | "when">) => ({
      ...payload,
      id: `REQ-${Date.now()}`,
      when: new Date().toLocaleDateString("es-BO"),
    }) as RequestItem,
    onSuccess: (newItem) => {
      qc.setQueryData<RequestItem[]>(["requests"], (old = []) => [newItem, ...old]);
    },
  });
}

// ── Insights ──────────────────────────────────────────────────────────────────
export function useInsights(brandId: string | undefined) {
  return useQuery<InsightItem[]>({
    queryKey: ["insights", brandId],
    queryFn: async () => AI_INSIGHTS,
    initialData: AI_INSIGHTS,
    enabled: !!brandId,
  });
}

export function useInsightsChat(_brandId: string | undefined) {
  return useMutation({
    mutationFn: async (message: string) => ({
      message,
      reply: "Esta respuesta vendría del backend de IA cuando esté listo.",
    }),
  });
}

// ── Briefs ────────────────────────────────────────────────────────────────────
import { Brief, BRIEFS_DATA, Contract, CONTRACTS_DATA } from "@/lib/mocks/analyticsData";

export function useBriefs(brandId: string | undefined) {
  return useQuery<Brief[]>({
    queryKey: ["briefs", brandId],
    queryFn: async () => BRIEFS_DATA,
    initialData: BRIEFS_DATA,
    enabled: !!brandId,
  });
}

export function useCreateBrief(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Brief, "id" | "createdAt">) => ({
      id: `BR-${Date.now()}`,
      ...payload,
      createdAt: new Date().toLocaleDateString("es-BO"),
    }) as Brief,
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["briefs", brandId] });
      const prev = qc.getQueryData<Brief[]>(["briefs", brandId]);
      qc.setQueryData<Brief[]>(["briefs", brandId], (old = []) => [
        { id: `BR-${Date.now()}`, ...payload, createdAt: new Date().toLocaleDateString("es-BO") },
        ...old,
      ]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["briefs", brandId], ctx.prev);
    },
  });
}

export function useUpdateBrief(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; data: Partial<Brief> }) => vars,
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["briefs", brandId] });
      const prev = qc.getQueryData<Brief[]>(["briefs", brandId]);
      qc.setQueryData<Brief[]>(["briefs", brandId], (old = []) =>
        old.map((b) => (b.id === id ? { ...b, ...data } : b))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["briefs", brandId], ctx.prev);
    },
  });
}

export function useDeleteBrief(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => id,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["briefs", brandId] });
      const prev = qc.getQueryData<Brief[]>(["briefs", brandId]);
      qc.setQueryData<Brief[]>(["briefs", brandId], (old = []) => old.filter((b) => b.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["briefs", brandId], ctx.prev);
    },
  });
}

// ── Contracts ─────────────────────────────────────────────────────────────────
export function useContracts(brandId: string | undefined) {
  return useQuery<Contract[]>({
    queryKey: ["contracts", brandId],
    queryFn: async () => CONTRACTS_DATA,
    initialData: CONTRACTS_DATA,
    enabled: !!brandId,
  });
}

export function useCreateContract(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Contract, "id" | "createdAt">) => ({
      id: `CT-${Date.now()}`,
      ...payload,
      createdAt: new Date().toLocaleDateString("es-BO"),
    }) as Contract,
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["contracts", brandId] });
      const prev = qc.getQueryData<Contract[]>(["contracts", brandId]);
      qc.setQueryData<Contract[]>(["contracts", brandId], (old = []) => [
        { id: `CT-${Date.now()}`, ...payload, createdAt: new Date().toLocaleDateString("es-BO") },
        ...old,
      ]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["contracts", brandId], ctx.prev);
    },
  });
}

export function useUpdateContract(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; data: Partial<Contract> }) => vars,
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["contracts", brandId] });
      const prev = qc.getQueryData<Contract[]>(["contracts", brandId]);
      qc.setQueryData<Contract[]>(["contracts", brandId], (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["contracts", brandId], ctx.prev);
    },
  });
}

export function useDeleteContract(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => id,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["contracts", brandId] });
      const prev = qc.getQueryData<Contract[]>(["contracts", brandId]);
      qc.setQueryData<Contract[]>(["contracts", brandId], (old = []) => old.filter((c) => c.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["contracts", brandId], ctx.prev);
    },
  });
}
