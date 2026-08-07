"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useConvoStateStore, convoStateOf } from "@/store/convoState";

const HOUR = 3600_000;
const SNOOZE: { label: string; ms: number }[] = [
  { label: "1 hora", ms: HOUR },
  { label: "3 horas", ms: 3 * HOUR },
  { label: "Mañana", ms: 24 * HOUR },
  { label: "Próxima semana", ms: 7 * 24 * HOUR },
];

export function ThreadActions({ convoId }: { convoId: string }) {
  const byId = useConvoStateStore((s) => s.byId);
  const setStatus = useConvoStateStore((s) => s.setStatus);
  const st = convoStateOf(byId, convoId);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const resolved = st.status === "resolved";
  const snoozed = st.status === "snoozed";

  return (
    <div className="flex items-center gap-2 flex-none">
      {snoozed && <span className="fobo-badge bg-[var(--color-warning-bg)] text-[var(--color-warning)]">Pospuesta</span>}

      {/* Snooze */}
      <div className="relative">
        <button
          type="button"
          title="Posponer"
          aria-label="Posponer"
          onClick={() => setSnoozeOpen((v) => !v)}
          className="flex items-center justify-center rounded-[9px] cursor-pointer"
          style={{ width: 34, height: 34, background: snoozed ? "var(--color-warning-bg)" : "var(--color-background)", border: "1px solid var(--color-border)", color: snoozed ? "var(--color-warning)" : "var(--color-text-secondary)" }}
        >
          <Icon name="clock" size={16} />
        </button>
        {snoozeOpen && (
          <>
            <div className="fixed inset-0 z-[40]" onClick={() => setSnoozeOpen(false)} />
            <div className="absolute z-[41]" style={{ top: "calc(100% + 6px)", right: 0, minWidth: 170, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 6 }}>
              {SNOOZE.map((s) => (
                <button key={s.label} onClick={() => { setStatus(convoId, "snoozed", new Date(Date.now() + s.ms).toISOString()); setSnoozeOpen(false); }}
                  className="flex items-center gap-2 w-full text-left rounded-[8px] cursor-pointer" style={{ padding: "8px 10px", background: "transparent", border: "none", color: "var(--color-text-primary)", fontSize: 13 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Icon name="clock" size={14} style={{ color: "var(--color-text-tertiary)" }} /> {s.label}
                </button>
              ))}
              {snoozed && (
                <button onClick={() => { setStatus(convoId, "open"); setSnoozeOpen(false); }} className="flex items-center gap-2 w-full text-left rounded-[8px] cursor-pointer" style={{ padding: "8px 10px", background: "transparent", border: "none", color: "var(--color-text-secondary)", fontSize: 13, borderTop: "1px solid var(--color-border)", marginTop: 4 }}>
                  Quitar posposición
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Resolve / Reopen */}
      <button
        type="button"
        onClick={() => setStatus(convoId, resolved ? "open" : "resolved")}
        className="flex items-center gap-1.5 text-[13px] font-semibold rounded-[9px] px-3 py-2 cursor-pointer"
        style={
          resolved
            ? { background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }
            : { background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none" }
        }
      >
        <Icon name="check2" size={15} /> {resolved ? "Reabrir" : "Resolver"}
      </button>
    </div>
  );
}
