"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/ui/KpiCard";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/Segmented";
import { AreaChart } from "@/components/ui/AreaChart";
import { useUIStore } from "@/store/ui";
import {
  useBrands,
  useDashboard,
  useDashboardSeries,
  useConnections,
  useMe,
} from "@/lib/hooks";
import { CHANNEL_META } from "@/lib/mocks/data";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BRANDS as BRANDS_FALLBACK,
  DASH_SERIES,
  TREND_LABELS,
  SOCIAL_NETWORKS,
  BRAND_DELTAS,
} from "@/lib/mocks/data";

// ── Types ─────────────────────────────────────────────────────────────────────
type Period = "7d" | "30d" | "90d";
type View   = "brand" | "agency";
type Metric = keyof typeof DASH_SERIES;

const PERIODS: Record<Period, { label: string; mult: number; days: number; vs: string }> = {
  "7d":  { label: "7 días",  mult: 0.32, days: 7,  vs: "vs. semana previa" },
  "30d": { label: "30 días", mult: 1,    days: 30, vs: "vs. mes anterior" },
  "90d": { label: "90 días", mult: 2.85, days: 90, vs: "vs. trimestre previo" },
};

const KPI_META = [
  { id: "reach", goal: 82, goalLabel: "82% del objetivo mensual", vs: "vs. mes anterior" },
  { id: "eng",   goal: 96, goalLabel: "Meta 5.0%",                vs: "vs. mes anterior" },
  { id: "fans",  goal: 68, goalLabel: "68% del objetivo",         vs: "vs. mes anterior" },
  { id: "roas",  goal: 74, goalLabel: "Meta 5.0x",                vs: "vs. mes anterior" },
];

