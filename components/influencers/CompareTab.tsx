"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { INFLUENCERS_DATA, TIER_COLORS } from "@/lib/mocks/analyticsData";
import type { InfluencerItem } from "@/lib/mocks/analyticsData";

const CMP_ROWS: Array<{
  label: string;
  key: keyof InfluencerItem;
  format: (v: unknown) => string | number;
  dir: 1 | -1 | 0;
}> = [
  { label: "Seguidores", key: "followers", format: (v: unknown) => String(v), dir: 1 },
  { label: "Engagement", key: "eng", format: (v: unknown) => String(v), dir: 1 },
  { label: "Alcance prom.", key: "reach", format: (v: unknown) => String(v || "—"), dir: 1 },
  { label: "ROI", key: "roi", format: (v: unknown) => (v ? `${v}x` : "—"), dir: 1 },
  { label: "Costo x interacción (CPE)", key: "cpe", format: (v: unknown) => (v ? `$${(v as number).toFixed(2)}` : "—"), dir: -1 },
  { label: "CPM", key: "cpm", format: (v: unknown) => (v ? `$${(v as number).toFixed(2)}` : "—"), dir: -1 },
  { label: "Tarifa x post", key: "rateCard", format: (v: unknown) => String(v), dir: -1 },
  {
    label: "Audiencia femenina",
    key: "audience",
    format: (v: unknown) => (v ? `${(v as any).gender?.[0]?.value || 0}%` : "—"),
    dir: 0,
  },
  { label: "Rating", key: "rating", format: (v: unknown) => (v ? `★ ${v}` : "—"), dir: 1 },
  { label: "Días libres (jun)", key: "id", format: () => "—", dir: 1 },
];

