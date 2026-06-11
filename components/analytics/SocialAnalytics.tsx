"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/ui/StatTile";
import { Panel } from "@/components/ui/Panel";
import { AreaChart } from "@/components/ui/AreaChart";
import { HBars } from "@/components/ui/HBars";
import { DonutChart } from "@/components/ui/DonutChart";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Icon } from "@/components/ui/Icon";
import { useUIStore } from "@/store/ui";
import { useSocialAnalytics, useBrands } from "@/lib/hooks";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { Skeleton } from "@/components/ui/Skeleton";

const RANGE_OPTS = [{ v: "7d", l: "7 días" }, { v: "30d", l: "30 días" }, { v: "90d", l: "90 días" }];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function SocialSkeleton() {
  return (
    <div className="p-7 max-w-[1440px] flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton.KPI key={i} />)}
      </div>
      <Skeleton.Chart height={200} />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton.Card lines={5} />
        <Skeleton.Card lines={5} />
        <Skeleton.Card lines={5} />
      </div>
    </div>
  );
}

export function SocialAnalytics() {
  const [range, setRange] = useState("30d");
  const { activeBrand } = useUIStore();
  const { data: brands = BRANDS_FALLBACK } = useBrands();
  const brand = activeBrand ?? brands[0];
  const { data, isPending } = useSocialAnalytics(brand?.id);

  if (isPending) return <SocialSkeleton />;

  const kpis      = data?.kpis     ?? [];
  const trend     = data?.trend     ?? { reach: [], labels: [] };
  const networks  = data?.networks  ?? [];
  const audience  = data?.audience  ?? { age: [], gender: [], geo: [] };
  const topPosts  = data?.topPosts  ?? [];

  const chartData = trend.reach.map((v, i) => ({
    label: trend.labels[i],
    value: v * 1000,
  }));

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
            Social Analytics
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Desempeño orgánico de <strong style={{ color: "var(--color-text-primary)" }}>{brand.name}</strong>
          </p>
        </div>
        <div className="ml-auto">
          <Segmented options={RANGE_OPTS} value={range} onChange={setRange} />
        </div>
      </div>

      {/* KPI tiles */}
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        className="grid gap-4 mb-5"
        style={{ gridTemplateColumns: "repeat(4,1fr)" }}
      >
        {kpis.map((k) => (
          <motion.div key={k.label} variants={fadeUp}>
            <StatTile label={k.label} value={k.value} delta={k.delta} spark={k.spark} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main chart + network table */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1.7fr 1fr" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <Panel
            title="Alcance en el tiempo"
            sub="Miles de cuentas alcanzadas por día"
            right={
              <span
                className="text-[12px] font-bold px-2 py-1 rounded-full"
                style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}
              >
                ▲ 14.2%
              </span>
            }
            pad="18px 20px 14px"
          >
            <AreaChart data={chartData} color="#0D5CA6" height={210} />
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Panel title="Por red" sub="Seguidores y engagement" pad="6px 12px 10px">
            {networks.map((n, i) => (
              <div
                key={n.ch}
                className="flex items-center gap-3 px-2 py-[11px]"
                style={{ borderBottom: i < networks.length - 1 ? "1px solid var(--color-border)" : "none" }}
              >
                <ChannelDot channel={n.ch} size={36} radius={10} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {n.ch.charAt(0).toUpperCase() + n.ch.slice(1)}
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                    {n.posts} posts · {n.eng} eng
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-[14px] font-bold tnum"
                    style={{ fontFamily: "var(--ff-display)", color: "var(--color-text-primary)" }}
                  >
                    {n.followers}
                  </div>
                  <div
                    className="inline-flex items-center gap-[3px] text-[11.5px] font-semibold mt-[2px]"
                    style={{ color: "var(--color-success)" }}
                  >
                    <Icon name="arrowUp" size={11} color="var(--color-success)" />
                    {n.growth}%
                  </div>
                </div>
              </div>
            ))}
          </Panel>
        </motion.div>
      </div>

      {/* Demographics row */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <Panel title="Edad" pad="18px 20px 20px">
            <HBars rows={audience.age} fmt={(v) => `${v}%`} />
          </Panel>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <Panel title="Género" pad="20px">
            <DonutChart segments={audience.gender} size={130} />
          </Panel>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Panel title="Ciudades" pad="18px 20px 20px">
            <HBars rows={audience.geo} />
          </Panel>
        </motion.div>
      </div>

      {/* Top posts */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
        <Panel
          title="Top publicaciones"
          sub="Ordenadas por alcance"
          pad="14px 20px 18px"
          right={
            <button className="fobo-btn fobo-btn-ghost fobo-btn-sm">Ver todas</button>
          }
        >
          <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            {topPosts.map((p, i) => (
              <div
                key={i}
                className="rounded-[14px] overflow-hidden cursor-pointer"
                style={{ border: "1px solid var(--color-border)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")}
              >
                <div className="relative">
                  <ImagePlaceholder height={140} label={`post · ${p.ch}`} />
                  <span className="absolute top-2 left-2">
                    <ChannelDot channel={p.ch} size={26} radius={7} />
                  </span>
                  <span
                    className="absolute top-2 right-2 text-[10.5px] font-semibold px-[7px] py-[2px] rounded-full"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                  >
                    {p.date}
                  </span>
                </div>
                <div className="px-3 py-[10px] pb-3">
                  <div
                    className="text-[12.5px] leading-snug mb-[9px] overflow-hidden"
                    style={{
                      color: "var(--color-text-primary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {p.caption}
                  </div>
                  <div className="flex gap-3 text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                    <span>
                      <strong style={{ color: "var(--color-text-primary)" }}>{p.reach}</strong> alcance
                    </span>
                    <span>
                      <strong style={{ color: "var(--color-text-primary)" }}>{p.eng}</strong> eng
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </motion.div>
    </div>
  );
}
