"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart as ReAreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/ui/StatTile";
import { Panel } from "@/components/ui/Panel";
import { HBars } from "@/components/ui/HBars";
import { DonutChart } from "@/components/ui/DonutChart";
import { Icon } from "@/components/ui/Icon";
import { useUIStore } from "@/store/ui";
import {
  useWebAnalytics,
  useWebCities,
  useWebCountries,
  useGa4Properties,
  useSyncConnectionMutation,
  useBrands,
} from "@/lib/hooks";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { WorldHeatMap, type CountryMetric } from "@/components/analytics/WorldHeatMap";
import { DateRangeInputs } from "@/components/ui/DateRangeInputs";

const RANGE_OPTS = [{ v: "7d", l: "7 días" }, { v: "30d", l: "30 días" }, { v: "90d", l: "90 días" }];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function DualAreaChart({ current, previous, labels }: {
  current: number[];
  previous: number[];
  labels: string[];
}) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const grid = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const axis = dark ? "#60606E" : "#939393";
  const bg   = dark ? "#2A2B32" : "#FFFFFF";
  const bdr  = dark ? "rgba(255,255,255,0.1)" : "#E8E8EC";

  const data = current.map((v, i) => ({
    label: labels[i],
    este:  v,
    prev:  previous[i] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <ReAreaChart data={data} margin={{ top: 6, right: 4, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="gEste" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopcolor="#c8f304" stopOpacity={0.18} />
            <stop offset="100%" stopcolor="#c8f304" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34BDF6" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#34BDF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: axis, fontFamily: "Inter,sans-serif" }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`)} tick={{ fontSize: 11, fill: axis, fontFamily: "Inter,sans-serif" }} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={{ background: bg, border: `1px solid ${bdr}`, borderRadius: 10, fontSize: 12, padding: "7px 12px" }} formatter={(v) => [`${typeof v === "number" ? v.toLocaleString("es-BO") : 0} sesiones`, ""]} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: axis }} />
        <Area type="monotone" dataKey="este" name="Este período" stroke="#0D5CA6" strokeWidth={2.5} fill="url(#gEste)" dot={false} activeDot={{ r: 4, fill: "#0D5CA6", strokeWidth: 0 }} />
        <Area type="monotone" dataKey="prev" name="Período anterior" stroke="#34BDF6" strokeWidth={1.5} fill="url(#gPrev)" dot={false} strokeDasharray="4 3" activeDot={{ r: 3, fill: "#34BDF6", strokeWidth: 0 }} />
      </ReAreaChart>
    </ResponsiveContainer>
  );
}

function WebSkeleton() {
  return (
    <div className="p-7 max-w-[1440px] flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton.KPI key={i} />)}
      </div>
      <Skeleton.Chart height={220} />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton.Card lines={4} />
        <Skeleton.Card lines={4} />
      </div>
    </div>
  );
}

export function WebGA4() {
  const [range, setRange] = useState("30d");
  const [city, setCity] = useState<string>("");
  const [connId, setConnId] = useState<number | undefined>(undefined);
  const [mapMetric, setMapMetric] = useState<CountryMetric>("sessions");
  const toast = useToast();
  const { activeBrand } = useUIStore();
  const { data: brands = BRANDS_FALLBACK } = useBrands();
  const brand = activeBrand ?? brands[0];

  const properties = useGa4Properties(brand?.id);
  const effectiveConnId = connId ?? properties[0]?.connectionId;

  const { data, isPending, isError, error } = useWebAnalytics(brand?.id, range, {
    city: city || undefined,
    connectionId: effectiveConnId,
  });
  const { data: cities = [] } = useWebCities(brand?.id, range, effectiveConnId);
  const { data: countries = [] } = useWebCountries(
    brand?.id,
    range,
    effectiveConnId,
  );
  const syncMutation = useSyncConnectionMutation(brand?.id);

  const handleSync = () => {
    if (!effectiveConnId) return;
    syncMutation.mutate(effectiveConnId, {
      onSuccess: () => toast("Propiedad sincronizada", "info"),
      onError: () => toast("No se pudo sincronizar la propiedad", "info"),
    });
  };

  if (isPending) return <WebSkeleton />;

  const notConnected =
    isError &&
    (error as { status?: number })?.status === 404;

  if (notConnected) {
    return (
      <div className="p-7 max-w-[1440px] flex flex-col gap-4">
        <h1
          style={{
            fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22,
            letterSpacing: "-0.02em", color: "var(--color-text-primary)",
          }}
        >
          Web · GA4
        </h1>
        <div
          className="rounded-xl p-6 text-center"
          style={{
            border: "1px dashed var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <div className="text-[15px] font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
            Conectá una property GA4 para ver datos reales.
          </div>
          <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Andá a <strong>Conexiones</strong> y autorizá Google Analytics 4 para <strong>{brand.name}</strong>.
          </div>
        </div>
      </div>
    );
  }

  const kpis    = data?.kpis    ?? [];
  const sessions = data?.sessions ?? { current: [], previous: [], labels: [] };
  const sources = data?.sources ?? [];
  const pages   = data?.pages   ?? [];
  const devices = data?.devices ?? [];
  const funnel  = data?.funnel  ?? [];

  const topDevice = devices.length
    ? devices.reduce((a, b) => (b.value > a.value ? b : a))
    : null;
  const deviceCenter: [string, string] = topDevice
    ? [`${topDevice.value}%`, topDevice.label]
    : ["—", ""];

  return (
    <div className="p-7 overflow-y-auto h-full max-w-[1440px]">
      {/* Header */}
      <div className="flex items-end gap-4 mb-5 flex-wrap">
        <div>
          <h1
            style={{
              fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22,
              letterSpacing: "-0.02em", color: "var(--color-text-primary)",
            }}
          >
            Web · GA4
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Tráfico del sitio de <strong style={{ color: "var(--color-text-primary)" }}>{brand.name}</strong>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {properties.length > 0 && (
            <select
              value={effectiveConnId ?? ""}
              onChange={(e) =>
                setConnId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="fobo-btn fobo-btn-secondary fobo-btn-sm"
              style={{ minWidth: 180 }}
              title="Propiedad GA4"
            >
              {properties.map((p) => (
                <option key={p.connectionId} value={p.connectionId}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
          {effectiveConnId !== undefined && (
            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="fobo-btn fobo-btn-secondary fobo-btn-sm"
              title="Sincronizar esta propiedad"
            >
              {syncMutation.isPending ? "Sincronizando…" : "Sincronizar"}
            </button>
          )}
          {cities.length > 0 && (
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="fobo-btn fobo-btn-secondary fobo-btn-sm"
              style={{ minWidth: 140 }}
            >
              <option value="">Todas las ciudades</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <Segmented options={RANGE_OPTS} value={range} onChange={setRange} />
          <DateRangeInputs value={range} onChange={setRange} />
        </div>
      </div>

      {data?.stale && data?.lastSyncAt && (
        <div
          className="rounded-lg p-3 mb-4 text-[13px] flex items-center gap-2"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "var(--color-text-primary)",
          }}
        >
          <Icon name="clock" size={14} />
          Última sincronización: {new Date(data.lastSyncAt).toLocaleString("es-BO")}. Los datos pueden estar atrasados.
        </div>
      )}

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 mb-5" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {kpis.map((k) => (
          <motion.div key={k.label} variants={fadeUp}>
            <StatTile label={k.label} value={k.value} delta={k.delta} spark={k.spark} goodDown={"goodDown" in k ? k.goodDown : false} />
          </motion.div>
        ))}
      </motion.div>

      {/* Sessions + sources */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1.7fr 1fr" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <Panel title="Sesiones" sub="Sesiones por día · comparativa período anterior" pad="18px 20px 14px">
            <DualAreaChart current={sessions.current} previous={sessions.previous} labels={sessions.labels} />
          </Panel>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Panel title="Fuentes de tráfico" pad="18px 20px 20px">
            <HBars rows={sources} />
          </Panel>
        </motion.div>
      </div>

      {/* Pages + devices + funnel */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.7fr 1fr" }}>
        <div className="flex flex-col gap-4">
          {/* Pages table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
            <Panel title="Páginas más vistas" pad="0 0 8px">
              <div
                className="grid gap-3 px-5 py-3"
                style={{
                  gridTemplateColumns: "2.4fr 1fr",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {["Página", "Vistas"].map((h, i) => (
                  <div
                    key={h}
                    className="text-[10.5px] font-bold uppercase"
                    style={{
                      letterSpacing: "0.05em",
                      color: "var(--color-text-tertiary)",
                      textAlign: i === 0 ? "left" : "right",
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>
              {pages.map((p, i) => (
                <div
                  key={p.path}
                  className="grid gap-3 px-5 py-3 items-center"
                  style={{
                    gridTemplateColumns: "2.4fr 1fr",
                    borderBottom: i < pages.length - 1 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <div
                    className="text-[13px] truncate"
                    style={{ fontFamily: "var(--ff-mono)", color: "var(--color-primary-ink)" }}
                  >
                    {p.path}
                  </div>
                  <div className="text-right text-[13.5px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
                    {p.views}
                  </div>
                </div>
              ))}
            </Panel>
          </motion.div>

          {/* Funnel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Panel title="Embudo de conversión" sub="Visita → Conversión" pad="20px">
              <div className="flex flex-col gap-3">
                {funnel.map((step, i) => (
                  <div key={step.label}>
                    <div className="flex items-center justify-between mb-[6px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center justify-center text-[11px] font-bold rounded-full text-white flex-shrink-0"
                          style={{ width: 20, height: 20, background: "var(--color-primary)" }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-[13.5px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {step.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[13.5px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
                          {step.count.toLocaleString("es-BO")}
                        </span>
                        {i > 0 && (
                          <span className="text-[11px] ml-2 font-medium" style={{ color: "var(--color-error)" }}>
                            −{(100 - (step.count / funnel[i - 1].count) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-[8px] rounded-full overflow-hidden" style={{ background: "var(--color-background)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${step.pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: "var(--color-brand-gradient)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>
        </div>

        {/* Devices */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <Panel title="Dispositivos" pad="20px">
            <DonutChart segments={devices} size={140} center={deviceCenter} />
          </Panel>
        </motion.div>
      </div>

      {/* World heat map */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        className="mt-4"
      >
        <Panel
          title="Mapa de calor por país"
          sub="Distribución geográfica del tráfico"
          pad="18px 20px 16px"
        >
          <div className="flex justify-end mb-3">
            <Segmented
              options={[
                { v: "sessions", l: "Sesiones" },
                { v: "users", l: "Usuarios" },
                { v: "conversions", l: "Conversiones" },
              ]}
              value={mapMetric}
              onChange={(v) => setMapMetric(v as CountryMetric)}
            />
          </div>
          <WorldHeatMap data={countries} metric={mapMetric} />
        </Panel>
      </motion.div>
    </div>
  );
}
