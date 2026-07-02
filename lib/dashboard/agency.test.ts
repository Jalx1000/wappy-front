import { describe, it, expect } from "vitest";
import { parseSpend, agencyTotals, type AgencyBrandMetrics } from "./agency";

function metrics(p: Partial<AgencyBrandMetrics> = {}): AgencyBrandMetrics {
  return {
    brandId: "1",
    followers: 0,
    reach: 0,
    engagement: 0,
    engagementRate: 0,
    spend: 0,
    needsAttention: 0,
    ...p,
  };
}

describe("parseSpend", () => {
  it("parses a plain dollar amount", () => {
    // Ajinomoto real ads spend.
    expect(parseSpend("$15.38")).toBeCloseTo(15.38, 2);
  });

  it("expands K / M / B suffixes", () => {
    expect(parseSpend("$12.4K")).toBe(12400);
    expect(parseSpend("1.2M")).toBe(1_200_000);
    expect(parseSpend("$2B")).toBe(2_000_000_000);
  });

  it("passes finite numbers through and rejects non-finite", () => {
    expect(parseSpend(15.38)).toBe(15.38);
    expect(parseSpend(NaN)).toBe(0);
  });

  it("returns 0 for empty / unparseable input", () => {
    expect(parseSpend(null)).toBe(0);
    expect(parseSpend(undefined)).toBe(0);
    expect(parseSpend("$0.00")).toBe(0);
    expect(parseSpend("—")).toBe(0);
  });
});

describe("agencyTotals", () => {
  it("sums followers/reach/spend across brands and counts them", () => {
    const list = [
      metrics({ brandId: "a", followers: 238_000, reach: 602_000, spend: 0 }),
      metrics({ brandId: "b", followers: 182_000, reach: 80_000, spend: 15.38 }),
      metrics({ brandId: "c", followers: 56_000, reach: 33_000, spend: 0 }),
    ];
    const t = agencyTotals(list);
    expect(t.brands).toBe(3);
    expect(t.followers).toBe(476_000);
    expect(t.reach).toBe(715_000);
    expect(t.spend).toBeCloseTo(15.38, 2);
  });

  it("counts only brands with real activity (followers or reach > 0)", () => {
    const list = [
      metrics({ brandId: "a", followers: 100, reach: 0 }),   // active (followers)
      metrics({ brandId: "b", followers: 0, reach: 500 }),   // active (reach)
      metrics({ brandId: "c", followers: 0, reach: 0 }),     // no social → not active
    ];
    const t = agencyTotals(list);
    expect(t.brands).toBe(3);
    expect(t.withActivity).toBe(2);
  });

  it("returns zeroed totals for an empty agency", () => {
    expect(agencyTotals([])).toEqual({
      brands: 0,
      withActivity: 0,
      followers: 0,
      reach: 0,
      spend: 0,
    });
  });
});