function parseNum(s: string) {
  const m = String(s).replace(/[$,\s]/g, "").match(/([\d.]+)\s*([KMB]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const u = (m[2] || "").toUpperCase();
  return n * (u === "B" ? 1e9 : u === "M" ? 1e6 : u === "K" ? 1e3 : 1);
}

function humanize(n: number, pre = "") {
  if (n >= 1e6) return pre + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1e3) return pre + (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + "K";
  return pre + Math.round(n);
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ── Dashboard skeleton layout ──────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="p-7 max-w-[1440px]">
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[...Array(4)].map((_, i) => <Skeleton.KPI key={i} />)}
      </div>
      <Skeleton.Chart height={220} className="mb-5" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton.Card key={i} lines={4} />)}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export function Dashboard() {
  const { activeBrand } = useUIStore();
  const { data: me } = useMe();
  const firstName =
    me?.firstName?.trim() || me?.email?.split("@")[0] || "";
  const { data: brands = BRANDS_FALLBACK } = useBrands();
  const brand = activeBrand ?? brands[0];

  const [view, setView]     = useState<View>("brand");
  const [period, setPeriod] = useState<Period>("30d");
  const [metric, setMetric] = useState<Metric>("reach");

  const P = PERIODS[period];
  const S = DASH_SERIES[metric];

  const { data: dashData, isPending } = useDashboard(brand?.id, P.days);
  const { data: conns = [] } = useConnections(brand?.id);
  const firstConnId = conns[0]?.id;
  const { data: realSeries } = useDashboardSeries(brand?.id, firstConnId, P.days);

  const kpis = dashData?.kpis ?? [];

  // Derive alerts from connection health (until backend has /alerts endpoint).
  const alerts: { type: string; text: string; brand: string }[] = conns
    .filter((c) => c.status === "reauth" || c.health === "warn" || c.health === "err")
    .map((c) => ({
      type: c.health === "err" || c.status === "reauth" ? "err" : "warn",
      text: `${CHANNEL_META[c.ch]?.label ?? c.ch} requiere atención`,
      brand: brand?.name ?? "",
    }));

  if (isPending) return <DashboardSkeleton />;

  // Map UI metric to backend series key.
  const METRIC_TO_BACKEND: Record<Metric, string | null> = {
    reach: "reach",
    inter: "likes",
    fans: null,
  };
  const backendKey = METRIC_TO_BACKEND[metric];
  const realSeriesPoints =
    backendKey && realSeries?.[backendKey]
      ? realSeries[backendKey]
      : null;

  // Build chart data: real series if available, mock fallback otherwise.
  let chartData: Array<{ label: string; value: number }>;
  if (realSeriesPoints && realSeriesPoints.length) {
    chartData = realSeriesPoints.map((p) => ({
      label: p.date.slice(5), // "MM-DD"
      value: p.value,
    }));
  } else {
    const rawData = P.days === 7 ? S.data.slice(-7) : S.data;
    const rawLabels = P.days === 7 ? ["", "", "", "", "", "", "Hoy"] : TREND_LABELS;
    chartData = rawData.map((v, i) => ({
      label: rawLabels[i],
      value: v * S.k * P.mult,
    }));
  }

  const criticalAlert = alerts.find((a) => a.type === "err");

  return (
    <div className="p-7 max-w-[1440px]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-end gap-4 mb-5 flex-wrap">
        <div>
          <h1
            className="leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: "-0.025em",
              color: "var(--color-text-primary)",
            }}
          >
            Hola{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {new Date().toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" })}{" "}
            ·{" "}
            {view === "agency" ? (
              <>vista de <strong style={{ color: "var(--color-text-primary)" }}>agencia</strong> · {brands.length} marcas</>
            ) : (
              <>resumen de <strong style={{ color: "var(--color-text-primary)" }}>{brand.name}</strong></>
            )}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <Segmented
            options={[
              { v: "brand",  l: "Mi marca" },
              { v: "agency", l: "Agencia" },
            ]}
            value={view}
            onChange={(v) => setView(v as View)}
          />
          <Segmented
            options={Object.entries(PERIODS).map(([k, v]) => ({ v: k, l: v.label }))}
            value={period}
            onChange={(v) => setPeriod(v as Period)}
          />
          <a href="/app/reports" className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1">
            <Icon name="download" size={15} /> Exportar resumen
          </a>
        </div>
      </div>

      {/* ── Critical alert banner ──────────────────────────────── */}
      {view === "brand" && criticalAlert && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-[18px] py-[13px] rounded-[14px] border mb-5"
          style={{ background: "var(--color-error-bg)", borderColor: "var(--color-error)" }}
        >
          <span
            className="flex items-center justify-center text-white rounded-[10px] flex-shrink-0"
            style={{ width: 36, height: 36, background: "var(--color-error)" }}
          >
            <Icon name="plug" size={18} color="#fff" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {criticalAlert.text}
            </div>
            <div className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
              Sin esta conexión los reportes de {criticalAlert.brand} dejarán de actualizarse.
            </div>
          </div>
          <a
            href="/app/connections"
            className="fobo-btn fobo-btn-sm flex-shrink-0 text-white"
            style={{ background: "var(--color-error)" }}
          >
            Reconectar ahora
          </a>
        </motion.div>
      )}

      {view === "agency" ? (
        <AgencyView period={period} P={P} brands={brands} alerts={alerts} />
      ) : (
        <BrandView
          brand={brand}
          period={period}
          P={P}
          metric={metric}
          setMetric={setMetric}
          S={S}
          chartData={chartData}
          kpis={kpis}
          alerts={alerts}
        />
      )}
    </div>
  );
}

