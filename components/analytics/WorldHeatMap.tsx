"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import type { WebCountryRow } from "@/lib/api/analytics";

export type CountryMetric = "sessions" | "users" | "conversions";

type CountryFeature = Feature<Geometry, { name: string }>;

const VB_W = 820;
const VB_H = 420;

const LOW: [number, number, number] = [0xe3, 0xed, 0xf6];
const HIGH: [number, number, number] = [0x0d, 0x5c, 0xa6];
const NO_DATA = "#EEF1F4";

// GA4 (CLDR) country name → Natural Earth topojson `properties.name`.
// Only the cases where the two spellings differ; everything else joins directly.
const ALIAS: Record<string, string> = {
  "united states": "united states of america",
  "myanmar burma": "myanmar",
  "bosnia herzegovina": "bosnia and herz",
  "congo kinshasa": "dem rep congo",
  "congo brazzaville": "congo",
  "dominican republic": "dominican rep",
  "central african republic": "central african rep",
  "south sudan": "s sudan",
  "equatorial guinea": "eq guinea",
  "western sahara": "w sahara",
  "solomon islands": "solomon is",
  "czech republic": "czechia",
  "north macedonia": "macedonia",
  "falkland islands islas malvinas": "falkland is",
};

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mix(t: number): string {
  const r = Math.round(LOW[0] + (HIGH[0] - LOW[0]) * t);
  const g = Math.round(LOW[1] + (HIGH[1] - LOW[1]) * t);
  const b = Math.round(LOW[2] + (HIGH[2] - LOW[2]) * t);
  return `rgb(${r},${g},${b})`;
}

export function WorldHeatMap({
  data,
  metric,
}: {
  data: WebCountryRow[];
  metric: CountryMetric;
}) {
  const [features, setFeatures] = useState<CountryFeature[] | null>(null);
  const [hover, setHover] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/geo/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        if (!alive) return;
        const fc = feature(topo, topo.objects.countries) as unknown as {
          features: CountryFeature[];
        };
        setFeatures(fc.features);
      })
      .catch(() => alive && setFeatures([]));
    return () => {
      alive = false;
    };
  }, []);

  // country (topojson name, normalized) → metric value
  const valueByCountry = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of data) {
      const key = ALIAS[norm(row.country)] ?? norm(row.country);
      m.set(key, (m.get(key) ?? 0) + (row[metric] ?? 0));
    }
    return m;
  }, [data, metric]);

  const max = useMemo(() => {
    let mx = 0;
    for (const v of valueByCountry.values()) mx = Math.max(mx, v);
    return mx;
  }, [valueByCountry]);

  const paths = useMemo(() => {
    if (!features || !features.length)
      return [] as { name: string; d: string; value: number }[];
    const proj = geoNaturalEarth1().fitSize([VB_W, VB_H], {
      type: "FeatureCollection",
      features,
    } as never);
    const path = geoPath(proj);
    return features.map((f) => ({
      name: f.properties?.name ?? "",
      d: path(f) ?? "",
      value: valueByCountry.get(norm(f.properties?.name ?? "")) ?? 0,
    }));
  }, [features, valueByCountry]);

  if (!features) {
    return (
      <div className="h-[300px] rounded-xl animate-pulse" style={{ background: "var(--color-background)" }} />
    );
  }

  if (max === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-[13px] text-center px-6" style={{ color: "var(--color-text-secondary)" }}>
        Sin datos de país en este período. Sincronizá la propiedad para ver el mapa.
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ display: "block" }}
        onMouseLeave={() => setHover(null)}
      >
        {paths.map((p) => {
          const t = p.value > 0 ? 0.18 + 0.82 * Math.sqrt(p.value / max) : 0;
          return (
            <path
              key={p.name}
              d={p.d}
              fill={p.value > 0 ? mix(t) : NO_DATA}
              stroke="#FFFFFF"
              strokeWidth={0.4}
              onMouseMove={(e) => {
                const rect = wrapRef.current?.getBoundingClientRect();
                setHover({
                  name: p.name,
                  value: p.value,
                  x: e.clientX - (rect?.left ?? 0),
                  y: e.clientY - (rect?.top ?? 0),
                });
              }}
              style={{ cursor: p.value > 0 ? "pointer" : "default", transition: "fill 0.2s" }}
            />
          );
        })}
      </svg>

      {/* legend */}
      <div className="flex items-center gap-2 mt-2 px-1">
        <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>0</span>
        <div className="h-2 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${mix(0.18)}, ${mix(1)})` }} />
        <span className="text-[11px] tnum" style={{ color: "var(--color-text-tertiary)" }}>
          {max.toLocaleString("es-BO")}
        </span>
      </div>

      {hover && hover.value > 0 && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg px-2.5 py-1.5 text-[12px] shadow-lg"
          style={{
            left: hover.x + 12,
            top: hover.y + 12,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        >
          <div className="font-semibold">{hover.name}</div>
          <div className="tnum" style={{ color: "var(--color-text-secondary)" }}>
            {hover.value.toLocaleString("es-BO")} {metric === "sessions" ? "sesiones" : metric === "users" ? "usuarios" : "conversiones"}
          </div>
        </div>
      )}
    </div>
  );
}
