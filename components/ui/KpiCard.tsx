"use client";

import { Icon } from "@/components/ui/Icon";

interface SparkProps {
  data: number[];
  color: string;
  w?: number;
  h?: number;
}

function Spark({ data, color, w = 72, h = 36 }: SparkProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  spark: number[];
  goal?: number;
  goalLabel?: string;
}

export function KpiCard({ label, value, delta, spark, goal, goalLabel }: KpiCardProps) {
  const pos = delta > 0;
  const col = pos ? "var(--color-success)" : "var(--color-error)";
  return (
    <div
      className="fobo-card p-[18px]"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="text-[13px] mb-[10px]" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div
            className="tnum leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            {value}
          </div>
          <div className="flex items-center gap-[5px] mt-2">
            <span
              className="inline-flex items-center gap-[2px] text-[12.5px] font-semibold"
              style={{ color: col }}
            >
              <Icon name={pos ? "arrowUp" : "arrowDown"} size={13} color={col} />
              {Math.abs(delta)}%
            </span>
            <span className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
              vs. mes anterior
            </span>
          </div>
        </div>
        <Spark data={spark} color={pos ? "var(--color-secondary)" : "var(--color-error)"} />
      </div>
      {goal !== undefined && (
        <div className="mt-[14px]">
          <div
            className="h-[5px] rounded-full overflow-hidden"
            style={{ background: "var(--color-background)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${goal}%`,
                background: "var(--color-brand-gradient)",
              }}
            />
          </div>
          {goalLabel && (
            <div className="text-[11px] mt-[6px]" style={{ color: "var(--color-text-tertiary)" }}>
              {goalLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
