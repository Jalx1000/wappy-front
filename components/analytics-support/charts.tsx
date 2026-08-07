"use client";

import { useId } from "react";

export function Sparkline({ data, color = "var(--color-primary)", width = 120, height = 36 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / rng) * (height - 6) - 3]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L ${width} ${height} L 0 ${height} Z`;
  const gid = "sp" + useId().replace(/:/g, "");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface Series { name: string; color: string; values: number[] }

export function GroupedBars({ data, height = 220 }: { data: { labels: string[]; series: Series[] }; height?: number }) {
  const all = data.series.flatMap((s) => s.values);
  const max = Math.max(...all) * 1.1 || 1;
  const w = 100 / data.labels.length;
  const H = height / 4, padB = 24 / 4;
  return (
    <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" width="100%" height={height} style={{ overflow: "visible" }}>
      {data.labels.map((lb, i) => {
        const groupX = i * w;
        const bw = w / (data.series.length + 1);
        return (
          <g key={i}>
            {data.series.map((s, si) => {
              const v = s.values[i]; const bh = (v / max) * (H - padB);
              const x = groupX + bw * (si + 0.5);
              return <rect key={si} x={x} y={H - padB - bh} width={bw * 0.8} height={Math.max(0.5, bh)} rx="0.6" fill={s.color} />;
            })}
            <text x={groupX + w / 2} y={H - 1.5} fontSize="2.4" textAnchor="middle" fill="var(--color-text-tertiary)" fontFamily="var(--font-ui)">{lb}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ segments, size = 168, thickness = 26 }: { segments: { color: string; value: number }[]; size?: number; thickness?: number }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  const lens = segments.map((s) => (s.value / total) * C);
  const offsets = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <svg width={size} height={size}>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={thickness} strokeDasharray={`${lens[i]} ${C - lens[i]}`} strokeDashoffset={-offsets[i]} />
        ))}
      </g>
    </svg>
  );
}

export function HBars({ rows, max }: { rows: { label: string; value: number; color?: string }[]; max?: number }) {
  const m = max || Math.max(...rows.map((r) => r.value)) || 1;
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3">
          <span style={{ width: 56, fontSize: 12, color: "var(--color-text-secondary)", textAlign: "right", flex: "none" }}>{r.label}</span>
          <div style={{ flex: 1, height: 10, borderRadius: 9999, background: "var(--neutral-200)", overflow: "hidden" }}>
            <div style={{ width: (r.value / m) * 100 + "%", height: "100%", borderRadius: 9999, background: r.color || "var(--color-primary)" }} />
          </div>
          <span className="tnum" style={{ width: 44, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", flex: "none" }}>{r.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</span>
    </div>
  );
}
