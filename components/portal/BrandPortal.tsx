"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Brand } from "@/store/ui";
import { StatTile } from "@/components/ui/StatTile";
import { AreaChart } from "@/components/ui/AreaChart";
import { HBars } from "@/components/ui/HBars";
import { DonutChart } from "@/components/ui/DonutChart";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { Badge } from "@/components/ui/Badge";
import { useSocialAnalytics, useAdsAnalytics, useWebAnalytics } from "@/lib/hooks";
import {
  SA_KPIS, SA_TREND, SA_NETWORKS, SA_GENDER, SA_GEO,
  ADS_KPIS, ADS_PLATFORMS,
  WEB_KPIS, WEB_FUNNEL, WEB_DEVICES,
} from "@/lib/mocks/analyticsData";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

const TABS = [
  { id: "overview", label: "Resumen" },
  { id: "social",   label: "Social" },
  { id: "ads",      label: "Ads" },
  { id: "web",      label: "Web" },
];

export function BrandPortal({ brand }: { brand: Brand }) {
  const [tab, setTab] = useState("overview");

  const { data: socialData } = useSocialAnalytics(brand.id);
  const { data: adsData }    = useAdsAnalytics(brand.id);
  const { data: webData }    = useWebAnalytics(brand.id);

  const saKpis     = socialData?.kpis     ?? SA_KPIS;
  const saTrend    = socialData?.trend    ?? SA_TREND;
  const saNetworks = socialData?.networks ?? SA_NETWORKS;
  const saGender   = socialData?.audience.gender ?? SA_GENDER;
  const saGeo      = socialData?.audience.geo    ?? SA_GEO;

  const adsKpis     = adsData?.kpis      ?? ADS_KPIS;
  const adsPlatforms = adsData?.platforms ?? ADS_PLATFORMS;

  const webKpis   = webData?.kpis    ?? WEB_KPIS;
  const webFunnel = webData?.funnel  ?? WEB_FUNNEL;
  const webDevices = webData?.devices ?? WEB_DEVICES;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* Header */}
      <header
        className="px-8 py-5 flex items-center gap-4 print:px-0 print:border-b-2"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", position: "sticky", top: 0, zIndex: 40 }}
      >
        <div
          className="flex items-center justify-center text-white font-bold text-[14px] rounded-[10px] flex-shrink-0"
          style={{ width: 40, height: 40, background: brand.tint }}
        >
          {brand.short}
        </div>
        <div>
          <h1 className="font-semibold text-[17px]" style={{ color: "var(--color-text-primary)", fontFamily: "var(--ff-display)" }}>
            {brand.name}
          </h1>
          <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
            {brand.industry} · Reporte junio 2026 · powered by Fobo
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            className="fobo-btn fobo-btn-secondary fobo-btn-sm print:hidden"
            onClick={() => window.print()}
          >
            Imprimir / PDF
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <div
        className="px-8 flex gap-1 print:hidden"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-3 text-[13.5px] font-medium border-none cursor-pointer"
            style={{
              background: "transparent",
              color: tab === t.id ? "var(--color-primary)" : "var(--color-text-secondary)",
              borderBottom: tab === t.id ? `2px solid ${brand.tint}` : "2px solid transparent",
              fontFamily: "var(--ff-ui)",
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <main className="px-8 py-7 max-w-[1200px] mx-auto print:max-w-none print:px-0">
        {(tab === "overview" || tab === "social") && (
          <SocialSection tint={brand.tint} kpis={saKpis} trend={saTrend} networks={saNetworks} gender={saGender} geo={saGeo} />
        )}
        {(tab === "overview" || tab === "ads") && (
          <AdsSection tint={brand.tint} kpis={adsKpis} platforms={adsPlatforms} />
        )}
        {(tab === "overview" || tab === "web") && (
          <WebSection tint={brand.tint} kpis={webKpis} funnel={webFunnel} devices={webDevices} />
        )}
      </main>

      {/* Footer */}
      <footer className="px-8 py-5 text-center text-[12px]" style={{ color: "var(--color-text-tertiary)", borderTop: "1px solid var(--color-border)" }}>
        Generado por <strong>Fobo Agency</strong> · foboagency.bo · Junio 2026
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[16px] font-semibold mb-5"
      style={{ color: "var(--color-text-primary)", fontFamily: "var(--ff-display)", letterSpacing: "-0.015em" }}
    >
      {children}
    </h2>
  );
}

