"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUIStore } from "@/store/ui";
import { WORKSPACES, type WorkspaceId } from "@/components/shell/nav";

/**
 * Switches the active product workspace (CRM ↔ Pautas), which filters the
 * sidebar nav. Expanded: a dropdown; collapsed: an icon button that cycles.
 */
export function WorkspaceSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { activeWorkspace, setActiveWorkspace } = useUIStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = WORKSPACES.find((w) => w.id === activeWorkspace) ?? WORKSPACES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (id: WorkspaceId) => {
    setActiveWorkspace(id);
    setOpen(false);
  };

  if (collapsed) {
    // Cycle to the next workspace; tooltip shows what's active.
    const next = WORKSPACES[(WORKSPACES.findIndex((w) => w.id === activeWorkspace) + 1) % WORKSPACES.length];
    return (
      <button
        type="button"
        onClick={() => setActiveWorkspace(next.id)}
        title={`${current.label} · cambiar a ${next.label}`}
        aria-label={`Área: ${current.label}. Cambiar a ${next.label}`}
        className="flex items-center justify-center w-9 h-9 mx-auto rounded-[9px] border-none cursor-pointer fobo-focus-ring"
        style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}
      >
        <Icon name={current.icon} size={18} strokeWidth={2} />
      </button>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-[10px] w-full h-[42px] px-[10px] rounded-[10px] border-none cursor-pointer fobo-focus-ring transition-colors"
        style={{ background: "var(--color-background)", color: "var(--color-text-primary)" }}
      >
        <span
          className="flex items-center justify-center flex-none rounded-[8px]"
          style={{ width: 28, height: 28, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}
        >
          <Icon name={current.icon} size={16} strokeWidth={2} />
        </span>
        <span className="flex-1 min-w-0 text-left">
          <span className="block text-[13px] font-semibold leading-tight truncate">{current.label}</span>
          <span className="block text-[11px] leading-tight truncate" style={{ color: "var(--color-text-tertiary)" }}>
            {current.blurb}
          </span>
        </span>
        <Icon name="chevronDown" size={15} style={{ color: "var(--color-text-tertiary)", flex: "none" }} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 p-1 rounded-[12px]"
          style={{
            background: "var(--color-surface-overlay)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-3)",
          }}
        >
          {WORKSPACES.map((w) => {
            const active = w.id === activeWorkspace;
            return (
              <button
                key={w.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => choose(w.id)}
                className="flex items-center gap-[10px] w-full px-[10px] py-2 rounded-[8px] border-none cursor-pointer text-left fobo-focus-ring transition-colors"
                style={{ background: active ? "var(--color-primary-subtle)" : "transparent", color: "var(--color-text-primary)" }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--neutral-100)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <span
                  className="flex items-center justify-center flex-none rounded-[8px]"
                  style={{ width: 28, height: 28, background: active ? "var(--color-primary)" : "var(--color-background)", color: active ? "var(--color-on-primary)" : "var(--color-text-secondary)" }}
                >
                  <Icon name={w.icon} size={16} strokeWidth={2} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight truncate">{w.label}</span>
                  <span className="block text-[11px] leading-tight truncate" style={{ color: "var(--color-text-tertiary)" }}>
                    {w.blurb}
                  </span>
                </span>
                {active && <Icon name="check" size={15} style={{ color: "var(--color-primary-ink)", flex: "none" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
