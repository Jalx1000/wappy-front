"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useUIStore } from "@/store/ui";
import {
  WORKSPACES,
  orderedItems,
  type WorkspaceId,
} from "@/components/shell/nav";

/**
 * Lets the user choose which modules appear in the sidebar and in what order,
 * per workspace (CRM / Pautas). Reorder with up/down buttons (keyboard
 * accessible); toggle visibility with a switch. Changes persist via the UI
 * store and are reflected live in the sidebar.
 */
export function NavigationSection() {
  const { workspacePrefs, setWorkspaceOrder, toggleWorkspaceItem, resetWorkspacePrefs } =
    useUIStore();
  const toast = useToast();
  const [ws, setWs] = useState<WorkspaceId>("crm");

  const pref = workspacePrefs[ws];
  const items = orderedItems(ws, pref);
  const hidden = new Set(pref.hidden);

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const ids = items.map((it) => it.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    setWorkspaceOrder(ws, ids);
  };

  const customized = pref.order.length > 0 || pref.hidden.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 18,
            color: "var(--color-text-primary)",
          }}
        >
          Navegación
        </h2>
        {customized && (
          <button
            type="button"
            className="fobo-btn fobo-btn-ghost fobo-btn-sm"
            onClick={() => {
              resetWorkspacePrefs(ws);
              toast("Navegación restablecida");
            }}
          >
            Restablecer
          </button>
        )}
      </div>
      <p className="text-[13.5px] mb-4" style={{ color: "var(--color-text-secondary)" }}>
        Elige qué módulos ver en el menú lateral y en qué orden, para cada área.
      </p>

      {/* Workspace selector */}
      <div
        className="inline-flex p-1 rounded-[10px] mb-4"
        style={{ background: "var(--color-background)" }}
        role="tablist"
        aria-label="Área"
      >
        {WORKSPACES.map((w) => {
          const active = w.id === ws;
          return (
            <button
              key={w.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setWs(w.id)}
              className="flex items-center gap-2 h-8 px-3 rounded-[8px] border-none cursor-pointer text-[13px] font-semibold fobo-focus-ring"
              style={{
                background: active ? "var(--color-surface)" : "transparent",
                color: active ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                boxShadow: active ? "var(--shadow-2)" : "none",
              }}
            >
              <Icon name={w.icon} size={15} strokeWidth={2} />
              {w.label}
            </button>
          );
        })}
      </div>

      {/* Module list */}
      <ul
        className="flex flex-col rounded-[12px] overflow-hidden m-0 p-0 list-none"
        style={{ border: "1px solid var(--color-border)" }}
      >
        {items.map((item, i) => {
          const isHidden = hidden.has(item.id);
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 px-3 py-2"
              style={{
                borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                background: "var(--color-surface)",
                opacity: isHidden ? 0.55 : 1,
              }}
            >
              {/* Reorder controls */}
              <div className="flex flex-col flex-none">
                <button
                  type="button"
                  aria-label={`Subir ${item.label}`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="flex items-center justify-center w-6 h-5 rounded-[5px] border-none bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed fobo-focus-ring"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <Icon name="chevronD" size={13} strokeWidth={2.5} style={{ transform: "rotate(180deg)" }} />
                </button>
                <button
                  type="button"
                  aria-label={`Bajar ${item.label}`}
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                  className="flex items-center justify-center w-6 h-5 rounded-[5px] border-none bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed fobo-focus-ring"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <Icon name="chevronD" size={13} strokeWidth={2.5} />
                </button>
              </div>

              <span
                className="flex items-center justify-center flex-none rounded-[8px]"
                style={{ width: 30, height: 30, background: "var(--color-background)", color: "var(--color-text-secondary)" }}
              >
                <Icon name={item.icon} size={16} strokeWidth={1.9} />
              </span>

              <span className="flex-1 text-[13.5px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                {item.label}
              </span>

              {/* Visibility toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={!isHidden}
                aria-label={`${isHidden ? "Mostrar" : "Ocultar"} ${item.label}`}
                className="fobo-toggle"
                onClick={() => toggleWorkspaceItem(ws, item.id)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
