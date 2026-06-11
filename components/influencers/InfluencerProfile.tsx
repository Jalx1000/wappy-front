"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ChannelDot } from "@/components/ui/ChannelDot";
import type { InfluencerItem } from "@/lib/mocks/analyticsData";
import { INF_STATUS_META, TIER_COLORS, CONTRACTS_DATA } from "@/lib/mocks/analyticsData";
import type { BadgeVariant } from "@/components/ui/Badge";

interface InfluencerProfileProps {
  influencer: InfluencerItem;
  onClose: () => void;
  onEdit?: (inf: InfluencerItem) => void;
}

const CPE_RANGES: Record<string, { label: string; variant: BadgeVariant }> = {
  "muy eficiente": { label: "Muy eficiente", variant: "success" },
  "competitivo": { label: "Competitivo", variant: "primary" },
  "premium": { label: "Premium", variant: "warning" },
};

export function InfluencerProfile({ influencer, onClose, onEdit }: InfluencerProfileProps) {
  const statusMeta = INF_STATUS_META[influencer.status];
  const tierColor = TIER_COLORS[influencer.tier];

  // Get deals for this influencer
  const deals = CONTRACTS_DATA.filter((c) => c.influencerId === influencer.id);

  // Mock sparkline for monthly metrics
  const sparkData = influencer.monthlyMetrics || [];

  // Calculate CPE/CPM ranges (mock)
  const rateMeta = (format: string) => {
    const amount = influencer.rateCard?.[format] || 0;
    if (amount < 400) return CPE_RANGES["muy eficiente"];
    if (amount < 1000) return CPE_RANGES["competitivo"];
    return CPE_RANGES["premium"];
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[70] flex items-stretch"
        style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 280 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 280 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="ml-auto w-[660px] max-w-[100%] h-full overflow-y-auto"
          style={{ background: "var(--color-surface)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero Band */}
          <div className="relative h-32 w-full" style={{ background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}08)`, borderBottom: `1px solid var(--color-border)` }}>
            <div className="absolute inset-0 opacity-10" style={{ background: tierColor }} />
          </div>

          {/* Avatar & Header (overlapped) */}
          <div className="px-6 pb-6">
            <div className="flex items-start gap-4 -mt-14 mb-4 relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl border-4"
                style={{ background: tierColor, borderColor: "var(--color-surface)", flexShrink: 0 }}
              >
                {influencer.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 pt-2">
                <div className="text-[18px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {influencer.name}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="primary">{influencer.tier}</Badge>
                  <Badge variant={statusMeta.variant as BadgeVariant}>{statusMeta.label}</Badge>
                </div>
                <div className="text-[12px] mt-2" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="font-medium">{influencer.handle}</span>
                  {influencer.category && <span className="mx-1">·</span>}
                  {influencer.category && <span>{influencer.category}</span>}
                  {influencer.city && <span className="mx-1">·</span>}
                  {influencer.city && <span>{influencer.city}</span>}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name={i < Math.floor(influencer.rating ?? 4.5) ? "star" : "starOutline"}
                      size={12}
                      style={{ color: i < Math.floor(influencer.rating ?? 4.5) ? "#F09030" : "#CCC" }}
                    />
                  ))}
                  <span className="text-[11px] ml-1" style={{ color: "var(--color-text-tertiary)" }}>
                    {influencer.rating || 4.5}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                style={{ background: "var(--color-background)" }}
              >
                <Icon name="x" size={14} />
              </button>
            </div>

            {/* Network glyphs */}
            {influencer.networks && (
              <div className="flex gap-2 mb-4">
                {influencer.networks.map((net) => (
                  <ChannelDot key={net.ch} channel={net.ch} size={24} radius={6} />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mb-6">
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1">
                <Icon name="mail" size={14} /> Mensaje
              </button>
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1">
                <Icon name="plus" size={14} /> Contratar
              </button>
              {onEdit && (
                <button
                  className="fobo-btn fobo-btn-ghost fobo-btn-sm p-2"
                  onClick={() => {
                    onEdit(influencer);
                    onClose();
                  }}
                >
                  <Icon name="edit" size={14} />
                </button>
              )}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="fobo-card p-4">
                <div className="text-[11px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
                  Seguidores
                </div>
                <div className="text-[20px] font-semibold mt-2 tnum" style={{ color: "var(--color-text-primary)" }}>
                  {influencer.followers}
                </div>
                <div className="flex gap-1 mt-2 h-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                      <Bar dataKey="followers" fill={tierColor} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="fobo-card p-4">
                <div className="text-[11px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
                  Engagement
                </div>
                <div className="text-[20px] font-semibold mt-2 tnum" style={{ color: "var(--color-secondary-ink)" }}>
                  {influencer.eng}
                </div>
                <div className="flex gap-1 mt-2 h-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <YAxis hide domain={["dataMin - 0.5", "dataMax + 0.5"]} />
                      <Bar dataKey="engagement" fill="var(--color-secondary)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Rate Card */}
            {influencer.rateCard && (
              <div className="fobo-card mb-6">
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Tarifario
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {["Post", "Story", "Reel", "Video"].map((format) => {
                    const amount = influencer.rateCard![format];
                    const meta = rateMeta(format);
                    return (
                      <div key={format} className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <div>
                          <div className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                            {format}
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                            ${amount.toLocaleString()}
                          </div>
                        </div>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Audience */}
            {influencer.audience && (
              <div className="fobo-card mb-6">
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Audiencia
                  </div>
                </div>
                <div className="p-4">
                  {/* Gender Donut */}
                  <div className="mb-6">
                    <div className="text-[11px] font-semibold uppercase mb-3" style={{ color: "var(--color-text-secondary)" }}>
                      Género
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie data={influencer.audience.gender} cx="50%" cy="60%" innerRadius={35} outerRadius={50} dataKey="value" isAnimationActive={false}>
                          {influencer.audience.gender.map((_, i) => (
                            <Cell key={i} fill={["#34BDF6", "#0D5CA6", "#AFD3EC"][i % 3]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-3 justify-center text-[11px] mt-2">
                      {influencer.audience.gender.map((g) => (
                        <span key={g.label} style={{ color: "var(--color-text-secondary)" }}>
                          {g.label} <span className="font-semibold">{g.value}%</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Age Distribution */}
                  <div className="mb-6">
                    <div className="text-[11px] font-semibold uppercase mb-3" style={{ color: "var(--color-text-secondary)" }}>
                      Edad
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={influencer.audience.ageBands} margin={{ top: 0, right: 0, bottom: 20, left: -15 }}>
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <Bar dataKey="value" fill={tierColor} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Cities */}
                  <div>
                    <div className="text-[11px] font-semibold uppercase mb-3" style={{ color: "var(--color-text-secondary)" }}>
                      Ciudades Top
                    </div>
                    <div className="space-y-2">
                      {influencer.audience.cities.map((city) => (
                        <div key={city.label} className="flex items-center justify-between">
                          <span className="text-[12px]" style={{ color: "var(--color-text-primary)" }}>
                            {city.label}
                          </span>
                          <div className="flex items-center gap-2 flex-1 ml-4">
                            <div className="h-1.5 flex-1 rounded-full" style={{ background: `${tierColor}30` }}>
                              <div className="h-full rounded-full" style={{ background: tierColor, width: `${city.value}%` }} />
                            </div>
                            <span className="text-[11px] w-8 text-right font-semibold tnum" style={{ color: "var(--color-text-secondary)" }}>
                              {city.value}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Collaboration History */}
            {deals.length > 0 && (
              <div className="fobo-card mb-6">
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Historial de Colaboraciones ({deals.length})
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {deals.slice(0, 3).map((deal) => (
                    <div key={deal.id} className="pb-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {deal.type}
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                            {deal.expiresAt}
                          </div>
                        </div>
                        <div className="text-[13px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
                          ${deal.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {deals.length > 3 && (
                    <div className="text-[11px] pt-2" style={{ color: "var(--color-text-secondary)" }}>
                      +{deals.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {influencer.contact && (
              <div className="fobo-card">
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Contacto
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon name="mail" size={14} style={{ color: "var(--color-text-secondary)" }} />
                    <a href={`mailto:${influencer.contact.email}`} className="text-[12px]" style={{ color: "var(--color-primary)" }}>
                      {influencer.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="phone" size={14} style={{ color: "var(--color-text-secondary)" }} />
                    <a href={`tel:${influencer.contact.phone}`} className="text-[12px]" style={{ color: "var(--color-primary)" }}>
                      {influencer.contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="users" size={14} style={{ color: "var(--color-text-secondary)" }} />
                    <span className="text-[12px]" style={{ color: "var(--color-text-primary)" }}>
                      {influencer.contact.manager}
                    </span>
                  </div>
                  {influencer.joinedAt && (
                    <div className="flex items-center gap-2">
                      <Icon name="calendar" size={14} style={{ color: "var(--color-text-secondary)" }} />
                      <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                        Miembro desde {influencer.joinedAt}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="h-6" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
