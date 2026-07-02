import { describe, it, expect } from "vitest";
import {
  engagementRate,
  pctChange,
  fmtNum,
  formatDashboardKpis,
  pickSeries,
  type DashboardKpisRaw,
  type SeriesPoint,
} from "./kpis";

// Helper: a full DashboardKpisRaw with sensible zeros, overridable per test.
function raw(partial: Partial<DashboardKpisRaw> = {}): DashboardKpisRaw {
  return {
    followers: 0,
    reach: 0,
    impressions: 0,
    engagement: 0,
    engagement_rate: 0,
    likes: 0,
    shares: 0,
    comments: 0,
    ...partial,
  };
}

describe("engagementRate", () => {
  it("computes interactions ÷ followers × 100 (by-followers definition)", () => {
    // PowerPlate real data: engagement 3184, followers 16551.
    expect(engagementRate({ engagement: 3184, followers: 16551 })).toBeCloseTo(19.24, 2);
  });

  it("IGNORES the backend engagement_rate field (only the mock provider emits it)", () => {
    // Even with a bogus engagement_rate present, the result derives from
    // engagement/followers — this is the regression guard for "Engagement = 0".
    const r = raw({ engagement: 500, followers: 1000, engagement_rate: 999 });
    expect(engagementRate(r)).toBe(50);
  });

  it("falls back to reach when there are no followers", () => {
    expect(engagementRate({ engagement: 200, followers: 0, reach: 1000 })).toBe(20);
  });

  it("falls back to impressions when there are no followers or reach", () => {
    expect(engagementRate({ engagement: 50, followers: 0, reach: 0, impressions: 500 })).toBe(10);
  });

  it("returns an honest 0 when there is no base at all (Sensia real case)", () => {
    // Sensia: engagement 0, followers 0, reach 23 → base reach → 0/23 = 0.
    expect(engagementRate({ engagement: 0, followers: 0, reach: 23 })).toBe(0);
    expect(engagementRate({})).toBe(0);
  });
});

describe("pctChange", () => {
  it("returns the rounded percentage increase vs. the previous value", () => {
    expect(pctChange(120, 100)).toBe(20);
    expect(pctChange(150, 120)).toBe(25);
  });

  it("returns a negative percentage when the value dropped", () => {
    expect(pctChange(80, 100)).toBe(-20);
  });

  it("rounds to one decimal place", () => {
    expect(pctChange(1234, 1000)).toBe(23.4);
  });

  it("returns 0 (→ chip hidden) when there is no comparable previous value", () => {
    expect(pctChange(500, 0)).toBe(0);
    expect(pctChange(500, NaN)).toBe(0);
  });
});

describe("fmtNum", () => {
  it("formats thousands and millions compactly", () => {
    expect(fmtNum(1_700_000)).toBe("1.7M");
    expect(fmtNum(9130)).toBe("9.1K");
    expect(fmtNum(523)).toBe("523");
  });

  it("guards against non-finite input", () => {
    expect(fmtNum(NaN)).toBe("0");
  });
});

describe("formatDashboardKpis", () => {
  it("returns the four dashboard KPIs in order", () => {
    const kpis = formatDashboardKpis(raw());
    expect(kpis.map((k) => k.id)).toEqual(["reach", "eng", "fans", "roas"]);
  });

  it("derives Engagement from engagement/followers, not engagement_rate (regression)", () => {
    const kpis = formatDashboardKpis(
      raw({ engagement: 500, followers: 1000, engagement_rate: 0 }),
    );
    const eng = kpis.find((k) => k.id === "eng")!;
    // engagement_rate is 0 but the card must still show a real 50.0%.
    expect(eng.value).toBe("50.0%");
  });

  it("without a previous period: delta 0 and no prevValue (chip stays hidden)", () => {
    const kpis = formatDashboardKpis(raw({ reach: 1000, followers: 500, impressions: 2000, engagement: 50 }));
    for (const k of kpis) {
      expect(k.delta).toBe(0);
      expect(k.prevValue).toBeUndefined();
    }
  });

  it("with a previous period: computes deltas and the 'Mes anterior' value", () => {
    const cur = raw({ reach: 1_900_000, followers: 9130, impressions: 8_000_000, engagement: 900 });
    const prev = raw({ reach: 1_700_000, followers: 8000, impressions: 7_000_000, engagement: 800 });
    const kpis = formatDashboardKpis(cur, prev);

    const reach = kpis.find((k) => k.id === "reach")!;
    expect(reach.value).toBe("1.9M");
    expect(reach.prevValue).toBe("1.7M");
    expect(reach.delta).toBeCloseTo(11.8, 1); // (1.9M-1.7M)/1.7M

    const fans = kpis.find((k) => k.id === "fans")!;
    expect(fans.prevValue).toBe("8K");
    expect(fans.delta).toBeCloseTo(14.1, 1); // (9130-8000)/8000
  });
});

describe("pickSeries (chart metric selection with fallback)", () => {
  const pts = (n: number): SeriesPoint[] =>
    Array.from({ length: n }, (_, i) => ({ date: `2026-06-${i + 1}`, value: i + 1 }));

  it("returns the primary series when it has points", () => {
    const series = { reach: pts(3), impressions: pts(5) };
    expect(pickSeries(series, "reach", "impressions")).toHaveLength(3);
  });

  it("falls back to impressions when reach is empty (TikTok real case)", () => {
    // TikTok conn 135: reach series is empty, impressions has 7 points.
    const series = { reach: [] as SeriesPoint[], impressions: pts(7) };
    expect(pickSeries(series, "reach", "impressions")).toHaveLength(7);
  });

  it("falls back when the primary key is missing entirely", () => {
    const series = { impressions: pts(4) };
    expect(pickSeries(series, "reach", "impressions")).toHaveLength(4);
  });

  it("returns [] (honest empty state) when neither series exists", () => {
    expect(pickSeries({ likes: pts(2) }, "reach", "impressions")).toEqual([]);
    expect(pickSeries(undefined, "reach", "impressions")).toEqual([]);
  });

  it("returns [] when there is no fallback and the primary is empty", () => {
    expect(pickSeries({ engagement: [] as SeriesPoint[] }, "engagement")).toEqual([]);
  });
});
