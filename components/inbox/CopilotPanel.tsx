"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { suggestReplies, summarize, rewrite, type ConvMeta, type Tone } from "./copilotEngine";

type Tab = "reply" | "improve" | "summary";

function Shimmer({ lines = 2 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-shimmer" style={{ height: 48, borderRadius: 12 }} />
      ))}
      <div className="flex items-center gap-[7px] mt-0.5" style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
        <Icon name="spark" size={14} style={{ color: "var(--color-primary-ink)" }} /> Copilot está pensando…
      </div>
    </div>
  );
}

interface CopilotPanelProps {
  meta: ConvMeta;
  customerText: string;
  draft: string;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
  onClose: () => void;
}

export function CopilotPanel({ meta, customerText, draft, onInsert, onReplace, onClose }: CopilotPanelProps) {
  const initialTab: Tab = draft.trim() ? "improve" : "reply";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState<Tab | null>(initialTab === "reply" ? "reply" : null);
  const [replies, setReplies] = useState<string[] | null>(null);
  const [summary, setSummary] = useState<string[] | null>(null);

  const gen = <T,>(what: Tab, fn: () => T, set: (v: T) => void) => {
    setLoading(what);
    window.setTimeout(() => { set(fn()); setLoading(null); }, 650);
  };

  // Auto-load suggested replies once when the panel opens on the reply tab.
  // Only schedules an async fill — no synchronous setState in the effect body.
  useEffect(() => {
    if (initialTab !== "reply") return;
    const t = window.setTimeout(() => { setReplies(suggestReplies(customerText)); setLoading(null); }, 650);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tones: [Tone, string, IconName][] = [
    ["friendly", "Más cercano", "smile"],
    ["formal", "Más formal", "fileText"],
    ["shorter", "Más corto", "list"],
    ["grammar", "Corregir", "check2"],
  ];

  return (
    <div
      className="absolute z-[20] overflow-hidden"
      style={{
        left: 14, right: 14, bottom: "100%", marginBottom: 8,
        background: "var(--color-surface)", borderRadius: 16,
        border: "1px solid var(--color-border)", boxShadow: "var(--shadow-3)",
        animation: "fadeUp .18s var(--ease-spring)",
      }}
    >
      <div className="flex items-center gap-2" style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-border)", background: "linear-gradient(100deg, var(--color-primary-subtle), transparent)" }}>
        <span className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 8, background: "var(--color-primary)", color: "var(--color-on-primary)" }}><Icon name="spark" size={15} /></span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>Copilot</span>
        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500 }}>asistente IA</span>
        <button onClick={onClose} aria-label="Cerrar Copilot" className="ml-auto flex items-center justify-center rounded-full border-none cursor-pointer" style={{ width: 26, height: 26, background: "transparent", color: "var(--color-text-secondary)" }}><Icon name="x" size={16} /></button>
      </div>
      <div className="flex gap-1" style={{ padding: "10px 12px 0" }}>
        {([["reply", "Respuestas"], ["improve", "Mejorar"], ["summary", "Resumen"]] as [Tab, string][]).map(([id, lbl]) => (
          <button key={id} onClick={() => {
            setTab(id);
            if (id === "summary" && !summary) gen("summary", () => summarize(meta), setSummary);
            if (id === "reply" && !replies) gen("reply", () => suggestReplies(customerText), setReplies);
          }}
            className="cursor-pointer border-none rounded-full" style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", fontFamily: "var(--font-ui)",
              background: tab === id ? "var(--color-primary-subtle)" : "transparent", color: tab === id ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}>{lbl}</button>
        ))}
      </div>
      <div style={{ padding: "12px 14px 14px", maxHeight: 280, overflowY: "auto" }}>
        {tab === "reply" && (
          loading === "reply" ? <Shimmer lines={2} /> : (
            <div className="flex flex-col gap-2">
              {(replies || []).map((r, i) => (
                <div key={i} style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 12, background: "var(--color-background)" }}>
                  <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5, marginBottom: 10, whiteSpace: "pre-wrap" }}>{r}</div>
                  <div className="flex gap-2">
                    <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => onInsert(r)}><Icon name="check2" size={14} /> Usar</button>
                    <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => gen("reply", () => suggestReplies(customerText), setReplies)}><Icon name="spark" size={14} /> Regenerar</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {tab === "improve" && (
          !draft.trim()
            ? <div className="text-center" style={{ padding: "24px 12px", fontSize: 13, color: "var(--color-text-tertiary)" }}>Escribe un borrador y Copilot lo reescribe.</div>
            : loading === "improve" ? <Shimmer lines={2} />
            : (
              <div>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 10 }}>Reescribe tu borrador:</div>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map(([id, lbl, ic]) => (
                    <button key={id} onClick={() => { setLoading("improve"); window.setTimeout(() => { onReplace(rewrite(draft, id)); setLoading(null); onClose(); }, 600); }}
                      className="flex items-center gap-2 cursor-pointer" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                      <Icon name={ic} size={16} style={{ color: "var(--color-primary-ink)" }} /> {lbl}
                    </button>
                  ))}
                </div>
              </div>
            )
        )}
        {tab === "summary" && (
          loading === "summary" ? <Shimmer lines={3} /> : (
            <div>
              <ul className="m-0 flex flex-col gap-[7px]" style={{ paddingLeft: 18 }}>
                {(summary || summarize(meta)).map((s, i) => <li key={i} style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{s}</li>)}
              </ul>
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" style={{ marginTop: 12 }} onClick={() => onInsert((summary || summarize(meta)).map((s) => "• " + s).join("\n"))}><Icon name="fileText" size={14} /> Añadir como nota</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
