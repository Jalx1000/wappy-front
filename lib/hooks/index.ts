import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  brandsApi,
  discoveriesApi,
  orphansApi,
  strandedApi,
  type StrandedConnection,
  type BrandOverview,
  type CreateBrandDto,
  type UpdateBrandDto,
  type Discovery,
  type DiscoveryAssignment,
  type Orphan,
} from "@/lib/api/brands";
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
import {
  analyticsApi,
  type WebCountryRow,
  type AdsOverviewResponse,
} from "@/lib/api/analytics";
import {
  engagementRate,
  formatDashboardKpis,
  type DashboardKpisRaw,
  type KpiItem,
} from "@/lib/dashboard/kpis";
import { parseSpend, type AgencyBrandMetrics } from "@/lib/dashboard/agency";
import { contentApi } from "@/lib/api/content";
import { inboxApi } from "@/lib/api/inbox";
import { requestsApi, type RequestItem } from "@/lib/api/requests";
import { insightsApi } from "@/lib/api/insights";
import {
  reportsApi,
  type Report,
  type CreateReportPayload,
} from "@/lib/api/reports";
import {
  reportSchedulesApi,
  type ReportSchedule,
  type CreateReportSchedulePayload,
} from "@/lib/api/reportSchedules";
import {
  calendarApi,
  type CalendarItem,
  type CalendarItemInput,
} from "@/lib/api/calendar";
import { assetsApi, type AssetItem } from "@/lib/api/assets";
import { approvalsApi, type ApprovalRecord } from "@/lib/api/approvals";
import type { Brand } from "@/store/ui";
import type { ConnRecord } from "@/lib/mocks/data";
import {
  BRANDS,
  KPIS,
  ALERTS,
  CONNECTIONS,
} from "@/lib/mocks/data";
import {
  SA_TREND, SA_NETWORKS, SA_AUDIENCE_AGE, SA_GENDER, SA_GEO, TOP_POSTS,
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
// KpiItem lives in @/lib/dashboard/kpis (imported above) so its logic is testable.
type AlertItem   = typeof ALERTS[number];
type AdsKpi      = typeof ADS_KPIS[number];
type WebKpi      = typeof WEB_KPIS[number];

// Explicit (not inferred from the mock) so KPI tiles can flag a metric as
// unavailable for the active channel — e.g. Facebook impressions, which Meta
// removed from the Page Insights API in v25.
export type SaKpi = {
  label: string;
  value: string;
  delta: number;
  spark: number[];
  unavailable?: boolean;
  note?: string;
};

export type SaPost = {
  ch: string;
  caption: string;
  mediaUrl?: string | null;
  reach: string;
  eng: string;
  likes: string;
  comments?: string;
  shares?: string;
  views?: string;
  clicks?: string;
  saves?: string;
  date: string;
  // Raw numbers so the UI can decide which metric chips to render (>0).
  raw?: {
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    clicks: number;
    saves: number;
    engagement: number;
  };
};

export type SocialAnalyticsData = {
  kpis: SaKpi[];
  trend: typeof SA_TREND;
  networks: typeof SA_NETWORKS;
  audience: {
    age: typeof SA_AUDIENCE_AGE;
    gender: typeof SA_GENDER;
    geo: typeof SA_GEO;
  };
  topPosts: SaPost[];
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
  stale?: boolean;
  lastSyncAt?: string | null;
  connectionId?: number;
  isDemo?: boolean;
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

export function useBrandsOverview() {
  return useQuery<BrandOverview[]>({
    queryKey: ["brands", "overview"],
    queryFn: () => brandsApi.overview(),
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
// DashboardKpisRaw / KpiItem / formatDashboardKpis live in @/lib/dashboard/kpis.
export type { DashboardKpisRaw } from "@/lib/dashboard/kpis";

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

export function useDashboard(brandId: string | undefined, days = 30) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", brandId, days],
    queryFn: async () => {
      // Current window plus the immediately-preceding window of the same length,
      // so each KPI can show its change vs. the previous period.
      const from = isoDaysAgo(days);
      const to = isoDaysAgo(0);
      const prevFrom = isoDaysAgo(days * 2);
      const prevTo = from;
      type Summary = { kpis: DashboardKpisRaw; topPosts: unknown[] };
      const [summary, prev] = await Promise.all([
        api.get<Summary>(`/analytics/social/summary?from=${from}&to=${to}`),
        api.get<Summary>(`/analytics/social/summary?from=${prevFrom}&to=${prevTo}`),
      ]);
      return {
        kpis: formatDashboardKpis(summary.kpis, prev.kpis),
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

// ── Per-channel breakdown (real) ──────────────────────────────────────────────
// Social channels whose organic API exposes a followers/engagement summary.
const SOCIAL_CHANNELS = new Set([
  "facebook",
  "instagram",
  "instagramlogin",
  "tiktok",
  "linkedin",
  "youtube",
]);

export type ChannelSummary = {
  connectionId: number;
  ch: string;
  account: string | null;
  followers: number;
  engagementRate: number;
};

// Fetches a real per-connection summary for each connected social channel so the
// dashboard's "Por canal" panel can show live followers + engagement instead of
// fabricated numbers. Returns only the channels that have resolved data.
export function useChannelSummaries(
  brandId: string | undefined,
  connections: ConnRecord[],
  days = 30,
): ChannelSummary[] {
  const from = isoBack(days);
  const to = isoBack(0);
  const social = connections.filter(
    (c) =>
      c.status === "connected" &&
      typeof c.id === "number" &&
      SOCIAL_CHANNELS.has(c.ch),
  );
  const results = useQueries({
    queries: social.map((c) => ({
      queryKey: ["channel-summary", brandId, c.id, days] as const,
      enabled: !!brandId,
      queryFn: async (): Promise<ChannelSummary> => {
        const s = await analyticsApi.socialSummary(from, to, c.id!);
        const k = (s.kpis ?? {}) as Record<string, number>;
        return {
          connectionId: c.id!,
          ch: c.ch,
          account: c.account,
          followers: k.followers ?? 0,
          // Same "by followers" rate as the KPI cards (tested in kpis.test.ts).
          engagementRate: engagementRate(k),
        };
      },
    })),
  });
  return results
    .map((r) => r.data)
    .filter((d): d is ChannelSummary => !!d);
}

// ── Agency (multi-brand) breakdown (real) ─────────────────────────────────────
// For each brand fetches its social summary, ads spend and connection health, so
// the Agency view shows live per-brand numbers instead of fabricated ones.
// Returns a map keyed by brandId (only brands whose query has resolved).
export function useAgencySummaries(
  brands: { id: string }[],
  days = 30,
): Record<string, AgencyBrandMetrics> {
  const from = isoBack(days);
  const to = isoBack(0);
  const results = useQueries({
    queries: brands.map((b) => ({
      queryKey: ["agency-summary", b.id, days] as const,
      queryFn: async (): Promise<AgencyBrandMetrics> => {
        const headers = { "x-brand-id": b.id };
        const [summary, ads, conns] = await Promise.all([
          api.get<{ kpis: Record<string, number> }>(
            `/analytics/social/summary?from=${from}&to=${to}`,
            { headers },
          ),
          api
            .get<AdsOverviewResponse>(
              `/analytics/ads/overview?from=${from}&to=${to}&compare=true`,
              { headers },
            )
            .catch(() => null),
          api
            .get<{ status: string }[]>(`/connections`, { headers })
            .catch(() => [] as { status: string }[]),
        ]);
        const k = summary.kpis ?? {};
        const spendKpi = ads?.kpis?.find((x) => x.label === "Inversión")?.value ?? 0;
        return {
          brandId: b.id,
          followers: k.followers ?? 0,
          reach: k.reach ?? 0,
          engagement: k.engagement ?? 0,
          engagementRate: engagementRate(k),
          spend: parseSpend(spendKpi),
          needsAttention: (conns ?? []).filter(
            (c) => c.status === "expired" || c.status === "error",
          ).length,
        };
      },
    })),
  });
  const map: Record<string, AgencyBrandMetrics> = {};
  results.forEach((r, i) => {
    if (r.data) map[brands[i].id] = r.data;
  });
  return map;
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

// Plain id syncs the default 90-day window; the object form syncs a custom
// {from,to} range (YYYY-MM-DD) — used by the analytics date pickers.
type SyncConnectionVars =
  | number
  | { id: number; from?: string; to?: string };

export function useSyncConnectionMutation(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    // Enqueue the sync, then poll the job(s) until they finish so the mutation
    // stays "pending" (spinner) for the real duration and the analytics cards
    // refetch fresh data on settle — instead of appearing to do nothing.
    mutationFn: async (vars: SyncConnectionVars) => {
      const { id, from, to } =
        typeof vars === "number" ? { id: vars, from: undefined, to: undefined } : vars;
      const { jobIds } = await brandsApi.syncConnection(
        id,
        from || to ? { from, to } : undefined,
      );
      const queueOf = (jid: string): "web" | "ads" | "social" =>
        jid.startsWith("web") ? "web" : jid.startsWith("ads") ? "ads" : "social";
      const pending = jobIds.filter((j): j is string => typeof j === "string");
      const deadline = Date.now() + 60_000;
      while (pending.length && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 2500));
        for (let i = pending.length - 1; i >= 0; i--) {
          const st = await brandsApi
            .getSyncJob(id, pending[i], queueOf(pending[i]))
            .catch(() => null);
          if (!st || st.state === "completed" || st.state === "failed") {
            pending.splice(i, 1);
          }
        }
      }
      return jobIds;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["connections", brandId] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
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

export function useReassignConnectionBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, brandId }: { id: number; brandId: number }) =>
      brandsApi.reassignConnectionBrand(id, brandId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["connections"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// ── OAuth discovery + orphans ────────────────────────────────────────────────
export function useDiscovery(id: number | null | undefined) {
  return useQuery<Discovery>({
    queryKey: ["discovery", id],
    queryFn: () => discoveriesApi.get(id as number),
    enabled: typeof id === "number",
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useAssignDiscovery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      assignments,
    }: {
      id: number;
      assignments: DiscoveryAssignment[];
    }) => discoveriesApi.assign(id, assignments),
    onSettled: (_, __, vars) => {
      qc.invalidateQueries({ queryKey: ["discovery", vars?.id] });
      qc.invalidateQueries({ queryKey: ["connections"] });
      qc.invalidateQueries({ queryKey: ["orphans"] });
    },
  });
}

export function useOrphans() {
  return useQuery<Orphan[]>({
    queryKey: ["orphans"],
    queryFn: () => orphansApi.list(),
    refetchOnWindowFocus: false,
  });
}

export function useAssignOrphan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orphanId,
      brandId,
    }: {
      orphanId: number;
      brandId: number;
    }) => orphansApi.assign(orphanId, brandId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["orphans"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useDiscardOrphan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orphanId: number) => orphansApi.discard(orphanId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["orphans"] });
    },
  });
}

