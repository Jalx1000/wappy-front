"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useConvoStateStore, convoStateOf } from "@/store/convoState";
import { AGENTS } from "@/components/team-inbox/data";

const COLLEAGUES = AGENTS.filter((a) => a.id !== "you");

function initialsOf(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

/** Private side conversation with a colleague, shown over the details column.
 *  Amber styling reinforces that the customer never sees it. */
export function SideConversationPanel({ convoId, onClose }: { convoId: string; onClose: () => void }) {
  const byId = useConvoStateStore((s) => s.byId);
  const startSide = useConvoStateStore((s) => s.startSide);
  const addSideMessage = useConvoStateStore((s) => s.addSideMessage);
  const st = convoStateOf(byId, convoId);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const threadLen = st.sideThread.length;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [threadLen]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    addSideMessage(convoId, t, "Tú", true);
    setDraft("");
    // Mock a colleague reply so the thread feels alive.
    if (st.sideWith) {
      const colleague = st.sideWith;
      setTimeout(() => {
        addSideMessage(convoId, "Entendido, lo reviso y te digo 👍", colleague, false);
      }, 1400);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-surface)", borderLeft: "1px solid var(--color-border)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 flex-none" style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-border)", background: "var(--color-warning-bg)" }}>
        <Icon name="users" size={16} style={{ color: "var(--color-warning)" }} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Consulta privada</div>
          <div className="text-[11px]" style={{ color: "var(--color-warning)" }}>El cliente no la ve</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar consulta" className="flex items-center justify-center rounded-[8px] cursor-pointer"
          style={{ width: 28, height: 28, border: "none", background: "transparent", color: "var(--color-text-secondary)" }}>
          <Icon name="x" size={16} />
        </button>
      </div>

      {!st.sideWith ? (
        /* Colleague picker */
        <div className="flex-1 overflow-y-auto" style={{ padding: 12 }}>
          <div className="text-[12px] mb-2" style={{ color: "var(--color-text-secondary)" }}>Consulta con un compañero:</div>
          {COLLEAGUES.map((a) => (
            <button key={a.id} type="button" onClick={() => startSide(convoId, a.name)}
              className="flex items-center gap-3 w-full text-left rounded-[10px] cursor-pointer mb-1"
              style={{ padding: "10px 10px", border: "1px solid var(--color-border)", background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 30, height: 30, fontSize: 10, fontWeight: 700, background: a.tint[0], color: a.tint[1] }}>{initialsOf(a.name)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{a.name}</div>
                <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{a.role}{a.online ? " · en línea" : ""}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Thread */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ padding: 12 }}>
            <div className="text-[11px] text-center" style={{ color: "var(--color-text-tertiary)", padding: "4px 0 8px" }}>
              Consulta con <b style={{ color: "var(--color-text-secondary)" }}>{st.sideWith}</b>
            </div>
            {st.sideThread.length === 0 && (
              <div className="text-[12px] text-center" style={{ color: "var(--color-text-tertiary)", padding: "24px 8px" }}>
                Escribe para preguntar algo en privado a {st.sideWith}.
              </div>
            )}
            {st.sideThread.map((m) => (
              <div key={m.id} className="max-w-[85%] flex flex-col" style={{ alignSelf: m.mine ? "flex-end" : "flex-start" }}>
                <div className="text-[13px] leading-snug" style={{
                  padding: "8px 11px", borderRadius: 12,
                  background: m.mine ? "var(--color-warning)" : "var(--color-warning-bg)",
                  color: m.mine ? "#fff" : "var(--color-text-primary)",
                  border: m.mine ? "none" : "1px solid var(--color-warning)",
                }}>
                  {m.text}
                </div>
                <span className="text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)", alignSelf: m.mine ? "flex-end" : "flex-start" }}>
                  {m.author} · {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
          {/* Composer */}
          <div className="flex items-center gap-2 flex-none" style={{ padding: 10, borderTop: "1px solid var(--color-border)" }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Mensaje privado a ${st.sideWith}…`}
              className="flex-1 text-[13px] rounded-[10px] px-3 py-2 outline-none"
              style={{ border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-text-primary)" }} />
            <button type="button" onClick={send} disabled={!draft.trim()} aria-label="Enviar"
              className="flex items-center justify-center rounded-[10px] cursor-pointer flex-none"
              style={{ width: 38, height: 38, border: "none", background: "var(--color-warning)", color: "#fff", opacity: draft.trim() ? 1 : 0.5 }}>
              <Icon name="send" size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
