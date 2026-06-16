"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/ui/StatTile";
import { Panel } from "@/components/ui/Panel";
import { AreaChart } from "@/components/ui/AreaChart";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { useUIStore } from "@/store/ui";
import {
  useSocialAnalytics,
  useBrands,
  useConnections,
  useSyncConnectionMutation,
} from "@/lib/hooks";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const CHANNEL_UI_TO_BACKEND: Record<string, string> = {
  facebook: "facebook_page",
  instagram: "instagram",
  tiktok: "tiktok",
  linkedin: "linkedin",
  youtube: "youtube",
  googleads: "google_ads",
  ga4: "ga4",
};

const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

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

const SOCIAL_CHANNELS = ["instagram", "facebook", "tiktok", "linkedin", "youtube"];
const NETWORK_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export function SocialAnalytics() {
  const [range, setRange] = useState("30d");
  const [network, setNetwork] = useState<string>("");
  const [pageId, setPageId] = useState<number | undefined>(undefined);
  const { activeBrand } = useUIStore();
  const { data: brands = BRANDS_FALLBACK } = useBrands();
  const brand = activeBrand ?? brands[0];

  const days = PERIOD_DAYS[range] ?? 30;

  // All social accounts of the brand, grouped so the user can pick exactly one.
  const { data: conns = [] } = useConnections(brand?.id);
  const socialConns = conns.filter(
    (c) => c.id !== undefined && c.status === "connected" && SOCIAL_CHANNELS.includes(c.ch),
  );
  const availableNetworks = Array.from(new Set(socialConns.map((c) => c.ch)));
  const activeNetwork = network || availableNetworks[0];
  const pagesInNetwork = socialConns.filter((c) => c.ch === activeNetwork);
  const activePage =
    pagesInNetwork.find((c) => c.id === pageId) ?? pagesInNetwork[0];
  const backendChannel = activePage
    ? CHANNEL_UI_TO_BACKEND[activePage.ch] ?? activePage.ch
    : undefined;

  const { data, isPending } = useSocialAnalytics(
    brand?.id,
    activePage?.id,
    backendChannel,
    days,
  );
  const toast = useToast();
  const syncMutation = useSyncConnectionMutation(brand?.id);
  const handleSync = () => {
    if (activePage?.id === undefined) return;
    syncMutation.mutate(activePage.id, {
      onSuccess: () => toast("Cuenta sincronizada", "info"),
      onError: () => toast("No se pudo sincronizar la cuenta", "info"),
    });
  };

  const kpis      = data?.kpis     ?? [];
  const trend     = data?.trend     ?? { reach: [], labels: [] };
  const topPosts  = data?.topPosts  ?? [];

  const chartData = trend.reach.map((v, i) => ({
    label: trend.labels[i],
    value: v,
  }));

  if (isPending) return <SocialSkeleton />;

  if (!activePage) {
    return (
      <div className="p-7 max-w-[1440px] flex flex-col gap-4">
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
          Social Analytics
        </h1>
        <div className="rounded-xl p-6 text-center" style={{ border: "1px dashed var(--color-border)", background: "var(--color-surface)" }}>
          <div className="text-[15px] font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
            Conectá una cuenta de Facebook o Instagram para ver métricas.
          </div>
          <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Andá a <strong>Conexiones</strong> y autorizá una red social para <strong>{brand.name}</strong>.
          </div>
        </div>
      </div>
    );
  }

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
            <strong style={{ color: "var(--color-text-primary)" }}>{activePage.account ?? NETWORK_LABEL[activeNetwork]}</strong>
            {" · "}{NETWORK_LABEL[activeNetwork] ?? activeNetwork} · {brand.name}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          {availableNetworks.length > 1 && (
            <select
              value={activeNetwork}
              onChange={(e) => { setNetwork(e.target.value); setPageId(undefined); }}
              className="fobo-btn fobo-btn-secondary fobo-btn-sm"
              title="Red social"
            >
              {availableNetworks.map((ch) => (
                <option key={ch} value={ch}>{NETWORK_LABEL[ch] ?? ch}</option>
              ))}
            </select>
          )}
          {pagesInNetwork.length > 1 && (
            <select
              value={activePage.id}
              onChange={(e) => setPageId(Number(e.target.value))}
              className="fobo-btn fobo-btn-secondary fobo-btn-sm"
              style={{ minWidth: 160 }}
              title="Página / cuenta"
            >
              {pagesInNetwork.map((c) => (
                <option key={c.id} value={c.id}>{c.account ?? `#${c.id}`}</option>
              ))}
            </select>
          )}
          <Segmented options={RANGE_OPTS} value={range} onChange={setRange} />
          <button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="fobo-btn fobo-btn-secondary fobo-btn-sm"
            title="Sincronizar esta cuenta (90 días)"
          >
            {syncMutation.isPending ? "Sincronizando…" : "Sincronizar"}
          </button>
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

      {/* Main chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-4">
        <Panel
          title="Alcance en el tiempo"
          sub="Cuentas alcanzadas por día"
          pad="18px 20px 14px"
        >
          {chartData.length ? (
            <AreaChart data={chartData} color="#0D5CA6" height={210} />
          ) : (
            <div className="h-[210px] flex items-center justify-center text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
              Sin datos en este período para esta cuenta.
            </div>
          )}
        </Panel>
      </motion.div>

      {/* Top posts */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
        <Panel
          title="Top publicaciones"
          sub="Ordenadas por alcance"
          pad="14px 20px 18px"
        >
          {topPosts.length === 0 ? (
            <div className="py-8 text-center text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
              Sin publicaciones en este período para esta cuenta.
            </div>
          ) : (
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
          )}
        </Panel>
      </motion.div>
    </div>
  );
}
