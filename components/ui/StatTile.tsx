import { Icon } from "./Icon";

function MiniSpark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const W = 64, H = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  delta: number;
  spark: number[];
  goodDown?: boolean;
}

export function StatTile({ label, value, delta, spark, goodDown }: StatTileProps) {
  const positive = goodDown ? delta < 0 : delta > 0;
  const col = positive ? "var(--color-success)" : "var(--color-error)";
  return (
    <div className="fobo-card px-5 py-4">
      <div className="text-[13px] mb-[10px]" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div
            className="tnum leading-none"
            style={{
              fontFamily: "var(--ff-display)",
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            {value}
          </div>
          <div className="flex items-center gap-[5px] mt-[8px]">
            <span className="inline-flex items-center gap-[2px] text-[12px] font-semibold" style={{ color: col }}>
              <Icon name={positive ? "arrowUp" : "arrowDown"} size={12} color={col} />
              {Math.abs(delta)}%
            </span>
            <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
              vs. período anterior
            </span>
          </div>
        </div>
        <MiniSpark data={spark} color={positive ? "var(--color-secondary)" : "var(--color-error)"} />
      </div>
    </div>
  );
}
