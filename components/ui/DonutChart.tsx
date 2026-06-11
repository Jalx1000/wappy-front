"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Segment { label: string; value: number; color: string }

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  center?: [string, string];
}

export function DonutChart({ segments, size = 130, center }: DonutChartProps) {
  return (
    <div className="flex items-center gap-5">
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={segments}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.36}
              outerRadius={size * 0.48}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Pie>
            <Tooltip
              formatter={(v) => [`${typeof v === "number" ? v : 0}%`, ""]}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                padding: "5px 10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {center && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <span
              style={{
                fontFamily: "var(--ff-display)",
                fontWeight: 600,
                fontSize: size * 0.18,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              {center[0]}
            </span>
            <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
              {center[1]}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[10px]">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-[8px]">
            <span className="rounded-full flex-shrink-0" style={{ width: 9, height: 9, background: s.color }} />
            <span className="text-[12.5px]" style={{ color: "var(--color-text-secondary)" }}>
              {s.label}
            </span>
            <span
              className="text-[13px] font-semibold tnum ml-auto"
              style={{ color: "var(--color-text-primary)" }}
            >
              {s.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
