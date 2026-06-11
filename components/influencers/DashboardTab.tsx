"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { INFLUENCERS_DATA, TIER_COLORS } from "@/lib/mocks/analyticsData";

export function DashboardTab() {
  const stats = useMemo(() => {
    const all = INFLUENCERS_DATA;
    const active = all.filter((i) => i.status === "active");
    const avgEng = (all.reduce((s, i) => s + parseFloat(i.eng), 0) / all.length).toFixed(1);
    const tierBreakdown = ["Mega", "Macro", "Micro", "Nano"].map((tier) => ({
      name: tier,
      value: all.filter((i) => i.tier === tier).length,
      color: TIER_COLORS[tier as keyof typeof TIER_COLORS],
    }));

    const spendData = [
      { month: "Dic", amount: 4200 },
      { month: "Ene", amount: 5100 },
      { month: "Feb", amount: 3800 },
      { month: "Mar", amount: 6200 },
      { month: "Abr", amount: 5400 },
      { month: "May", amount: 7100 },
      { month: "Jun", amount: 6800 },
    ];

    return { all, active, avgEng, tierBreakdown, spendData };
  }, []);

  const topInfluencers = useMemo(() => {
    return stats.all
      .filter((i) => i.status === "active")
      .sort((a, b) => {
        const aEng = parseFloat(a.eng);
        const bEng = parseFloat(b.eng);
        return bEng - aEng;
      })
      .slice(0, 5);
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="fobo-card p-6">
          <div className="text-[12px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
            Creadores Activos
          </div>
          <div className="text-[32px] font-bold mt-2 tnum" style={{ color: "var(--color-text-primary)", fontFamily: "var(--ff-display)" }}>
            {stats.active.length}
          </div>
          <div className="text-[12px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            de {stats.all.length} en total
          </div>
        </div>

        <div className="fobo-card p-6">
          <div className="text-[12px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
            Engagement Promedio
          </div>
          <div className="text-[32px] font-bold mt-2 tnum" style={{ color: "var(--color-text-primary)", fontFamily: "var(--ff-display)" }}>
            {stats.avgEng}%
          </div>
          <div className="text-[12px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            Entre todos los creadores
          </div>
        </div>

        <div className="fobo-card p-6">
          <div className="text-[12px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
            Mayor Tier
          </div>
          <div className="text-[32px] font-bold mt-2 tnum" style={{ color: "var(--color-text-primary)", fontFamily: "var(--ff-display)" }}>
            {stats.tierBreakdown[0]?.value || 0}
          </div>
          <div className="text-[12px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            Mega influencers
          </div>
        </div>

        <div className="fobo-card p-6">
          <div className="text-[12px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
            Inversión Este Mes
          </div>
          <div className="text-[28px] font-bold mt-2 tnum" style={{ color: "var(--color-text-primary)", fontFamily: "var(--ff-display)" }}>
            $6.8K
          </div>
          <div className="text-[12px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            Junio 2026
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Spend Trend */}
        <div className="fobo-card p-6">
          <div className="mb-4">
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Inversión en Influencers
            </h3>
            <p className="text-[12px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Últimos 7 meses (USD)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.spendData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis hide domain={["dataMin - 1000", "dataMax + 1000"]} />
              <Bar
                dataKey="amount"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Breakdown */}
        <div className="fobo-card p-6">
          <div className="mb-4">
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Roster por Tier
            </h3>
            <p className="text-[12px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Distribución de creadores
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.tierBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
              >
                {stats.tierBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {stats.tierBreakdown.map((tier) => (
              <div key={tier.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: tier.color }}
                />
                <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                  {tier.name} ({tier.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Influencers */}
      <div className="fobo-card">
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h3 className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Top Creadores por Engagement
          </h3>
          <p className="text-[12px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Los más efectivos de tu roster
          </p>
        </div>
        <div className="p-6 space-y-4">
          {topInfluencers.map((inf, i) => (
            <div
              key={inf.id}
              className="flex items-center gap-4 pb-4"
              style={{
                borderBottom: i < topInfluencers.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                style={{ background: inf.tint || "#0D5CA6" }}
              >
                {inf.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {inf.name}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {inf.handle} · {inf.followers}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className="text-[18px] font-bold tnum"
                  style={{ color: "var(--color-secondary-ink)", fontFamily: "var(--ff-display)" }}
                >
                  {inf.eng}
                </div>
                <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                  engagement
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