// ── Stranded connections (marcas eliminadas) ─────────────────────────────────
export function useStranded() {
  return useQuery<StrandedConnection[]>({
    queryKey: ["stranded"],
    queryFn: () => strandedApi.list(),
    refetchOnWindowFocus: false,
  });
}

export function useAssignStranded() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, brandId }: { id: number; brandId: number }) =>
      strandedApi.assign(id, brandId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["stranded"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useDiscardStranded() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => strandedApi.discard(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["stranded"] });
    },
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

// Backend channels whose organic API does not return impressions, so the
// Impresiones KPI must show "N/D" instead of 0. Facebook Pages lost
// page_impressions in Graph API v25; instagram_login (Basic Display) never
// exposed it. TikTok/Instagram(Graph)/YouTube map views→impressions and stay.
const IMPRESSIONS_UNAVAILABLE = new Set<string>(["facebook_page", "instagram_login"]);

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
  // "7d" | "30d" | "90d" | "custom:YYYY-MM-DD:YYYY-MM-DD"
  range = "30d",
) {
  return useQuery<SocialAnalyticsData>({
    queryKey: ["analytics", "social", brandId, connectionId, range],
    enabled: !!brandId,
    queryFn: async () => {
      const { from, to } = rangeToDates(range);

      // All views are per-connection (one page/account at a time).
      const haveConn = typeof connectionId === "number";
      const summaryP = analyticsApi.socialSummary(
        from,
        to,
        haveConn ? connectionId : undefined,
      );

      const overviewP = haveConn
        ? analyticsApi.socialOverview(connectionId!, from, to)
        : Promise.resolve(null);
      const topPostsP = haveConn
        ? analyticsApi.socialTopPosts(connectionId!, from, to, 8)
        : Promise.resolve(null);

      const [summary, overview, topPosts] = await Promise.all([
        summaryP,
        overviewP,
        topPostsP,
      ]);

      // KPIs from summary — defensive: backend may return undefined when brand has no connections
      const k = (summary.kpis ?? {}) as Record<string, number>;
      const reachVal = k.reach ?? 0;
      const impressionsVal = k.impressions ?? 0;
      const followersVal = k.followers ?? 0;
      const interactions = k.engagement ?? k.total_interactions ?? 0;
      // Engagement rate "by followers" (the most widely-used definition): all
      // interactions (reactions + comments + shares) ÷ total followers × 100.
      // This needs neither impressions nor reach, so it works for Facebook —
      // which exposes neither via the API. Fall back to reach/impressions only
      // when a channel reports no followers.
      const engBase = followersVal > 0 ? followersVal : reachVal > 0 ? reachVal : impressionsVal;
      const engRate = engBase > 0 ? (interactions / engBase) * 100 : 0;
      // Period-over-period deltas from the overview comparison (vs. the
      // immediately preceding window of the same length).
      const cmp = overview?.comparison ?? {};
      const d = (metric: string) => cmp[metric]?.change ?? 0;
      // Delta of the engagement *rate* (not just interactions): compare this
      // period's rate against the previous one using both metrics' history.
      const engRateDelta = (() => {
        const ec = cmp.engagement ?? cmp.total_interactions;
        const fc = cmp.followers;
        const curBase = fc?.current || ec?.current || 1;
        const prevBase = fc?.previous || ec?.previous || 0;
        const curRate = (ec?.current ?? interactions) / (curBase || 1);
        const prevRate = prevBase > 0 ? (ec?.previous ?? 0) / prevBase : 0;
        if (prevRate === 0) return 0;
        return Number((((curRate - prevRate) / prevRate) * 100).toFixed(1));
      })();
      // Channels whose organic API doesn't expose impressions. Facebook Pages
      // lost page_impressions in Graph API v25 (returns #100); instagram_login
      // (Basic Display) never had it. Show "N/D" rather than a misleading 0.
      const impressionsAvailable = !IMPRESSIONS_UNAVAILABLE.has(connectionChannel ?? "");
      const kpis: SaKpi[] = [
        { label: "Alcance", value: fmtCompact(reachVal || impressionsVal), delta: reachVal > 0 ? d("reach") : d("impressions"), spark: [] },
        impressionsAvailable
          ? { label: "Impresiones", value: fmtCompact(impressionsVal), delta: d("impressions"), spark: [] }
          : { label: "Impresiones", value: "N/D", delta: 0, spark: [], unavailable: true, note: "Meta no expone esta métrica para esta red" },
        { label: "Engagement", value: engRate.toFixed(1) + "%", delta: engRateDelta, spark: [] },
        { label: "Seguidores", value: fmtCompact(k.followers ?? 0), delta: d("followers"), spark: [] },
      ];
      // Snapshot-only metrics (currently TikTok organic). Shown when present so
      // they don't clutter channels that don't expose them.
      if (k.following !== undefined)
        kpis.push({ label: "Seguidos", value: fmtCompact(k.following), delta: d("following"), spark: [] });
      if (k.total_likes !== undefined)
        kpis.push({ label: "Likes totales", value: fmtCompact(k.total_likes), delta: d("total_likes"), spark: [] });
      if (k.video_count !== undefined)
        kpis.push({ label: "Videos", value: fmtCompact(k.video_count), delta: d("video_count"), spark: [] });

      // Trend from overview.series. Prefer reach; channels without reach
      // (TikTok) fall back to impressions so the chart isn't blank.
      const reachSeries =
        overview?.series.reach?.length
          ? overview.series.reach
          : overview?.series.impressions ?? [];
      const trend = {
        reach: reachSeries.map((p) => p.value),
        labels: buildLabels(reachSeries),
      };

      // Top posts: with a connection, trust the range-filtered endpoint even
      // when it's empty — falling back to the summary's all-time top posts
      // would show publications outside the selected period. The summary
      // fallback only applies to the no-connection (brand-wide) view.
      const rawPosts = haveConn
        ? (Array.isArray(topPosts) ? topPosts : [])
        : (summary.topPosts ?? []);
      const channelLabel = connectionChannel
        ? CHANNEL_BACKEND_TO_UI[connectionChannel] ?? connectionChannel
        : "instagram";

      const mappedPosts = rawPosts.slice(0, 8).map((p) => {
        const m = (p.metrics ?? {}) as Record<string, number>;
        const reach = m.reach ?? 0;
        const impressions = m.impressions ?? 0;
        const likes = m.likes ?? 0;
        const comments = m.comments ?? 0;
        const shares = m.shares ?? 0;
        // TikTok stores `views`, Meta video posts store `video_views`.
        const views = m.views ?? m.video_views ?? 0;
        const clicks = m.clicks ?? 0;
        const saves = m.saves ?? 0;
        const eng = m.engagement ?? likes + comments + shares;
        // Engagement rate per post: prefer reach, then views; when a channel
        // (Facebook) exposes neither at post level, fall back to account
        // followers — the "by followers" rate the same way the KPI card does.
        const engBase = reach > 0 ? reach : views > 0 ? views : followersVal;
        const engRate = engBase > 0 ? (eng / engBase) * 100 : 0;
        return {
          ch: channelLabel,
          caption: p.caption ?? "—",
          mediaUrl: p.mediaUrl ?? null,
          reach: fmtCompact(reach || views),
          eng: engRate.toFixed(1) + "%",
          likes: fmtCompact(likes),
          comments: fmtCompact(comments),
          shares: fmtCompact(shares),
          views: fmtCompact(views),
          clicks: fmtCompact(clicks),
          saves: fmtCompact(saves),
          date: fmtShortDate(p.publishedAt),
          raw: { reach, impressions, likes, comments, shares, views, clicks, saves, engagement: eng },
        };
      });

      return {
        kpis,
        trend,
        networks: [],
        audience: { age: [], gender: [], geo: [] },
        topPosts: mappedPosts,
      } as SocialAnalyticsData;
    },
  });
}

