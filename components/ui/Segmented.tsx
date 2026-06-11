"use client";

import { cn } from "@/lib/utils";

type Option = {
  v: string;
  l: string;
  dot?: string;
  icon?: React.ReactNode;
};

interface SegmentedProps {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  sm?: boolean;
}

export function Segmented({ options, value, onChange, sm }: SegmentedProps) {
  return (
    <div
      className="inline-flex gap-[2px] p-[3px]"
      style={{ background: "var(--color-background)", borderRadius: sm ? 9 : 10 }}
    >
      {options.map((o) => {
        const active = o.v === value;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "inline-flex items-center gap-[6px] border-none cursor-pointer transition-colors",
              sm ? "text-[12px] px-[11px] py-[5px] rounded-[7px]" : "text-[13px] px-[14px] py-[6px] rounded-[8px]"
            )}
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: active ? 600 : 500,
              background: active ? "var(--color-surface)" : "transparent",
              color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              boxShadow: active ? "var(--shadow-2)" : "none",
            }}
          >
            {o.dot && (
              <span
                className="rounded-full flex-shrink-0"
                style={{ width: 7, height: 7, background: o.dot }}
              />
            )}
            {o.icon}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
