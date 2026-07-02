// Pure, dependency-free logic for the agency (multi-brand) dashboard view.
// Kept separate from the hooks module so it can be unit-tested in isolation.
// See lib/dashboard/agency.test.ts.

export type AgencyBrandMetrics = {
  brandId: string;
  followers: number;
  reach: number;
  engagement: number;
  engagementRate: number;
  spend: number;
  needsAttention: number; // count of expired/error connections
};

// Parses a formatted money/number KPI ("$15.38", "$12.4K", "1.2M") into a number.
// The ads overview endpoint only exposes spend as a formatted string, so this is
// how we recover the numeric value.
export function parseSpend(s: string | number | null | undefined): number {
  if (typeof s === "number") return Number.isFinite(s) ? s : 0;
  if (!s) return 0;
  const m = String(s).replace(/[$,\s]/g, "").match(/([\d.]+)\s*([KMB]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return 0;
  const u = (m[2] || "").toUpperCase();
  return n * (u === "B" ? 1e9 : u === "M" ? 1e6 : u === "K" ? 1e3 : 1);
}

// Aggregates per-brand metrics into the agency KPI band totals.
export function agencyTotals(list: AgencyBrandMetrics[]): {
  brands: number;
  withActivity: number;
  followers: number;
  reach: number;
  spend: number;
} {
  return {
    brands: list.length,
    withActivity: list.filter((m) => m.followers > 0 || m.reach > 0).length,
    followers: list.reduce((s, m) => s + m.followers, 0),
    reach: list.reduce((s, m) => s + m.reach, 0),
    spend: list.reduce((s, m) => s + m.spend, 0),
  };
}
