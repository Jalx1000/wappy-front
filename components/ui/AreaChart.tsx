"use client";

import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

interface DataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  unit?: string;
  valueFormatter?: (v: number) => string;
}

export function AreaChart({
  data,
  color = "#0D5CA6",
  height = 210,
  unit = "",
  valueFormatter,
}: AreaChartProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const gridColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const axisColor = dark ? "#60606E" : "#939393";
  const tooltipBg = dark ? "#2A2B32" : "#FFFFFF";
  const tooltipBorder = dark ? "rgba(255,255,255,0.1)" : "#E8E8EC";

  const fmt = valueFormatter ?? ((v: number) =>
    v >= 1_000_000
      ? (v / 1_000_000).toFixed(1) + "M" + unit
      : v >= 1_000
      ? (v / 1_000).toFixed(0) + "K" + unit
      : v + unit
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 6, right: 4, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: axisColor, fontFamily: "Inter, sans-serif" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 11, fill: axisColor, fontFamily: "Inter, sans-serif" }}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Tooltip
          contentStyle={{
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 10,
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            padding: "8px 12px",
          }}
          formatter={(v) => [typeof v === "number" ? fmt(v) : String(v), ""]}
          labelStyle={{ color: axisColor, fontSize: 11, marginBottom: 2 }}
          cursor={{ stroke: color, strokeWidth: 1.5, strokeDasharray: "3 3" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#grad-${color.replace("#", "")})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </ReAreaChart>
    </ResponsiveContainer>
  );
}
