interface Row {
  label: string;
  value: string | number;
  pct: number;
  color?: string;
}

interface HBarsProps {
  rows: Row[];
  fmt?: (v: number) => string;
}

export function HBars({ rows, fmt }: HBarsProps) {
  return (
    <div className="flex flex-col gap-[14px]">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-center justify-between mb-[6px]">
            <span className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
              {r.label}
            </span>
            <span className="text-[13px] font-semibold tnum" style={{ color: "var(--color-text-secondary)" }}>
              {typeof r.value === "number" && fmt ? fmt(r.value) : r.value}
            </span>
          </div>
          <div className="h-[7px] rounded-full overflow-hidden" style={{ background: "var(--color-background)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${r.pct}%`,
                background: r.color ?? "var(--color-brand-gradient)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