function SocialSection({ tint, kpis, trend, networks, gender, geo }: {
  tint: string;
  kpis: typeof SA_KPIS;
  trend: typeof SA_TREND;
  networks: typeof SA_NETWORKS;
  gender: typeof SA_GENDER;
  geo: typeof SA_GEO;
}) {
  return (
    <section className="mb-10 print:mb-6 print:page-break-inside-avoid">
      <SectionTitle>Social Analytics</SectionTitle>
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpis.map((k) => (
          <motion.div key={k.label} variants={fadeUp}>
            <StatTile label={k.label} value={k.value} delta={k.delta} spark={k.spark} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="fobo-card p-5">
          <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Alcance · 14 días
          </div>
          <AreaChart
            data={trend.reach.map((v, i) => ({ label: trend.labels[i] ?? "", value: v }))}
            color={tint}
            height={140}
          />
        </div>
        <div className="fobo-card p-5">
          <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Género
          </div>
          <DonutChart segments={gender} size={120} />
        </div>
      </div>

      <div className="fobo-card p-5 mb-6">
        <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Por red social
        </div>
        <div className="flex flex-col gap-0">
          {networks.map((n, i) => (
            <div
              key={n.ch}
              className="flex items-center gap-4 py-3"
              style={{ borderBottom: i < networks.length - 1 ? "1px solid var(--color-border)" : "none" }}
            >
              <ChannelDot channel={n.ch} size={28} />
              <div className="flex-1">
                <div className="text-[13.5px] font-medium" style={{ color: "var(--color-text-primary)" }}>{n.followers}</div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>seguidores</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold" style={{ color: "var(--color-success)" }}>+{n.growth}%</div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>crecimiento</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{n.eng}</div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>engagement</div>
              </div>
              <div className="text-right">
                <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{n.posts}</div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>posts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fobo-card p-5">
        <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Audiencia · ciudades
        </div>
        <HBars rows={geo} />
      </div>
    </section>
  );
}

function AdsSection({ tint, kpis, platforms }: {
  tint: string;
  kpis: typeof ADS_KPIS;
  platforms: typeof ADS_PLATFORMS;
}) {
  return (
    <section className="mb-10 print:mb-6 print:page-break-inside-avoid">
      <SectionTitle>Paid Media</SectionTitle>
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpis.map((k) => (
          <motion.div key={k.label} variants={fadeUp}>
            <StatTile
              label={k.label}
              value={k.value}
              delta={k.delta}
              spark={k.spark}
              goodDown={"goodDown" in k ? (k as { goodDown?: boolean }).goodDown : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="fobo-card p-5">
        <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Plataformas
        </div>
        <div className="flex flex-col gap-0">
          {platforms.map((p, i) => (
            <div
              key={p.ch}
              className="flex items-center gap-4 py-3"
              style={{ borderBottom: i < platforms.length - 1 ? "1px solid var(--color-border)" : "none" }}
            >
              <ChannelDot channel={p.ch} size={28} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-[6px] rounded-full"
                    style={{ width: `${p.pct}%`, background: tint, maxWidth: 180 }}
                  />
                </div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>{p.pct}% del presupuesto</div>
              </div>
              <div className="text-right">
                <div className="text-[13.5px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{p.spend}</div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>inversión</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold" style={{ color: "var(--color-primary)" }}>{p.roas}</div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>ROAS</div>
              </div>
              <div className="text-right">
                <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{p.conv}</div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>conv.</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WebSection({ kpis, funnel, devices }: {
  tint: string;
  kpis: typeof WEB_KPIS;
  funnel: typeof WEB_FUNNEL;
  devices: typeof WEB_DEVICES;
}) {
  return (
    <section className="mb-10 print:mb-6 print:page-break-inside-avoid">
      <SectionTitle>Web / GA4</SectionTitle>
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpis.map((k) => (
          <motion.div key={k.label} variants={fadeUp}>
            <StatTile
              label={k.label}
              value={k.value}
              delta={k.delta}
              spark={k.spark}
              goodDown={"goodDown" in k ? (k as { goodDown?: boolean }).goodDown : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="fobo-card p-5">
          <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Dispositivos
          </div>
          <DonutChart segments={devices} size={120} />
        </div>
        <div className="fobo-card p-5">
          <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Embudo de conversión
          </div>
          <div className="flex flex-col gap-2">
            {funnel.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between text-[12.5px] mb-1">
                  <span style={{ color: "var(--color-text-secondary)" }}>{step.label}</span>
                  <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {step.count.toLocaleString("es-BO")}
                    {i > 0 && <span className="ml-1 text-[11px] font-normal" style={{ color: "var(--color-text-tertiary)" }}>({step.pct}%)</span>}
                  </span>
                </div>
                <div className="h-[8px] rounded-full overflow-hidden" style={{ background: "var(--color-background)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${step.pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    style={{ background: "var(--color-primary)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