export function CompareTab() {
  const [selected, setSelected] = useState<string[]>(["i1", "i2"]);

  const selectedInfluencers = useMemo(() => {
    return INFLUENCERS_DATA.filter((i) => selected.includes(i.id));
  }, [selected]);

  const toggleInfluencer = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((x) => x !== id) : prev;
      } else {
        return prev.length < 4 ? [...prev, id] : prev;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="fobo-card p-4">
        <div
          className="text-[12.5px] font-semibold mb-3"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Elige hasta 4 creadores para comparar
        </div>
        <div className="flex flex-wrap gap-2.25">
          {INFLUENCERS_DATA.map((inf) => {
            const isSelected = selected.includes(inf.id);
            const canSelect = isSelected || selected.length < 4;

            return (
              <button
                key={inf.id}
                onClick={() => toggleInfluencer(inf.id)}
                className="flex items-center gap-2.25 px-3 py-1.5 rounded-full cursor-pointer transition-all"
                style={{
                  fontFamily: "var(--font-ui)",
                  border: isSelected
                    ? "1.5px solid var(--color-primary)"
                    : "1px solid var(--color-border)",
                  background: isSelected
                    ? "var(--color-primary-subtle)"
                    : "var(--color-surface)",
                  opacity: canSelect ? 1 : 0.5,
                  cursor: canSelect ? "pointer" : "not-allowed",
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                  style={{ background: inf.tint || "#0D5CA6" }}
                >
                  {inf.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <span
                  className="text-[12.5px] font-semibold"
                  style={{
                    color: isSelected ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
                  }}
                >
                  {inf.name}
                </span>
                {isSelected && <Icon name="check2" size={14} style={{ color: "var(--color-primary-ink)" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedInfluencers.length < 2 ? (
        <div
          className="fobo-card p-12 text-center"
          style={{ background: "var(--color-background)" }}
        >
          <div className="w-13 h-13 rounded-3.5 mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--color-secondary-subtle)" }}>
            <Icon name="star" size={26} style={{ color: "var(--color-secondary-ink)" }} />
          </div>
          <div className="text-[15px] font-semibold mb-0.75" style={{ color: "var(--color-text-primary)" }}>
            Selecciona al menos 2 creadores
          </div>
          <div className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
            Compara métricas, costos y disponibilidad lado a lado.
          </div>
        </div>
      ) : (
        <div className="fobo-card overflow-hidden overflow-x-auto">
          {/* Header with creator cards */}
          <div
            className="flex border-b"
            style={{
              borderColor: "var(--color-border)",
              gridTemplateColumns: `220px repeat(${selectedInfluencers.length}, 1fr)`,
            }}
          >
            {/* Metric label column */}
            <div
              className="p-4 flex items-end text-[11px] font-bold uppercase flex-shrink-0"
              style={{
                width: "220px",
                color: "var(--color-text-tertiary)",
                letterSpacing: "0.05em",
              }}
            >
              Métrica
            </div>

            {/* Influencer cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${selectedInfluencers.length}, 1fr)`,
                gap: 0,
              }}
            >
              {selectedInfluencers.map((inf, i) => (
                <div
                  key={inf.id}
                  className="p-4 text-center border-l"
                  style={{
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full mx-auto flex items-center justify-center text-white font-bold text-sm mb-2"
                    style={{ background: inf.tint || "#0D5CA6" }}
                  >
                    {inf.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="text-[13.5px] font-semibold mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                    {inf.name}
                  </div>
                  <div
                    className="text-[11.5px] flex items-center justify-center gap-1.25 mt-0.5"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {inf.ch && <ChannelDot channel={inf.ch} size={14} radius={4} />}
                    <span>{inf.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metric rows */}
          {CMP_ROWS.map((row, ri) => {
            const chosen = selectedInfluencers;
            const vals = chosen.map((inf, i) => {
              if (row.key === "id") {
                // Días libres calculation
                return 30; // Mock: always 30 for now
              }
              if (row.key === "rateCard") {
                return inf.rateCard?.Post || 0;
              }
              if (row.key === "audience") {
                return inf.audience?.gender?.[0]?.value || 0;
              }
              const val = (inf as any)[row.key];
              if (typeof val === "number") return val;
              if (typeof val === "string" && row.key === "followers") return parseInt(val) || 0;
              return 0;
            });

            let bestVal: number | null = null;
            if (row.dir === 1) bestVal = Math.max(...(vals as number[]));
            else if (row.dir === -1) bestVal = Math.min(...(vals as number[]));

            return (
              <div
                key={row.label}
                className="flex border-b"
                style={{
                  borderColor: "var(--color-border)",
                  background: ri % 2 ? "var(--color-background)" : "transparent",
                }}
              >
                {/* Metric label */}
                <div
                  className="p-3.25 text-[12.5px] flex items-center flex-shrink-0"
                  style={{
                    width: "220px",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {row.label}
                </div>

                {/* Values */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${chosen.length}, 1fr)`,
                    gap: 0,
                  }}
                >
                  {chosen.map((inf, ci) => {
                    let formatted: string | number = "—";

                    if (row.key === "id") {
                      formatted = "30 días";
                    } else if (row.key === "rateCard") {
                      formatted = `$${(inf.rateCard?.Post || 0).toLocaleString()}`;
                    } else if (row.key === "audience") {
                      formatted = `${inf.audience?.gender?.[0]?.value || 0}%`;
                    } else {
                      const value = (inf as any)[row.key];
                      formatted = row.format(value);
                    }

                    const isBest = row.dir !== 0 && vals[ci] === bestVal && chosen.length > 1;

                    return (
                      <div
                        key={inf.id}
                        className="p-3.25 border-l text-center flex items-center justify-center gap-1.5"
                        style={{
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <span
                          className="text-[14px] font-semibold"
                          style={{
                            color: isBest ? "var(--color-success-dark)" : "var(--color-text-primary)",
                            fontWeight: isBest ? 700 : 600,
                            fontFamily: "var(--ff-display)",
                          }}
                        >
                          {formatted}
                        </span>
                        {isBest && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.25 rounded-full"
                            style={{
                              color: "var(--color-success-dark)",
                              background: "var(--color-success-bg)",
                            }}
                          >
                            mejor
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
