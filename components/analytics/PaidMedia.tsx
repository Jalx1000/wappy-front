"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/ui/StatTile";
import { Panel } from "@/components/ui/Panel";
import { BarChart } from "@/components/ui/BarChart";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { useUIStore } from "@/store/ui";
import { useAdsAnalytics, useBrands } from "@/lib/hooks";
import { BRANDS as BRANDS_FALLBACK, CHANNEL_META } from "@/lib/mocks/data";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DateRangeInputs } from "@/components/ui/DateRangeInputs";

const RANGE_OPTS = [{ v: "7d", l: "7 días" }, { v: "30d", l: "30 días" }, { v: "90d", l: "90 días" }];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function AdsSkeleton() {
  return (
    <div className="p-7 max-w-[1440px] flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton.KPI key={i} />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton.Chart height={180} />
        <Skeleton.Card lines={6} />
      </div>
      <Skeleton.Table rows={5} cols={6} />
    </div>
  );
}

export function PaidMedia() {
  const [range, setRange] = useState("30d");
  const { activeBrand } = useUIStore();
  const { data: brands = BRANDS_FALLBACK } = useBrands();
  const brand = activeBrand ?? brands[0];
  const { data, isPending, isError } = useAdsAnalytics(brand?.id, range);

  if (isPending) return <AdsSkeleton />;

  if (isError || !data) {
    return (
      <div className="p-7 max-w-[1440px] flex flex-col gap-4">
        <h1
          style={{
            fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22,
            letterSpacing: "-0.02em", color: "var(--color-text-primary)",
          }}
        >
          Paid Media / Ads
        </h1>
        <div
          className="rounded-xl p-6 text-center"
          style={{
            border: "1px dashed var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <div className="text-[15px] font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
            Conectá Google Ads, Meta Ads, TikTok Ads o LinkedIn Ads para ver datos reales.
          </div>
          <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Andá a <strong>Conexiones</strong> y autorizá la plataforma para <strong>{brand.name}</strong>.
          </div>
        </div>
      </div>
    );
  }

  const kpis      = data?.kpis      ?? [];
  const platforms = data?.platforms  ?? [];
  const campaigns = data?.campaigns  ?? [];
  const spendTrend = data?.spendTrend ?? [];
  const spendTrendLabels = data?.spendTrendLabels ?? [];

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
            Paid Media / Ads
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Inversión publicitaria de <strong style={{ color: "var(--color-text-primary)" }}>{brand.name}</strong>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <Segmented options={RANGE_OPTS} value={range} onChange={setRange} />
          <DateRangeInputs value={range} onChange={setRange} />
        </div>
      </div>

      {data?.stale && data?.lastSyncAt && (
        <div
          className="rounded-lg p-3 mb-4 text-[13px]"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "var(--color-text-primary)",
          }}
        >
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

      {/* Spend chart + platforms */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <Panel title="Inversión diaria" sub="USD por día" pad="18px 20px 14px">
            <BarChart data={spendTrend} labels={spendTrendLabels} height={180} />
          </Panel>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Panel title="Por plataforma" pad="8px 12px 12px">
            {platforms.map((p, i) => (
              <div
                key={p.ch}
                className="px-2 py-3"
                style={{ borderBottom: i < platforms.length - 1 ? "1px solid var(--color-border)" : "none" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <ChannelDot channel={p.ch} size={30} radius={8} />
                  <span className="flex-1 text-[13.5px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {CHANNEL_META[p.ch]?.label}
                  </span>
                  <span
                    className="text-[14px] font-bold tnum flex-shrink-0"
                    style={{ fontFamily: "var(--ff-display)", color: "var(--color-text-primary)" }}
                  >
                    {p.spend}
                  </span>
                </div>
                <div className="h-[7px] rounded-full overflow-hidden mb-2" style={{ background: "var(--color-background)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${p.pct}%`, background: "var(--color-brand-gradient)" }}
                  />
                </div>
                <div className="flex gap-[14px] text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                  <span>ROAS <strong style={{ color: "var(--color-text-primary)" }}>{p.roas}</strong></span>
                  <span>{p.conv} conv.</span>
                  <span>CPA <strong style={{ color: "var(--color-text-primary)" }}>{p.cpa}</strong></span>
                </div>
              </div>
            ))}
          </Panel>
        </motion.div>
      </div>

      {/* Campaigns table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
        <Panel
          title="Campañas activas"
          sub={`${campaigns.length} campañas`}
          pad="0 0 8px"
          right={
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1">
              <Icon name="plus" size={15} /> Nueva campaña
            </button>
          }
        >
          {/* Col headers */}
          <div
            className="grid gap-3 px-5 py-3"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {["Campaña", "Inversión", "ROAS", "Conv.", "Presupuesto"].map((h, i) => (
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
          {campaigns.map((c, i) => (
            <div
              key={c.name}
              className="grid gap-3 px-5 py-[13px] items-center"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr",
                borderBottom: i < campaigns.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <ChannelDot channel={c.platform} size={30} radius={8} />
                <div className="min-w-0">
                  <div
                    className="text-[13.5px] font-semibold truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {c.name}
                  </div>
                  <div className="mt-[3px]">
                    <Badge variant={c.status === "active" ? "success" : "warning"}>
                      {c.status === "active" ? "Activa" : "Pausada"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right text-[13.5px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
                {c.spend}
              </div>
              <div className="text-right text-[13.5px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
                {c.roas}
              </div>
              <div className="text-right text-[13.5px] tnum" style={{ color: "var(--color-text-secondary)" }}>
                {c.conv}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[7px] rounded-full overflow-hidden" style={{ background: "var(--color-background)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.budget}%`,
                      background: c.budget > 85 ? "var(--color-warning)" : "var(--color-primary)",
                    }}
                  />
                </div>
                <span
                  className="text-[12px] font-semibold w-8 text-right tnum flex-shrink-0"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {c.budget}%
                </span>
              </div>
            </div>
          ))}
        </Panel>
      </motion.div>
    </div>
  );
}
