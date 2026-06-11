import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api/brands";
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

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function useDashboard(brandId: string | undefined) {
  return useQuery<{ kpis: KpiItem[]; alerts: AlertItem[] }>({
    queryKey: ["dashboard", brandId],
    queryFn: () =>
      brandsApi.getDashboard(brandId!) as Promise<{ kpis: KpiItem[]; alerts: AlertItem[] }>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? { kpis: KPIS, alerts: ALERTS } : undefined,
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
    mutationFn: (ch: string) => brandsApi.disconnect(brandId!, ch),
    onMutate: async (ch) => {
      await qc.cancelQueries({ queryKey: ["connections", brandId] });
      const prev = qc.getQueryData<ConnRecord[]>(["connections", brandId]);
      qc.setQueryData<ConnRecord[]>(["connections", brandId], (old = []) =>
        old.map((c) =>
          c.ch === ch
            ? { ...c, status: "available" as const, health: null, account: null, since: undefined, lastSync: undefined }
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

// ── Analytics — Social ────────────────────────────────────────────────────────
export function useSocialAnalytics(brandId: string | undefined) {
  return useQuery<SocialAnalyticsData>({
    queryKey: ["analytics", "social", brandId],
    queryFn: () => analyticsApi.social(brandId!) as Promise<SocialAnalyticsData>,
    enabled: !!brandId,
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

// ── Analytics — Ads ───────────────────────────────────────────────────────────
export function useAdsAnalytics(brandId: string | undefined) {
  return useQuery<AdsAnalyticsData>({
    queryKey: ["analytics", "ads", brandId],
    queryFn: () => analyticsApi.ads(brandId!) as Promise<AdsAnalyticsData>,
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

// ── Analytics — Web / GA4 ─────────────────────────────────────────────────────
export function useWebAnalytics(brandId: string | undefined) {
  return useQuery<WebAnalyticsData>({
    queryKey: ["analytics", "web", brandId],
    queryFn: () => analyticsApi.web(brandId!) as Promise<WebAnalyticsData>,
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

// ── Approvals ─────────────────────────────────────────────────────────────────
export function useApprovals(brandId: string | undefined) {
  return useQuery<Approval[]>({
    queryKey: ["approvals", brandId],
    queryFn: () => contentApi.getApprovals(brandId!),
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? APPROVALS_DATA : undefined,
  });
}

export function useUpdateApproval(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: string; note?: string }) =>
      contentApi.updateApproval(brandId!, id, status, note),
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
    onSettled: () => qc.invalidateQueries({ queryKey: ["approvals", brandId] }),
  });
}

// ── Calendar ──────────────────────────────────────────────────────────────────
export function useCalendar(brandId: string | undefined, year: number, month: number) {
  return useQuery<CalendarData>({
    queryKey: ["calendar", brandId, year, month],
    queryFn: () => contentApi.getCalendar(brandId!, year, month) as Promise<CalendarData>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS
      ? { year, month, posts: CAL_POSTS_RAW as unknown as Record<number, CalPost[]>, statusMeta: POST_STATUS_META }
      : undefined,
  });
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export function useCampaigns(brandId: string | undefined) {
  return useQuery<CampaignItem[]>({
    queryKey: ["campaigns", brandId],
    queryFn: () => contentApi.getCampaigns(brandId!) as Promise<CampaignItem[]>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? CAMPAIGNS_DATA : undefined,
  });
}

// ── Influencers ───────────────────────────────────────────────────────────────
export function useInfluencers(brandId: string | undefined) {
  return useQuery<InfluencerItem[]>({
    queryKey: ["influencers", brandId],
    queryFn: () => contentApi.getInfluencers(brandId!) as Promise<InfluencerItem[]>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? INFLUENCERS_DATA : undefined,
  });
}

export function useCreateInflencer(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InfluencerItem) =>
      contentApi.createInfluencer(brandId!, payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["influencers", brandId] });
      const prev = qc.getQueryData<InfluencerItem[]>(["influencers", brandId]);
      qc.setQueryData<InfluencerItem[]>(["influencers", brandId], (old = []) => [payload, ...old]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["influencers", brandId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["influencers", brandId] }),
  });
}

export function useUpdateInfluencer(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InfluencerItem> }) =>
      contentApi.updateInfluencer(brandId!, id, data),
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
    onSettled: () => qc.invalidateQueries({ queryKey: ["influencers", brandId] }),
  });
}

export function useDeleteInflencer(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentApi.deleteInfluencer(brandId!, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["influencers", brandId] });
      const prev = qc.getQueryData<InfluencerItem[]>(["influencers", brandId]);
      qc.setQueryData<InfluencerItem[]>(["influencers", brandId], (old = []) => old.filter((i) => i.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["influencers", brandId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["influencers", brandId] }),
  });
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export function usePosts(brandId: string | undefined) {
  return useQuery<PostItem[]>({
    queryKey: ["posts", brandId],
    queryFn: () => contentApi.getPosts(brandId!) as Promise<PostItem[]>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? POSTS_DATA : undefined,
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
    queryFn: () => contentApi.getReports(brandId!) as Promise<ReportItem[]>,
    enabled: !!brandId,
  });
}

// ── Inbox ─────────────────────────────────────────────────────────────────────
export function useInbox(brandId: string | undefined) {
  return useQuery<InboxItem[]>({
    queryKey: ["inbox", brandId],
    queryFn: () => inboxApi.getItems(brandId!) as Promise<InboxItem[]>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? INBOX_ITEMS : undefined,
  });
}

export function useInboxThread(brandId: string | undefined, itemId: number | undefined) {
  return useQuery<ThreadMsg[]>({
    queryKey: ["inbox", brandId, "thread", itemId],
    queryFn: () => inboxApi.getThread(brandId!, itemId!) as Promise<ThreadMsg[]>,
    enabled: !!brandId && itemId !== undefined,
    placeholderData: IS_MOCKS ? INBOX_THREAD : undefined,
  });
}

export function useInboxReply(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, text }: { itemId: number; text: string }) =>
      inboxApi.reply(brandId!, itemId, text),
    onSuccess: (response, { itemId }) => {
      const newMsg = (response as { ok: boolean; message: ThreadMsg }).message;
      qc.setQueryData<ThreadMsg[]>(["inbox", brandId, "thread", itemId], (old = []) => [
        ...old,
        newMsg,
      ]);
    },
  });
}

