"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { Sparkline, GroupedBars, Donut, HBars, Legend } from "./charts";
import { ANALYTICS, RANGES, RANGE_LABEL, RANGE_TOTAL, CHAN_COLOR, CHAN_LABEL, A_TINT, type Range } from "./data";

const card: CSSProperties = { background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)" };
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function CardHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function AnalyticsView() {
  const toast = useToast();
  const [range, setRange] = useState<Range>("7 days");
  const A = ANALYTICS;
  const kpis = A.kpis[range];
  const vol = A.volume[range];
  const AGENT_COLS = "2fr 1fr 1.2fr 1fr 1fr";

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--color-background)", height: "100%" }}>
      {/* Header */}
      <div className="flex items-center gap-3 sticky top-0 z-[4]" style={{ padding: "18px 28px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0 }}>Analytics de soporte</h1>
        <div className="ml-auto flex gap-1" style={{ background: "var(--color-background)", padding: 4, borderRadius: 10 }}>
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} className="cursor-pointer border-none" style={{ height: 32, padding: "0 14px", borderRadius: 7, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
              background: range === r ? "var(--color-surface)" : "transparent", color: range === r ? "var(--color-text-primary)" : "var(--color-text-secondary)", boxShadow: range === r ? "var(--shadow-2)" : "none" }}>{RANGE_LABEL[r]}</button>
          ))}
        </div>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => toast("Reporte exportado")}><Icon name="download" size={16} /> Exportar</button>
      </div>

      <div className="flex flex-col gap-5" style={{ padding: "24px 28px" }}>
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => {
            const goodDown = k.good === "down";
            const positive = goodDown ? k.delta < 0 : k.delta > 0;
            const col = positive ? "var(--color-success)" : "var(--color-error)";
            return (
              <div key={k.id} style={{ ...card, padding: 18 }}>
                <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 8 }}>{k.label}</div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: k.value.length > 5 ? 22 : 28, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--color-text-primary)", lineHeight: 1.05, whiteSpace: "nowrap" }}>{k.value}</div>
                    <div className="flex items-center gap-1" style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, color: col }}>
                      <Icon name={k.delta > 0 ? "arrowUp" : "arrowDown"} size={14} />{Math.abs(k.delta)}%
                    </div>
                  </div>
                  <Sparkline data={k.spark} color={col} width={78} height={40} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Volume + channels */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1.7fr 1fr" }}>
          <div style={card}>
            <CardHead title="Volumen de conversaciones" sub="Nuevas vs resueltas" />
            <div style={{ padding: "16px 20px" }}>
              <div className="flex gap-4" style={{ marginBottom: 10 }}>
                <Legend color="var(--color-primary)" label="Nuevas" />
                <Legend color="var(--color-success)" label="Resueltas" />
              </div>
              <GroupedBars height={220} data={{ labels: vol.labels, series: [{ name: "Nuevas", color: "var(--color-primary)", values: vol.newC }, { name: "Resueltas", color: "var(--color-success)", values: vol.resolved }] }} />
            </div>
          </div>
          <div style={card}>
            <CardHead title="Canales" sub="Reparto de conversaciones" />
            <div className="flex items-center gap-4" style={{ padding: 20 }}>
              <div className="relative flex-none">
                <Donut segments={A.channels.map((c) => ({ color: CHAN_COLOR[c.ch], value: c.value }))} size={150} thickness={24} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>{RANGE_TOTAL[range]}</div>
                  <div style={{ fontSize: 10.5, color: "var(--color-text-tertiary)" }}>total</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {A.channels.map((c) => (
                  <div key={c.ch} className="flex items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: CHAN_COLOR[c.ch], flex: "none" }} />
                    <span className="flex-1" style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>{CHAN_LABEL[c.ch]}</span>
                    <span className="tnum" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Response dist + CSAT */}
        <div className="grid grid-cols-2 gap-4">
          <div style={card}>
            <CardHead title="Tiempo de primera respuesta" sub="Distribución de conversaciones" />
            <div style={{ padding: "18px 20px" }}>
              <HBars rows={A.responseDist.labels.map((l, i) => ({ label: l, value: A.responseDist.values[i], color: i < 2 ? "var(--color-success)" : i < 3 ? "var(--color-warning)" : "var(--color-error)" }))} />
            </div>
          </div>
          <div style={card}>
            <CardHead title="Satisfacción del cliente" sub="Respuestas CSAT" />
            <div className="flex items-center gap-6" style={{ padding: 20 }}>
              <div className="text-center">
                <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--color-success)" }}>{kpis.find((k) => k.id === "csat")?.value}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>satisfechos</div>
              </div>
              <div className="flex-1 flex flex-col gap-2.5">
                {([["😍 Genial", 78, "var(--color-success)"], ["🙂 Regular", 19, "var(--color-warning)"], ["😞 Malo", 3, "var(--color-error)"]] as [string, number, string][]).map(([l, v, c]) => (
                  <div key={l} className="flex items-center gap-2.5">
                    <span style={{ width: 72, fontSize: 12.5, color: "var(--color-text-secondary)" }}>{l}</span>
                    <div style={{ flex: 1, height: 10, borderRadius: 9999, background: "var(--neutral-200)", overflow: "hidden" }}><div style={{ width: v + "%", height: "100%", background: c, borderRadius: 9999 }} /></div>
                    <span className="tnum" style={{ width: 34, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" }}>{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Agent leaderboard */}
        <div style={card}>
          <CardHead title="Rendimiento por agente" sub="Ordenado por conversaciones resueltas" />
          <div className="grid" style={{ gridTemplateColumns: AGENT_COLS, gap: 12, padding: "10px 20px", borderBottom: "1px solid var(--color-border)" }}>
            {["Agente", "Conversaciones", "Resp. mediana", "CSAT", "Resueltas"].map((h, i) => <div key={i} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)", textAlign: i ? "right" : "left" }}>{h}</div>)}
          </div>
          {A.agents.map((ag, i) => {
            const t = A_TINT[ag.tint];
            return (
              <div key={ag.name} className="grid items-center" style={{ gridTemplateColumns: AGENT_COLS, gap: 12, padding: "12px 20px", borderBottom: i < A.agents.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", width: 16 }}>{i + 1}</span>
                  <span className="flex items-center justify-center rounded-full" style={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, background: t.bg, color: t.fg }}>{initials(ag.name)}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{ag.name}</span>
                </div>
                <div className="tnum text-right" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{ag.convos}</div>
                <div className="tnum text-right" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{ag.avg}</div>
                <div className="text-right"><Badge variant="success">{ag.csat}%</Badge></div>
                <div className="tnum text-right" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{ag.resolved}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
