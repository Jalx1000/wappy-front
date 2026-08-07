"use client";

import { Toggle } from "@/components/ui/Toggle";
import { CHANNELS, st } from "./data";

export function ChannelIcon({ ch, size = 30 }: { ch: string; size?: number }) {
  const c = CHANNELS[ch];
  return (
    <span className="flex items-center justify-center flex-none rounded-full" style={{ width: size, height: size, background: c.color, color: "#fff", fontWeight: 700, fontSize: Math.round(size * 0.42) }}>
      {c.glyph}
    </span>
  );
}

export function ToggleRow({ label, hint, on, onToggle, last }: { label: string; hint?: string; on: boolean; onToggle: () => void; last?: boolean }) {
  return (
    <div style={{ ...st.row, borderBottom: last ? "none" : (st.row.borderBottom as string) }}>
      <div style={{ flex: 1 }}>
        <div style={st.label}>{label}</div>
        {hint && <div style={st.hint}>{hint}</div>}
      </div>
      <Toggle checked={on} onChange={() => onToggle()} aria-label={label} />
    </div>
  );
}