// ── Analytics — Ads (real backend) ───────────────────────────────────────────
export function useAdsAnalytics(
  brandId: string | undefined,
  range: string = "30d",
) {
  return useQuery<
    AdsAnalyticsData & {
      stale?: boolean;
      lastSyncAt?: string | null;
      spendTrendLabels: string[];
    }
  >({
    queryKey: ["analytics", "ads", brandId, range],
    queryFn: async () => {
      const { from, to } = rangeToDates(range);
      const [overview, campaigns] = await Promise.all([
        analyticsApi.adsOverview(from, to),
        analyticsApi.adsCampaigns(from, to),
      ]);
      return {
        kpis: overview.kpis as unknown as AdsKpi[],
        platforms: overview.platforms as unknown as typeof ADS_PLATFORMS,
        campaigns: campaigns.campaigns as unknown as typeof ADS_CAMPAIGNS,
        spendTrend: overview.spendTrend,
        spendTrendLabels: overview.spendTrendLabels,
        stale: overview.stale,
        lastSyncAt: overview.lastSyncAt,
      };
    },
    enabled: !!brandId,
    retry: false,
  });
}

// ── Analytics — Web / GA4 (real backend) ─────────────────────────────────────
const WEB_RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
const WEB_DEVICE_LABELS: Record<string, string> = { mobile: "Móvil", desktop: "Escritorio", tablet: "Tablet" };
const WEB_DEVICE_COLORS: Record<string, string> = { mobile: "#0D5CA6", desktop: "#34BDF6", tablet: "#8B5CF6" };

