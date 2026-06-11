"use client";

import { cn } from "@/lib/utils";

// ── Base primitive ─────────────────────────────────────────────────────────────
interface SkeletonBaseProps {
  className?: string;
  style?: React.CSSProperties;
}

function Base({ className, style }: SkeletonBaseProps) {
  return <div className={cn("skeleton-shimmer", className)} style={style} />;
}

// ── KPI card skeleton ──────────────────────────────────────────────────────────
function KPI() {
  return (
    <div
      className="fobo-card p-[18px] flex flex-col gap-[10px]"
      style={{ background: "var(--color-surface)" }}
    >
      <Base className="h-[13px] w-[60%] rounded-[6px]" />
      <Base className="h-[32px] w-[50%] rounded-[8px] mt-1" />
      <Base className="h-[11px] w-[40%] rounded-[6px]" />
      <Base className="h-[5px] w-full rounded-full mt-1" />
    </div>
  );
}

// ── Chart area skeleton ────────────────────────────────────────────────────────
interface ChartProps {
  height?: number;
  className?: string;
}

function Chart({ height = 220, className }: ChartProps) {
  return (
    <div className={cn("fobo-card overflow-hidden", className)} style={{ background: "var(--color-surface)" }}>
      {/* Panel header */}
      <div
        className="flex items-center gap-3 px-5 py-[15px]"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <Base className="h-[15px] w-[120px] rounded-[6px]" />
        <Base className="h-[13px] w-[80px] rounded-[6px] opacity-60" />
        <div className="ml-auto flex gap-2">
          <Base className="h-[30px] w-[72px] rounded-[8px]" />
          <Base className="h-[30px] w-[72px] rounded-[8px]" />
        </div>
      </div>
      {/* Chart area */}
      <div className="p-5">
        <Base style={{ height }} className="w-full rounded-[10px]" />
      </div>
    </div>
  );
}

// ── Table row skeleton ─────────────────────────────────────────────────────────
interface RowProps {
  cols?: number;
  className?: string;
}

function Row({ cols = 5, className }: RowProps) {
  const widths = ["w-[140px]", "w-[90px]", "w-[110px]", "w-[80px]", "w-[60px]"];
  return (
    <div
      className={cn("flex items-center gap-4 px-4 py-[13px]", className)}
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Base
          key={i}
          className={cn("h-[13px] rounded-[6px] flex-none", widths[i % widths.length])}
        />
      ))}
    </div>
  );
}

// ── Table skeleton (header + N rows) ──────────────────────────────────────────
interface TableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

function Table({ rows = 6, cols = 5, className }: TableProps) {
  return (
    <div
      className={cn("fobo-card overflow-hidden", className)}
      style={{ background: "var(--color-surface)" }}
    >
      {/* Table header */}
      <div
        className="flex items-center gap-4 px-4 py-[11px]"
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-background)",
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Base key={i} className="h-[11px] w-[80px] rounded-[5px] flex-none opacity-50" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Row key={i} cols={cols} />
      ))}
    </div>
  );
}

// ── Card skeleton (generic panel) ──────────────────────────────────────────────
interface CardProps {
  lines?: number;
  className?: string;
}

function Card({ lines = 3, className }: CardProps) {
  return (
    <div
      className={cn("fobo-card p-5 flex flex-col gap-3", className)}
      style={{ background: "var(--color-surface)" }}
    >
      <Base className="h-[15px] w-[45%] rounded-[6px]" />
      {Array.from({ length: lines }).map((_, i) => (
        <Base
          key={i}
          className={cn("h-[13px] rounded-[6px]", i === lines - 1 ? "w-[65%]" : "w-full")}
        />
      ))}
    </div>
  );
}

// ── Connection card skeleton ───────────────────────────────────────────────────
function Connection() {
  return (
    <div
      className="fobo-card p-[18px] flex items-center gap-4"
      style={{ background: "var(--color-surface)" }}
    >
      <Base className="w-[40px] h-[40px] rounded-[10px] flex-none" />
      <div className="flex-1 flex flex-col gap-[8px]">
        <Base className="h-[14px] w-[120px] rounded-[6px]" />
        <Base className="h-[11px] w-[80px] rounded-[5px]" />
      </div>
      <Base className="w-[80px] h-[30px] rounded-[8px] flex-none" />
    </div>
  );
}

// ── Approval item skeleton ─────────────────────────────────────────────────────
function Approval() {
  return (
    <div
      className="fobo-card overflow-hidden"
      style={{ background: "var(--color-surface)" }}
    >
      <Base className="w-full h-[180px] rounded-none" />
      <div className="p-4 flex flex-col gap-[10px]">
        <Base className="h-[13px] w-[70%] rounded-[6px]" />
        <Base className="h-[11px] w-[50%] rounded-[5px]" />
        <div className="flex gap-2 mt-1">
          <Base className="h-[32px] flex-1 rounded-[8px]" />
          <Base className="h-[32px] flex-1 rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}

// ── Stat tile skeleton ─────────────────────────────────────────────────────────
function Stat() {
  return (
    <div
      className="rounded-[10px] p-4 flex flex-col gap-[8px]"
      style={{ background: "var(--color-background)" }}
    >
      <Base className="h-[11px] w-[55%] rounded-[5px]" />
      <Base className="h-[24px] w-[40%] rounded-[7px]" />
      <Base className="h-[10px] w-[35%] rounded-[5px]" />
    </div>
  );
}

export const Skeleton = Object.assign(Base, { KPI, Chart, Row, Table, Card, Connection, Approval, Stat });
