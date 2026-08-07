"use client";

import { Icon } from "@/components/ui/Icon";
import type { Macro } from "./macrosData";

/** Split a template into text + highlighted variable chips. */
export function VarPreview({ body }: { body: string }) {
  const parts = body.split(/(\{\{\s*[\w.]+\s*\}\})/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\{\{/.test(p) ? (
          <span key={i} style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)", borderRadius: 5, padding: "0 4px", fontWeight: 600, fontSize: "0.92em" }}>
            {p.replace(/[{}]/g, "").trim()}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export function filterMacros(macros: Macro[], query: string): Macro[] {
  if (!query) return macros;
  const q = query.toLowerCase();
  return macros.filter((m) => m.shortcut.toLowerCase().includes(q) || m.title.toLowerCase().includes(q));
}

interface MacroMenuProps {
  query: string;
  macros: Macro[];
  activeIdx: number;
  onPick: (m: Macro) => void;
  onHover: (i: number) => void;
}

/** Popover that appears when the agent types "/" in the composer. */
export function MacroMenu({ query, macros, activeIdx, onPick, onHover }: MacroMenuProps) {
  const filtered = filterMacros(macros, query);
  const pop: React.CSSProperties = {
    position: "absolute", left: 0, right: 0, bottom: "100%", marginBottom: 8,
    background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-3)", overflow: "hidden", zIndex: 22, animation: "fadeUp .15s var(--ease-spring)",
  };
  if (filtered.length === 0) {
    return (
      <div style={pop}>
        <div className="text-center" style={{ padding: 16, fontSize: 13, color: "var(--color-text-tertiary)" }}>Ningún atajo coincide con “/{query}”</div>
      </div>
    );
  }
  return (
    <div style={pop}>
      <div className="flex items-center gap-1.5" style={{ padding: "8px 12px 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" }}>
        <Icon name="zap" size={13} /> Respuestas guardadas
      </div>
      <div style={{ maxHeight: 260, overflowY: "auto", padding: "2px 6px 6px" }}>
        {filtered.map((m, i) => (
          <div key={m.id} onMouseEnter={() => onHover(i)} onMouseDown={(e) => { e.preventDefault(); onPick(m); }}
            className="flex items-start gap-2.5 cursor-pointer" style={{ padding: "9px 10px", borderRadius: 10, background: i === activeIdx ? "var(--color-primary-subtle)" : "transparent" }}>
            <span style={{ marginTop: 1, fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 600, color: "var(--color-primary-ink)", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 6, padding: "2px 6px", flex: "none" }}>/{m.shortcut}</span>
            <div className="min-w-0 flex-1">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{m.title}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4, marginTop: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}><VarPreview body={m.body} /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3" style={{ padding: "7px 12px", borderTop: "1px solid var(--color-border)", fontSize: 11, color: "var(--color-text-tertiary)" }}>
        <span><b>↑↓</b> navegar</span><span><b>↵</b> insertar</span><span><b>esc</b> cerrar</span>
      </div>
    </div>
  );
}