function rangeToDates(range: string): { from: string; to: string } {
  // Custom range encoded as "custom:YYYY-MM-DD:YYYY-MM-DD"
  if (range.startsWith("custom:")) {
    const [, from, to] = range.split(":");
    if (from && to) return { from, to };
  }
  const days = WEB_RANGE_DAYS[range] ?? 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function formatWebKpiValue(label: string, value: number): string {
  if (label === "Tasa de conversión") return `${value.toFixed(1)}%`;
  if (label === "Páginas / sesión") return value.toFixed(1);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export function useWebAnalytics(
  brandId: string | undefined,
  range: string = "30d",
  opts?: { city?: string; connectionId?: number },
) {
  const city = opts?.city;
  const connectionId = opts?.connectionId;
  return useQuery<WebAnalyticsData>({
    queryKey: ["analytics", "web", brandId, range, city ?? null, connectionId ?? null],
    queryFn: async () => {
      const { from, to } = rangeToDates(range);
      const res = await analyticsApi.webOverview(from, to, { city, connectionId });
      const maxSrc = Math.max(1, ...res.sources.map((s) => s.sessions));
      return {
        kpis: res.kpis.map((k) => ({
          label: k.label,
          value: formatWebKpiValue(k.label, k.value),
          delta: k.delta,
          spark: k.spark?.length
            ? k.spark.slice(-7)
            : [0, 0, 0, 0, 0, 0, 0],
        })) as unknown as WebKpi[],
        sessions: res.sessions,
        sources: res.sources.map((s) => ({
          label: s.name,
          value: s.sessions,
          pct: Math.round((s.sessions / maxSrc) * 100),
        })) as unknown as typeof WEB_SOURCES,
        pages: res.pages as unknown as typeof WEB_PAGES,
        devices: res.devices.map((d) => ({
          label: WEB_DEVICE_LABELS[d.name?.toLowerCase()] ?? d.name,
          value: d.value,
          color: WEB_DEVICE_COLORS[d.name?.toLowerCase()] ?? "#94A3B8",
        })) as unknown as typeof WEB_DEVICES,
        funnel: res.funnel as unknown as typeof WEB_FUNNEL,
        stale: res.stale,
        lastSyncAt: res.lastSyncAt,
        connectionId: res.connectionId,
      } satisfies WebAnalyticsData;
    },
    enabled: !!brandId,
    retry: false,
  });
}

export function useWebCities(
  brandId: string | undefined,
  range: string = "30d",
  connectionId?: number,
) {
  return useQuery<string[]>({
    queryKey: ["analytics", "web-cities", brandId, range, connectionId ?? null],
    queryFn: async () => {
      const { from, to } = rangeToDates(range);
      return analyticsApi.webCities(from, to, connectionId);
    },
    enabled: !!brandId,
    retry: false,
  });
}

export function useWebCountries(
  brandId: string | undefined,
  range: string = "30d",
  connectionId?: number,
) {
  return useQuery<WebCountryRow[]>({
    queryKey: ["analytics", "web-countries", brandId, range, connectionId ?? null],
    queryFn: async () => {
      const { from, to } = rangeToDates(range);
      return analyticsApi.webCountries(from, to, connectionId);
    },
    enabled: !!brandId,
    retry: false,
  });
}

// GA4 properties available for the active brand. One GA4 connection exists per
// property the connected Google account can access (see backend ga4-oauth).
export function useGa4Properties(brandId: string | undefined) {
  const { data: conns = [] } = useConnections(brandId);
  return conns
    .filter(
      (c) => c.ch === "ga4" && c.status === "connected" && typeof c.id === "number",
    )
    .map((c) => ({
      connectionId: c.id as number,
      label: c.account || `GA4 ${c.id}`,
    }));
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

// ── Calendar (real backend) ───────────────────────────────────────────────────
export function useCalendarItems(
  brandId: string | undefined,
  from?: string,
  to?: string,
) {
  return useQuery<CalendarItem[]>({
    queryKey: ["calendar-items", brandId, from, to],
    queryFn: () => calendarApi.list(from, to),
    enabled: !!brandId,
  });
}

export function useCreateCalendarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CalendarItemInput) => calendarApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["calendar-items"] }),
  });
}

