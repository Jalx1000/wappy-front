"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCampaigns } from "@/lib/hooks";
import { CAMP_STATUS_META } from "@/lib/mocks/analyticsData";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import type { BadgeVariant } from "@/components/ui/Badge";
import { DemoBanner } from "@/components/ui/DemoBanner";

export function CampaignsView() {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: campaigns = [] } = useCampaigns(brandId);

  return (
    <div className="p-7 overflow-y-auto h-full">
      <DemoBanner module="Campañas" />
      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Campañas
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {campaigns.length} campañas · {campaigns.filter((c) => c.status === "active").length} activas
          </p>
        </div>
        <div className="ml-auto">
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1">
            <Icon name="plus" size={15} /> Nueva campaña
          </button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
        {campaigns.map((c, i) => {
          const meta = CAMP_STATUS_META[c.status];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="fobo-card p-5 cursor-pointer"
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "")}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{c.name}</div>
                  <div className="text-[12.5px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    {c.start} → {c.end} · meta: {c.goal}
                  </div>
                </div>
                <Badge variant={meta.variant as BadgeVariant}>{meta.label}</Badge>
              </div>

              {/* Channels */}
              <div className="flex items-center gap-1 mb-4">
                {c.channels.map((ch, k) => (
                  <span key={ch} style={{ marginLeft: k ? -6 : 0, zIndex: c.channels.length - k }}>
                    <ChannelDot channel={ch} size={24} radius={9999} />
                  </span>
                ))}
              </div>

              {/* Budget progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-[6px]">
                  <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>Presupuesto</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[13.5px] font-bold tnum"
                      style={{ fontFamily: "var(--ff-display)", color: "var(--color-text-primary)" }}
                    >
                      {c.budget}
                    </span>
                    <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {c.spent}% gastado
                    </span>
                  </div>
                </div>
                <div className="h-[7px] rounded-full overflow-hidden" style={{ background: "var(--color-background)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${c.spent}%`,
                      background: c.spent > 85 ? "var(--color-warning)" : "var(--color-brand-gradient)",
                    }}
                  />
                </div>
              </div>

              {/* KPI */}
              {c.kpi !== "—" && (
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <Icon name="target" size={14} color="var(--color-primary-ink)" />
                  <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{c.kpi}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
