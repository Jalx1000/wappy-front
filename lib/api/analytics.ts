import { api } from "./client";

export type SocialSummaryKpis = {
  followers: number;
  reach: number;
  impressions: number;
  engagement: number;
  engagement_rate: number;
  likes: number;
  shares: number;
  comments: number;
};

export type SocialTopPost = {
  id: number;
  brandId: number;
  connectionId: number;
  externalId: string;
  publishedAt: string;
  type: "image" | "video" | "carousel" | "reel" | "story" | string;
  caption: string;
  mediaUrl: string | null;
  metrics: {
    likes: number;
    reach: number;
    shares: number;
    comments: number;
    engagement: number;
  };
};

export type SocialSummaryResponse = {
  brandId: number;
  from: string;
  to: string;
  kpis: SocialSummaryKpis;
  topPosts: SocialTopPost[];
};

export type SeriesPoint = { date: string; value: number };
export type SocialOverviewResponse = {
  connectionId: number;
  from: string;
  to: string;
  series: {
    likes?: SeriesPoint[];
    comments?: SeriesPoint[];
    shares?: SeriesPoint[];
    reach?: SeriesPoint[];
    impressions?: SeriesPoint[];
  };
};

function qs(params: Record<string, string | number | undefined>) {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return pairs.length ? `?${pairs.join("&")}` : "";
}

export type WebKpi = {
  label: string;
  value: number;
  delta: number;
  spark: number[];
};

export type WebOverviewResponse = {
  brandId: number;
  connectionId: number;
  from: string;
  to: string;
  kpis: WebKpi[];
  sessions: { current: number[]; previous: number[]; labels: string[] };
  sources: { name: string; sessions: number }[];
  pages: { path: string; views: number; time: string }[];
  devices: { name: string; value: number }[];
  funnel: { label: string; count: number; pct: number }[];
  stale: boolean;
  lastSyncAt: string | null;
};

export const analyticsApi = {
  socialSummary: (from: string, to: string) =>
    api.get<SocialSummaryResponse>(
      `/analytics/social/summary${qs({ from, to })}`,
    ),

  socialOverview: (connectionId: number, from: string, to: string) =>
    api.get<SocialOverviewResponse>(
      `/analytics/social/overview${qs({ connectionId, from, to })}`,
    ),

  socialTopPosts: (connectionId: number, limit = 8) =>
    api.get<SocialTopPost[]>(
      `/analytics/social/top-posts${qs({ connectionId, limit })}`,
    ),

  webOverview: (from: string, to: string, city?: string) =>
    api.get<WebOverviewResponse>(
      `/analytics/web/overview${qs({ from, to, city })}`,
    ),

  webCities: (from: string, to: string) =>
    api.get<string[]>(`/analytics/web/cities${qs({ from, to })}`),
};