export function useUpdateCalendarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: number } & Partial<CalendarItemInput> & { status?: string }) =>
      calendarApi.update(id, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["calendar-items"] }),
  });
}

export function useDeleteCalendarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => calendarApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["calendar-items"] }),
  });
}

export function usePublishCalendarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => calendarApi.publish(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["calendar-items"] }),
  });
}

// ── Approvals (real backend — used by the publish gate) ───────────────────────
export function useApprovalsList(brandId: string | undefined, status?: string) {
  return useQuery<ApprovalRecord[]>({
    queryKey: ["approvals-real", brandId, status],
    queryFn: () => approvalsApi.list(status),
    enabled: !!brandId,
  });
}

export function useCreateApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { assetId: number; calendarItemId?: number }) =>
      approvalsApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["approvals-real"] }),
  });
}

export function useReviewApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: number;
      status: string;
      feedback?: string;
    }) => approvalsApi.review(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-items"] });
      qc.invalidateQueries({ queryKey: ["approvals-real"] });
    },
  });
}

// ── Assets (real backend) ─────────────────────────────────────────────────────
export function useAssets(brandId: string | undefined, type?: string) {
  return useQuery<AssetItem[]>({
    queryKey: ["assets", brandId, type],
    queryFn: () => assetsApi.list(type),
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

// ---- Reports ---------------------------------------------------------------

export function useReports() {
  const brandId = useUIStore((s) => s.activeBrand?.id);
  return useQuery<Report[]>({
    queryKey: ["reports", brandId],
    queryFn: () => reportsApi.list(),
    enabled: !!brandId,
    // Keep the list fresh while any report is still being generated.
    refetchInterval: (query) => {
      const data = query.state.data;
      const pending = data?.some(
        (r) => r.status === "pending" || r.status === "processing",
      );
      return pending ? 3000 : false;
    },
  });
}

export function useReport(id: number | undefined) {
  return useQuery<Report>({
    queryKey: ["report", id],
    queryFn: () => reportsApi.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === "pending" || s === "processing" ? 2500 : false;
    },
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  const brandId = useUIStore((s) => s.activeBrand?.id);
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", brandId] });
    },
  });
}

// ---- Report schedules ------------------------------------------------------

export function useReportSchedules() {
  const brandId = useUIStore((s) => s.activeBrand?.id);
  return useQuery<ReportSchedule[]>({
    queryKey: ["report-schedules", brandId],
    queryFn: () => reportSchedulesApi.list(),
    enabled: !!brandId,
  });
}

export function useCreateReportSchedule() {
  const qc = useQueryClient();
  const brandId = useUIStore((s) => s.activeBrand?.id);
  return useMutation({
    mutationFn: (payload: CreateReportSchedulePayload) =>
      reportSchedulesApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["report-schedules", brandId] }),
  });
}

export function useUpdateReportSchedule() {
  const qc = useQueryClient();
  const brandId = useUIStore((s) => s.activeBrand?.id);
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CreateReportSchedulePayload>;
    }) => reportSchedulesApi.update(id, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["report-schedules", brandId] }),
  });
}

export function useDeleteReportSchedule() {
  const qc = useQueryClient();
  const brandId = useUIStore((s) => s.activeBrand?.id);
  return useMutation({
    mutationFn: (id: number) => reportSchedulesApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["report-schedules", brandId] }),
  });
}
