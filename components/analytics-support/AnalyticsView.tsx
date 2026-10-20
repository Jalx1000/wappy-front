"use client";

import { useState, type CSSProperties } from "react";
import { Badge } from "@/components/ui/Badge";
import { GroupedBars, Donut, HBars, Legend } from "./charts";
import { CHAN_COLOR, CHAN_LABEL, RANGES, RANGE_LABEL, type Range } from "./data";
import { useSupportMetrics } from "@/lib/hooks/supportMetrics";

const card: CSSProperties = { background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)" };

const RANGE_DAYS: Record<Range, number> = { "7 days": 7, "30 days": 30, "90 days": 90 };
const RESPONSE_BUCKETS = ["<1m", "1-5m", "5-30m", "30m-2h", ">2h"];

function fmtDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function CardHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 8 }}>{label}</div>
      <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--color-text-primary)", lineHeight: 1.05 }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-text-tertiary)" }}>{sub}</div>
    </div>
  );
}

export function AnalyticsView() {
  const [range, setRange] = useState<Range>("7 days");
  const { data: m, isLoading, isError, refetch } = useSupportMetrics(RANGE_DAYS[range]);
  const AGENT_COLS = "2fr 1fr 1.2fr 1fr 1fr";

  const channelSegments = m
    ? Object.entries(m.conversations.byChannel).map(([ch, value]) => ({ color: CHAN_COLOR[ch] ?? "var(--color-text-tertiary)", value }))
    : [];
  const channelTotal = m ? Object.values(m.conversations.byChannel).reduce((s, n) => s + n, 0) : 0;

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--color-background)", height: "100%" }}>
      <div className="flex items-center gap-3 sticky top-0 z-[4]" style={{ padding: "18px 28px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0 }}>Analytics de soporte</h1>
        <div className="ml-auto flex gap-1" style={{ background: "var(--color-background)", padding: 4, borderRadius: 10 }}>
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} className="cursor-pointer border-none" style={{ height: 32, padding: "0 14px", borderRadius: 7, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
              background: range === r ? "var(--color-surface)" : "transparent", color: range === r ? "var(--color-text-primary)" : "var(--color-text-secondary)", boxShadow: range === r ? "var(--shadow-2)" : "none" }}>{RANGE_LABEL[r]}</button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center" style={{ height: 240, color: "var(--color-text-tertiary)", fontSize: 14 }}>Cargando métricas…</div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-3" style={{ height: 240 }}>
          <span style={{ color: "var(--color-error)", fontSize: 14 }}>No se pudieron cargar las métricas.</span>
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      {m && (
        <div className="flex flex-col gap-5" style={{ padding: "24px 28px" }}>
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Conversaciones" value={String(m.conversations.total)} sub={`${m.conversations.active} activas en el período`} />
            <KpiCard label="1ª respuesta (mediana)" value={fmtDuration(m.responseTime.medianSeconds)} sub="desde el primer entrante" />
            <KpiCard label="Resueltas" value={String(m.byStatus.resolved ?? 0)} sub={`${m.byStatus.open ?? 0} abiertas`} />
            <KpiCard label="CSAT" value={m.csat.average != null ? `${m.csat.average}/5` : "—"} sub={m.csat.count === 0 ? "sin respuestas" : `${m.csat.count} respuestas`} />
          </div>

          {/* Volume + channels */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "1.7fr 1fr" }}>
            <div style={card}>
              <CardHead title="Volumen de conversaciones" sub="Nuevas vs resueltas (por día)" />
              <div style={{ padding: "16px 20px" }}>
                {m.volumeSeries.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13 }}>Sin actividad en el período</div>
                ) : (
                  <>
                    <div className="flex gap-4" style={{ marginBottom: 10 }}>
                      <Legend color="var(--color-primary)" label="Nuevas" />
                      <Legend color="var(--color-success)" label="Resueltas" />
                    </div>
                    <GroupedBars height={220} data={{ labels: m.volumeSeries.map((p) => p.date.slice(5)), series: [
                      { name: "Nuevas", color: "var(--color-primary)", values: m.volumeSeries.map((p) => p.created) },
                      { name: "Resueltas", color: "var(--color-success)", values: m.volumeSeries.map((p) => p.resolved) },
                    ] }} />
                  </>
                )}
              </div>
            </div>
            <div style={card}>
              <CardHead title="Canales" sub="Reparto de conversaciones" />
              <div className="flex items-center gap-4" style={{ padding: 20 }}>
                <div className="relative flex-none">
                  <Donut segments={channelSegments} size={150} thickness={24} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>{channelTotal}</div>
                    <div style={{ fontSize: 10.5, color: "var(--color-text-tertiary)" }}>total</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {Object.entries(m.conversations.byChannel).map(([ch, value]) => (
                    <div key={ch} className="flex items-center gap-2">
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: CHAN_COLOR[ch] ?? "var(--color-text-tertiary)", flex: "none" }} />
                      <span className="flex-1" style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>{CHAN_LABEL[ch] ?? ch}</span>
                      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{value}</span>
                    </div>
                  ))}
                  {channelTotal === 0 && <span style={{ fontSize: 12.5, color: "var(--color-text-tertiary)" }}>Sin conversaciones</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Response dist + CSAT */}
          <div className="grid grid-cols-2 gap-4">
            <div style={card}>
              <CardHead title="Tiempo de primera respuesta" sub="Distribución de conversaciones" />
              <div style={{ padding: "18px 20px" }}>
                <HBars rows={RESPONSE_BUCKETS.map((b, i) => ({ label: b, value: m.responseTime.distribution[b] ?? 0, color: i < 2 ? "var(--color-success)" : i < 3 ? "var(--color-warning)" : "var(--color-error)" }))} />
              </div>
            </div>
            <div style={card}>
              <CardHead title="Satisfacción del cliente" sub="Respuestas CSAT" />
              <div className="flex items-center gap-6" style={{ padding: 20 }}>
                <div className="text-center">
                  <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--color-success)" }}>{m.csat.average != null ? m.csat.average : "—"}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{m.csat.count} respuestas</div>
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                  {[5, 4, 3, 2, 1].map((score) => {
                    const n = m.csat.distribution[String(score)] ?? 0;
                    const pct = m.csat.count > 0 ? Math.round((n / m.csat.count) * 100) : 0;
                    const c = score >= 4 ? "var(--color-success)" : score === 3 ? "var(--color-warning)" : "var(--color-error)";
                    return (
                      <div key={score} className="flex items-center gap-2.5">
                        <span style={{ width: 28, fontSize: 12.5, color: "var(--color-text-secondary)" }}>{score}★</span>
                        <div style={{ flex: 1, height: 10, borderRadius: 9999, background: "var(--neutral-200)", overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: c, borderRadius: 9999 }} /></div>
                        <span className="tnum" style={{ width: 34, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" }}>{pct}%</span>
                      </div>
                    );
                  })}
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
            {m.agents.length === 0 && <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13 }}>Sin datos de agentes todavía</div>}
            {m.agents.map((ag, i) => (
              <div key={ag.userId} className="grid items-center" style={{ gridTemplateColumns: AGENT_COLS, gap: 12, padding: "12px 20px", borderBottom: i < m.agents.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", width: 16 }}>{i + 1}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>Agente #{ag.userId}</span>
                </div>
                <div className="tnum text-right" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{ag.convos}</div>
                <div className="tnum text-right" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{fmtDuration(ag.medianResponseSeconds)}</div>
                <div className="text-right">{ag.csatAverage != null ? <Badge variant="success">{ag.csatAverage}/5</Badge> : <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>—</span>}</div>
                <div className="tnum text-right" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{ag.resolved}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
