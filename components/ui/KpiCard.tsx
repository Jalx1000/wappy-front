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
  deltaLabel?: string;
  prevValue?: string;
  goal?: number;
  goalLabel?: string;
}

export function KpiCard({ label, value, delta, spark, deltaLabel = "vs. mes anterior", prevValue, goal, goalLabel }: KpiCardProps) {
  const pos = delta > 0;
  const col = pos ? "var(--color-success)" : "var(--color-error)";
  // Only render the comparison chip / sparkline when there is real data to show.
  // The brand summary endpoint returns no period-over-period comparison, so a
  // delta of 0 means "unavailable" rather than "flat" — showing it as a red ↓0%
  // would be misleading.
  const hasDelta = Number.isFinite(delta) && delta !== 0;
  const hasSpark = spark.length > 1;
  // "vs. mes anterior" → "Mes anterior" for the previous-period value line.
  const prevLabel = deltaLabel.replace(/^vs\.\s*/i, "").replace(/^./, (c) => c.toUpperCase());
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
          {hasDelta && (
            <div className="flex items-center gap-[5px] mt-2">
              <span
                className="inline-flex items-center gap-[2px] text-[12.5px] font-semibold"
                style={{ color: col }}
              >
                <Icon name={pos ? "arrowUp" : "arrowDown"} size={13} color={col} />
                {Math.abs(delta)}%
              </span>
              <span className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                {deltaLabel}
              </span>
            </div>
          )}
        </div>
        {hasSpark && (
          <Spark data={spark} color={pos ? "var(--color-secondary)" : "var(--color-error)"} />
        )}
      </div>
      {prevValue !== undefined && (
        <div
          className="mt-[12px] pt-[10px] flex items-center justify-between"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
            {prevLabel}
          </span>
          <span
            className="text-[12.5px] font-semibold tnum"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {prevValue}
          </span>
        </div>
      )}
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
