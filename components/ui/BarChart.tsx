"use client";

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

interface BarChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
}

export function BarChart({ data, labels, height = 180, color = "#0D5CA6", valueFormatter }: BarChartProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const gridColor  = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const axisColor  = dark ? "#60606E" : "#939393";
  const tooltipBg  = dark ? "#2A2B32" : "#FFFFFF";
  const tooltipBdr = dark ? "rgba(255,255,255,0.1)" : "#E8E8EC";

  const fmt = valueFormatter ?? ((v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`
  );

  const chartData = data.map((v, i) => ({ v, label: labels?.[i] ?? String(i + 1) }));
  const maxVal = Math.max(...data);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barSize={20}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: axisColor, fontFamily: "Inter, sans-serif" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 10, fill: axisColor, fontFamily: "Inter, sans-serif" }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBdr}`, borderRadius: 8, fontSize: 12, padding: "6px 10px" }}
          formatter={(v) => [typeof v === "number" ? fmt(v) : String(v), ""]}
          cursor={{ fill: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
        />
        <Bar dataKey="v" radius={[4, 4, 0, 0]}>
          {chartData.map((d, i) => (
            <Cell
              key={i}
              fill={d.v === maxVal ? "url(#barGrad)" : color}
              fillOpacity={d.v === maxVal ? 1 : 0.65}
            />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