// ── Requests ──────────────────────────────────────────────────────────────────
export function useRequests() {
  return useQuery<RequestItem[]>({
    queryKey: ["requests"],
    queryFn: () => requestsApi.list(),
    placeholderData: IS_MOCKS ? (REQUESTS_DATA as unknown as RequestItem[]) : undefined,
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      requestsApi.updateStatus(id, status),
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
    onSettled: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<RequestItem, "id" | "when">) =>
      requestsApi.create(payload),
    onSuccess: (newItem) => {
      qc.setQueryData<RequestItem[]>(["requests"], (old = []) => [newItem, ...old]);
    },
  });
}

// ── Insights ──────────────────────────────────────────────────────────────────
export function useInsights(brandId: string | undefined) {
  return useQuery<InsightItem[]>({
    queryKey: ["insights", brandId],
    queryFn: () => insightsApi.get(brandId!) as Promise<InsightItem[]>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? AI_INSIGHTS : undefined,
  });
}

export function useInsightsChat(brandId: string | undefined) {
  return useMutation({
    mutationFn: (message: string) => insightsApi.chat(brandId!, message),
  });
}

// ── Briefs ────────────────────────────────────────────────────────────────────
import { Brief, BRIEFS_DATA, Contract, CONTRACTS_DATA } from "@/lib/mocks/analyticsData";

export function useBriefs(brandId: string | undefined) {
  return useQuery<Brief[]>({
    queryKey: ["briefs", brandId],
    queryFn: () => contentApi.getBriefs(brandId!) as Promise<Brief[]>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? BRIEFS_DATA : undefined,
  });
}

export function useCreateBrief(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Brief, "id" | "createdAt">) =>
      contentApi.createBrief(brandId!, payload),
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
    onSettled: () => qc.invalidateQueries({ queryKey: ["briefs", brandId] }),
  });
}

export function useUpdateBrief(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Brief> }) =>
      contentApi.updateBrief(brandId!, id, data),
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
    onSettled: () => qc.invalidateQueries({ queryKey: ["briefs", brandId] }),
  });
}

export function useDeleteBrief(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentApi.deleteBrief(brandId!, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["briefs", brandId] });
      const prev = qc.getQueryData<Brief[]>(["briefs", brandId]);
      qc.setQueryData<Brief[]>(["briefs", brandId], (old = []) => old.filter((b) => b.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["briefs", brandId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["briefs", brandId] }),
  });
}

// ── Contracts ─────────────────────────────────────────────────────────────────
export function useContracts(brandId: string | undefined) {
  return useQuery<Contract[]>({
    queryKey: ["contracts", brandId],
    queryFn: () => contentApi.getContracts(brandId!) as Promise<Contract[]>,
    enabled: !!brandId,
    placeholderData: IS_MOCKS ? CONTRACTS_DATA : undefined,
  });
}

export function useCreateContract(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Contract, "id" | "createdAt">) =>
      contentApi.createContract(brandId!, payload),
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
    onSettled: () => qc.invalidateQueries({ queryKey: ["contracts", brandId] }),
  });
}

export function useUpdateContract(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) =>
      contentApi.updateContract(brandId!, id, data),
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
    onSettled: () => qc.invalidateQueries({ queryKey: ["contracts", brandId] }),
  });
}

export function useDeleteContract(brandId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentApi.deleteContract(brandId!, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["contracts", brandId] });
      const prev = qc.getQueryData<Contract[]>(["contracts", brandId]);
      qc.setQueryData<Contract[]>(["contracts", brandId], (old = []) => old.filter((c) => c.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["contracts", brandId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["contracts", brandId] }),
  });
}
