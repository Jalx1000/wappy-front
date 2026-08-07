"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useMacrosStore } from "@/store/macros";
import { MACRO_CATEGORIES, MACRO_VARS, type Macro } from "./macrosData";
import { VarPreview } from "./MacroMenu";

const fl: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };

type MacroDraft = { id?: string; shortcut: string; title: string; category: string; body: string };

function MacroEditor({ initial, onClose, onSave, onDelete }: {
  initial: Macro | null; onClose: () => void; onSave: (m: MacroDraft) => void; onDelete: (m: Macro) => void;
}) {
  const editing = !!initial;
  const [m, setM] = useState<MacroDraft>(initial || { shortcut: "", title: "", category: "General", body: "" });
  const set = <K extends keyof MacroDraft>(k: K, v: MacroDraft[K]) => setM((p) => ({ ...p, [k]: v }));
  const taRef = useRef<HTMLTextAreaElement>(null);
  const insertVar = (token: string) => {
    const ta = taRef.current;
    const b = m.body || "";
    const at = ta ? ta.selectionStart : b.length;
    const end = ta ? ta.selectionEnd : at;
    set("body", b.slice(0, at) + `{{${token}}}` + b.slice(end));
  };
  const can = m.shortcut.trim() && m.title.trim() && m.body.trim();

  return (
    <Modal onClose={onClose} width={520}>
      <ModalHeader title={editing ? "Editar respuesta" : "Nueva respuesta"} subtitle="Respuesta reutilizable con variables" onClose={onClose} />
      <div style={{ padding: "18px 22px", overflowY: "auto" }}>
        <div className="flex gap-3" style={{ marginBottom: 14 }}>
          <div className="flex-1">
            <label style={fl}>Atajo</label>
            <div className="flex items-center" style={{ border: "1px solid var(--color-border)", borderRadius: 14, paddingLeft: 12, height: 48 }}>
              <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", fontSize: 14 }}>/</span>
              <input value={m.shortcut} placeholder="reembolso" onChange={(e) => set("shortcut", e.target.value.replace(/\s+/g, "-").toLowerCase())}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--color-text-primary)", padding: "0 10px" }} />
            </div>
          </div>
          <div className="flex-1">
            <label style={fl}>Categoría</label>
            <select className="fobo-input" value={m.category} onChange={(e) => set("category", e.target.value)}>{MACRO_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={fl}>Título</label>
          <input className="fobo-input" value={m.title} placeholder="Reembolso iniciado" onChange={(e) => set("title", e.target.value)} />
        </div>
        <label style={fl}>Mensaje</label>
        <div className="flex gap-1.5 flex-wrap" style={{ marginBottom: 6 }}>
          {MACRO_VARS.map((v) => (
            <button key={v} type="button" onMouseDown={(e) => { e.preventDefault(); insertVar(v); }}
              style={{ height: 28, padding: "0 9px", borderRadius: 7, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-primary-ink)", cursor: "pointer", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{`{{${v}}}`}</button>
          ))}
        </div>
        <textarea ref={taRef} value={m.body} onChange={(e) => set("body", e.target.value)} rows={4}
          style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 14, border: "1px solid var(--color-border)", outline: "none", resize: "vertical", fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.5, color: "var(--color-text-primary)", background: "var(--color-surface)" }} />
        <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "var(--color-background)", border: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-tertiary)", marginBottom: 5 }}>Vista previa</div>
          <div style={{ fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{m.body ? <VarPreview body={m.body} /> : <span style={{ color: "var(--color-text-tertiary)" }}>Escribe un mensaje…</span>}</div>
        </div>
      </div>
      <div className="flex items-center gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        {editing && <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" style={{ color: "var(--color-error)" }} onClick={() => onDelete(initial!)}><Icon name="trash" size={15} /> Eliminar</button>}
        <div className="ml-auto flex gap-2.5">
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onSave(m)}><Icon name="check2" size={16} /> {editing ? "Guardar" : "Crear"}</button>
        </div>
      </div>
    </Modal>
  );
}

export function MacroManager({ onClose }: { onClose: () => void }) {
  const { macros, setMacros } = useMacrosStore();
  const toast = useToast();
  const [editing, setEditing] = useState<Macro | Record<string, never> | null>(null);

  if (editing) {
    const init = "id" in editing ? (editing as Macro) : null;
    return (
      <MacroEditor
        initial={init}
        onClose={() => setEditing(null)}
        onSave={(m) => {
          if (m.id) setMacros((p) => p.map((x) => (x.id === m.id ? { ...x, ...m } as Macro : x)));
          else setMacros((p) => [...p, { ...m, id: "macro_" + Date.now() }]);
          setEditing(null); toast(m.id ? "Respuesta actualizada" : "Respuesta creada");
        }}
        onDelete={(m) => { setMacros((p) => p.filter((x) => x.id !== m.id)); setEditing(null); toast("Respuesta eliminada"); }}
      />
    );
  }

  const cats = [...new Set(macros.map((m) => m.category))];
  return (
    <Modal onClose={onClose} width={560}>
      <ModalHeader title="Respuestas guardadas" subtitle={`${macros.length} respuestas · escribe / en el mensaje para usarlas`} onClose={onClose} />
      <div style={{ padding: "8px 16px", maxHeight: "60vh", overflowY: "auto" }}>
        {cats.map((cat) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)", padding: "10px 8px 4px" }}>{cat}</div>
            {macros.filter((m) => m.category === cat).map((m) => (
              <div key={m.id} onClick={() => setEditing(m)} className="flex items-start gap-2.5 cursor-pointer" style={{ padding: 10, borderRadius: 10 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <span style={{ marginTop: 1, fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 600, color: "var(--color-primary-ink)", background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 6, padding: "2px 6px", flex: "none" }}>/{m.shortcut}</span>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{m.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.4, marginTop: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}><VarPreview body={m.body} /></div>
                </div>
                <Icon name="edit" size={15} style={{ color: "var(--color-text-tertiary)", flex: "none", marginTop: 2 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-end" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setEditing({})}><Icon name="plus" size={16} /> Nueva respuesta</button>
      </div>
    </Modal>
  );
}