// ── Brand view ─────────────────────────────────────────────────────────────────
function BrandView({ brand, P, metric, setMetric, S, chartData, kpis, alerts }: {
  brand: ReturnType<typeof useBrands>["data"] extends (infer T)[] | undefined ? T : never;
  period: Period;
  P: typeof PERIODS[Period];
  metric: Metric;
  setMetric: (m: Metric) => void;
  S: typeof DASH_SERIES[Metric];
  chartData: Array<{ label: string; value: number }>;
  kpis: { id: string; label: string; value: string; delta: number; spark: number[] }[];
  alerts: { type: string; text: string; brand: string }[];
}) {
  return (
    <>
      {/* KPI band */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 mb-5"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        {kpis.map((kpi) => {
          const meta = KPI_META.find((m) => m.id === kpi.id)!;
          return (
            <motion.div key={kpi.id} variants={fadeUp}>
              <KpiCard
                label={kpi.label}
                value={kpi.value}
                delta={kpi.delta}
                spark={kpi.spark}
                goal={meta?.goal ?? 0}
                goalLabel={meta?.goalLabel ?? ""}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main chart + side panels */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="fobo-card p-0 overflow-hidden"
        >
          <div
            className="flex items-center justify-between px-5 py-4 flex-wrap gap-2"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div>
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Evolución del rendimiento
              </div>
              <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                {brand.name} · últimos {P.days} días
              </div>
            </div>
            <Segmented
              sm
              options={Object.entries(DASH_SERIES).map(([k, v]) => ({
                v: k,
                l: v.label,
                dot: v.color,
              }))}
              value={metric}
              onChange={(v) => setMetric(v as Metric)}
            />
          </div>
          <div className="px-5 pt-4 pb-3">
            <AreaChart data={chartData} color={S.color} height={210} />
          </div>
          {/* Summary row */}
          <div
            className="grid gap-0 px-5 pb-5"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              borderTop: "1px solid var(--color-border)",
              paddingTop: 14,
            }}
          >
            {(() => {
              const vals = chartData.map((d) => d.value);
              const sum  = vals.reduce((a, b) => a + b, 0);
              const avg  = sum / vals.length;
              const best = Math.max(...vals);
              return [
                { label: "Total período",   val: humanize(sum) },
                { label: "Promedio diario", val: humanize(avg) },
                { label: "Mejor día",       val: humanize(best) },
              ];
            })().map(({ label, val }, i) => (
              <div
                key={label}
                className="py-3"
                style={{
                  paddingLeft: i ? 16 : 0,
                  borderLeft: i ? "1px solid var(--color-border)" : "none",
                  marginLeft: i ? 16 : 0,
                }}
              >
                <div className="text-[11.5px] mb-[4px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {label}
                </div>
                <div
                  className="tnum leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 20,
                    letterSpacing: "-0.02em",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column: channel + alerts */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fobo-card p-0 overflow-hidden flex-1"
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Por canal
              </div>
              <a
                href="/app/analytics/social"
                className="text-[12.5px] font-semibold"
                style={{ color: "var(--color-primary-ink)" }}
              >
                Ver analítica →
              </a>
            </div>
            <div className="px-2 py-1">
              {SOCIAL_NETWORKS.map((nw, i) => (
                <div
                  key={nw.ch}
                  className="flex items-center gap-3 px-3 py-[10px] rounded-[8px] cursor-pointer"
                  style={{
                    borderBottom:
                      i < SOCIAL_NETWORKS.length - 1 ? "1px solid var(--color-border)" : "none",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--color-background)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                >
                  <ChannelDot channel={nw.ch} size={30} radius={8} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {nw.ch.charAt(0).toUpperCase() + nw.ch.slice(1)}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {nw.followers} · {nw.posts} posts
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className="text-[13px] font-bold tnum"
                      style={{ color: "var(--color-secondary-ink)" }}
                    >
                      {nw.eng}
                    </div>
                    <div
                      className="inline-flex items-center gap-1 text-[11px] font-semibold"
                      style={{ color: "var(--color-success)" }}
                    >
                      <Icon name="arrowUp" size={10} color="var(--color-success)" />
                      {nw.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="fobo-card p-0 overflow-hidden flex-none"
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Alertas
              </div>
              <Badge variant="error">{alerts.filter((a) => a.type === "err").length} críticas</Badge>
            </div>
            <div className="px-2 py-1">
              {alerts.map((alert, i) => {
                const ic = alert.type === "err" ? "x" : alert.type === "warn" ? "warning" : "check";
                const bg =
                  alert.type === "err"
                    ? "var(--color-error-bg)"
                    : alert.type === "warn"
                    ? "var(--color-warning-bg)"
                    : "var(--color-success-bg)";
                const col =
                  alert.type === "err"
                    ? "var(--color-error)"
                    : alert.type === "warn"
                    ? "var(--color-warning)"
                    : "var(--color-success-dark)";
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-[10px] rounded-[8px]"
                    style={{
                      borderBottom: i < alerts.length - 1 ? "1px solid var(--color-border)" : "none",
                    }}
                  >
                    <span
                      className="flex items-center justify-center rounded-[8px] flex-shrink-0 mt-[2px]"
                      style={{ width: 26, height: 26, background: bg }}
                    >
                      <Icon name={ic as "x"} size={13} color={col} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium leading-snug" style={{ color: "var(--color-text-primary)" }}>
                        {alert.text}
                      </div>
                      <div className="text-[11px] mt-[3px]" style={{ color: "var(--color-text-tertiary)" }}>
                        {alert.brand}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// ── Agency view ────────────────────────────────────────────────────────────────
function AgencyView({
  period, P, brands, alerts,
}: {
  period: Period;
  P: typeof PERIODS[Period];
  brands: ReturnType<typeof useBrands>["data"] extends (infer T)[] | undefined ? T[] : never;
  alerts: { type: string; text: string; brand: string }[];
}) {
  const { setActiveBrand } = useUIStore();

  const totFollowers = brands.reduce((s, b) => s + parseNum(b.followers), 0);
  const totReach     = brands.reduce((s, b) => s + parseNum(b.reach), 0) * P.mult;
  const totSpend     = brands.reduce((s, b) => s + parseNum(b.spend), 0) * P.mult;

  const agencyKpis = [
    { label: "Marcas activas",       value: String(brands.length),             sub: `${brands.reduce((s, b) => s + b.team, 0)} personas en equipos`, icon: "brands" as const },
    { label: "Seguidores totales",   value: humanize(totFollowers),            sub: "en todas las redes",  icon: "users" as const, delta: 8.7 },
    { label: "Alcance combinado",    value: humanize(totReach),                sub: P.vs,                  icon: "eye" as const,   delta: 12.4 },
    { label: "Inversión gestionada", value: humanize(totSpend, "$"),           sub: P.vs,                  icon: "megaphone" as const, delta: 5.2 },
  ];

  const ranked = [...brands].sort((a, b) => parseNum(b.followers) - parseNum(a.followers));
  const attnCount = (name: string) =>
    alerts.filter((a) => a.brand === name && (a.type === "err" || a.type === "warn")).length;
  const maxReach = brands.length ? Math.max(...brands.map((b) => parseNum(b.reach))) : 0;
  const spenders = brands.map((b) => ({ b, v: parseNum(b.spend) }))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v);
  const spendTot = spenders.reduce((s, x) => s + x.v, 0);

  return (
    <>
      {/* Agency KPI band */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 mb-5"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        {agencyKpis.map((k) => (
          <motion.div key={k.label} variants={fadeUp}>
            <div className="fobo-card p-[18px]">
              <div className="flex items-center gap-[9px] mb-3">
                <span
                  className="flex items-center justify-center rounded-[9px] flex-shrink-0"
                  style={{
                    width: 32, height: 32,
                    background: "var(--color-primary-subtle)",
                    color: "var(--color-primary-ink)",
                  }}
                >
                  <Icon name={k.icon} size={16} color="var(--color-primary-ink)" />
                </span>
                <span className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                  {k.label}
                </span>
              </div>
              <div
                className="tnum leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 28,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text-primary)",
                }}
              >
                {k.value}
              </div>
              <div className="flex items-center gap-[7px] mt-[9px]">
                {"delta" in k && (
                  <span
                    className="inline-flex items-center gap-[2px] text-[12.5px] font-semibold"
                    style={{ color: "var(--color-success)" }}
                  >
                    <Icon name="arrowUp" size={12} color="var(--color-success)" />
                    {k.delta}%
                  </span>
                )}
                <span className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {k.sub}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Brand ranking + spend */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        {/* Ranking table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="fobo-card p-0 overflow-hidden"
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Ranking de marcas
            </div>
            <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
              Ordenadas por audiencia · clic para cambiar de marca
            </div>
          </div>
          {/* Column headers */}
          <div
            className="grid gap-2 px-5 py-2"
            style={{
              gridTemplateColumns: "28px 1.7fr 1fr 1fr 0.8fr 1fr",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {["#", "Marca", "Seguidores", "Alcance", "Eng.", "Estado"].map((h, i) => (
              <div
                key={h}
                className="text-[10.5px] font-bold uppercase"
                style={{
                  letterSpacing: "0.05em",
                  color: "var(--color-text-tertiary)",
                  textAlign: i >= 2 && i <= 4 ? "right" : "left",
                }}
              >
                {h}
              </div>
            ))}
          </div>
          {ranked.map((b, i) => {
            const attn = attnCount(b.name);
            return (
              <button
                key={b.id}
                onClick={() => setActiveBrand(b)}
                className="grid gap-2 px-5 py-[13px] w-full border-none cursor-pointer text-left transition-colors"
                style={{
                  gridTemplateColumns: "28px 1.7fr 1fr 1fr 0.8fr 1fr",
                  alignItems: "center",
                  fontFamily: "var(--font-ui)",
                  background: "transparent",
                  borderBottom: i < ranked.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-background)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
                    style={{ width: 36, height: 36, borderRadius: 10, background: b.tint }}
                  >
                    {b.short}
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-[13.5px] font-semibold truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {b.name}
                    </div>
                    <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {b.industry}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-[13.5px] font-bold tnum"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
                  >
                    {b.followers}
                  </div>
                  <div
                    className="inline-flex items-center gap-[2px] text-[11px] font-semibold"
                    style={{ color: "var(--color-success)" }}
                  >
                    <Icon name="arrowUp" size={10} color="var(--color-success)" />
                    {BRAND_DELTAS[b.id]}%
                  </div>
                </div>
                <div
                  className="text-right text-[13px] font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {b.reach}
                </div>
                <div
                  className="text-right text-[13px] font-semibold tnum"
                  style={{ color: "var(--color-secondary-ink)" }}
                >
                  {b.eng}
                </div>
                <div>
                  <span
                    className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold rounded-full px-[9px] py-[3px]"
                    style={{
                      background: attn ? "var(--color-warning-bg)" : "var(--color-success-bg)",
                      color: attn ? "var(--color-warning)" : "var(--color-success-dark)",
                    }}
                  >
                    <span
                      className="rounded-full"
                      style={{
                        width: 6, height: 6,
                        background: attn ? "var(--color-warning)" : "var(--color-success)",
                      }}
                    />
                    {attn ? `${attn} alerta${attn > 1 ? "s" : ""}` : "Saludable"}
                  </span>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Spend distribution + reach bars */}
        <div className="flex flex-col gap-4">
          {/* Spend donut-style bars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="fobo-card p-5"
          >
            <div className="text-[15px] font-semibold mb-[4px]" style={{ color: "var(--color-text-primary)" }}>
              Distribución de inversión
            </div>
            <div className="text-[12px] mb-5" style={{ color: "var(--color-text-tertiary)" }}>
              Pauta gestionada por marca
            </div>
            <div className="flex flex-col gap-[14px]">
              {spenders.map(({ b, v }, i) => (
                <div key={b.id}>
                  <div className="flex items-center gap-[9px] mb-[6px] text-[13px]">
                    <span
                      className="flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                      style={{ width: 22, height: 22, borderRadius: 6, background: b.tint }}
                    >
                      {b.short}
                    </span>
                    <span
                      className="flex-1 min-w-0 truncate font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {b.name}
                    </span>
                    <span
                      className="tnum font-bold flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
                    >
                      {b.spend}
                    </span>
                  </div>
                  <div
                    className="h-[8px] rounded-full overflow-hidden"
                    style={{ background: "var(--color-background)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(v / spendTot) * 100}%`,
                        background: b.tint,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className="flex items-center mt-4 pt-[14px]"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <span className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                Total gestionado
              </span>
              <span
                className="ml-auto tnum"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 18,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {humanize(spendTot, "$")}
              </span>
            </div>
          </motion.div>

          {/* Reach horizontal bars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="fobo-card p-5"
          >
            <div className="text-[15px] font-semibold mb-[4px]" style={{ color: "var(--color-text-primary)" }}>
              Alcance por marca
            </div>
            <div className="text-[12px] mb-4" style={{ color: "var(--color-text-tertiary)" }}>
              Comparativa · {P.label}
            </div>
            <div className="flex flex-col gap-[14px]">
              {ranked.map((b) => {
                const pct = (parseNum(b.reach) / maxReach) * 100;
                return (
                  <div key={b.id}>
                    <div className="flex items-center gap-2 mb-[5px]">
                      <span
                        className="flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                        style={{ width: 22, height: 22, borderRadius: 6, background: b.tint }}
                      >
                        {b.short}
                      </span>
                      <span
                        className="flex-1 min-w-0 text-[12.5px] font-medium truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {b.name}
                      </span>
                      <span
                        className="tnum font-semibold text-[12px] flex-shrink-0"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {b.reach}
                      </span>
                    </div>
                    <div
                      className="h-[7px] rounded-full overflow-hidden"
                      style={{ background: "var(--color-background)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: b.tint }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
