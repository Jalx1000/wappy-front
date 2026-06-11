import { api } from "./client";

export const analyticsApi = {
  social: (brandId: string) =>
    api.get<{
      kpis: unknown[];
      trend: { reach: number[]; labels: string[] };
      networks: unknown[];
      audience: { age: unknown[]; gender: unknown[]; geo: unknown[] };
      topPosts: unknown[];
    }>(`/brands/${brandId}/analytics/social`),

  ads: (brandId: string) =>
    api.get<{
      kpis: unknown[];
      platforms: unknown[];
      campaigns: unknown[];
      spendTrend: number[];
    }>(`/brands/${brandId}/analytics/ads`),

  web: (brandId: string) =>
    api.get<{
      kpis: unknown[];
      sessions: { current: number[]; previous: number[]; labels: string[] };
      sources: unknown[];
      pages: unknown[];
      devices: unknown[];
      funnel: unknown[];
    }>(`/brands/${brandId}/analytics/web`),
};
