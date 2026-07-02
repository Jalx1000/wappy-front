// Pure, dependency-free dashboard metric logic. Kept separate from the hooks
// module (which pulls in next-auth / react-query) so it can be unit-tested in
// isolation. See lib/dashboard/kpis.test.ts.

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

// Dashboard KPI card. `prevValue` is the same metric's real value in the
// immediately-preceding period, shown as "Mes anterior: …".
export type KpiItem = {
  id: string;
  label: string;
  value: string;
  delta: number;
  spark: number[];
  prevValue?: string;
};

export type SeriesPoint = { date: string; value: number };

// Compact number formatting: 1_234 → "1.2K", 2_500_000 → "2.5M".
export function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}

// Percentage change vs. the previous period. Returns 0 (→ hidden in the card)
// when there is no comparable previous value.
export function pctChange(cur: number, prev: number): number {
  if (!prev || !Number.isFinite(prev)) return 0;
  return Number((((cur - prev) / prev) * 100).toFixed(1));
}

// Engagement rate the "by followers" way — interactions ÷ followers × 100 —
// falling back to reach then impressions. Real providers (Meta/TikTok/Instagram/
// YouTube) only emit raw `engagement` + `followers`; `engagement_rate` is emitted
// solely by the mock provider, so it must not be read directly.
export function engagementRate(k: {
  followers?: number;
  reach?: number;
  impressions?: number;
  engagement?: number;
}): number {
  const base =
    (k.followers ?? 0) > 0
      ? k.followers ?? 0
      : (k.reach ?? 0) > 0
        ? k.reach ?? 0
        : k.impressions ?? 0;
  return base > 0 ? ((k.engagement ?? 0) / base) * 100 : 0;
}

// Builds the four dashboard KPI cards from the current summary, plus the previous
// period's summary (when available) for the delta chip and "Mes anterior" value.
export function formatDashboardKpis(
  raw: DashboardKpisRaw,
  prev?: DashboardKpisRaw,
): KpiItem[] {
  const engRate = engagementRate(raw);
  const prevEngRate = prev ? engagementRate(prev) : 0;
  return [
    { id: "reach", label: "Alcance total", value: fmtNum(raw.reach ?? 0),       delta: prev ? pctChange(raw.reach ?? 0, prev.reach ?? 0) : 0,             spark: [], prevValue: prev ? fmtNum(prev.reach ?? 0) : undefined },
    { id: "eng",   label: "Engagement",    value: engRate.toFixed(1) + "%",     delta: prev ? pctChange(engRate, prevEngRate) : 0,                       spark: [], prevValue: prev ? prevEngRate.toFixed(1) + "%" : undefined },
    { id: "fans",  label: "Seguidores",    value: fmtNum(raw.followers ?? 0),   delta: prev ? pctChange(raw.followers ?? 0, prev.followers ?? 0) : 0,     spark: [], prevValue: prev ? fmtNum(prev.followers ?? 0) : undefined },
    { id: "roas",  label: "Impresiones",   value: fmtNum(raw.impressions ?? 0), delta: prev ? pctChange(raw.impressions ?? 0, prev.impressions ?? 0) : 0, spark: [], prevValue: prev ? fmtNum(prev.impressions ?? 0) : undefined },
  ];
}

// Picks the chart series for a metric: the primary series if it has points,
// otherwise the fallback (e.g. TikTok exposes `impressions` but not `reach`).
// Returns [] when neither exists so the caller can render an honest empty state.
export function pickSeries(
  series: Record<string, SeriesPoint[]> | undefined,
  backendKey: string,
  fallbackKey?: string,
): SeriesPoint[] {
  const primary = series?.[backendKey];
  if (primary && primary.length) return primary;
  if (fallbackKey) {
    const fb = series?.[fallbackKey];
    if (fb && fb.length) return fb;
  }
  return [];
}
