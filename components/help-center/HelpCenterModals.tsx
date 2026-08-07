"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { mdToHtml, MD_SNIPPETS } from "./markdown";
import { COLLECTION_ICONS, type Article, type ArticleStatus, type Collection, type HcColor } from "./data";

const hcL: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };

export type ArticleDraft = { id?: string; title: string; colId: string; status: ArticleStatus; excerpt: string; body: string };

export function ArticleEditor({ initial, collections, defaultColId, onClose, onSave }: {
  initial?: Article; collections: Collection[]; defaultColId?: string | null; onClose: () => void; onSave: (a: ArticleDraft) => void;
}) {
  const editing = !!initial;
  const [a, setA] = useState<ArticleDraft>(
    initial
      ? { id: initial.id, title: initial.title, colId: initial.colId, status: initial.status, excerpt: initial.excerpt, body: initial.body }
      : { title: "", colId: defaultColId || collections[0].id, status: "draft", excerpt: "", body: "## Título\n\nEmpieza a escribir…" }
  );
  const set = <K extends keyof ArticleDraft>(k: K, v: ArticleDraft[K]) => setA((p) => ({ ...p, [k]: v }));
  const taRef = useRef<HTMLTextAreaElement>(null);
  const insert = (txt: string) => {
    const ta = taRef.current; const body = a.body || "";
    const start = ta ? ta.selectionStart : body.length;
    set("body", body.slice(0, start) + txt + body.slice(ta ? ta.selectionEnd : start));
  };
  const can = a.title.trim() && a.body.trim();
  const colName = collections.find((c) => c.id === a.colId)?.name;

  return (
    <Modal onClose={onClose} width={860}>
      <ModalHeader title={editing ? "Editar artículo" : "Nuevo artículo"} subtitle={editing ? a.title : "Escribe un artículo en Markdown"} onClose={onClose} />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", minHeight: 0, flex: 1 }}>
        {/* editor side */}
        <div style={{ padding: "16px 20px", overflowY: "auto", borderRight: "1px solid var(--color-border)" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={hcL}>Título</label>
            <input className="fobo-input" autoFocus value={a.title} placeholder="Título del artículo" onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="flex gap-2.5" style={{ marginBottom: 12 }}>
            <div className="flex-1">
              <label style={hcL}>Colección</label>
              <select className="fobo-input" value={a.colId} onChange={(e) => set("colId", e.target.value)}>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label style={hcL}>Estado</label>
              <div className="flex gap-1.5">
                {([["draft", "Borrador"], ["published", "Publicado"]] as [ArticleStatus, string][]).map(([id, lbl]) => (
                  <button key={id} type="button" onClick={() => set("status", id)} className="flex-1 cursor-pointer"
                    style={{ height: 48, borderRadius: 12, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
                      background: a.status === id ? "var(--color-primary-subtle)" : "var(--color-surface)", color: a.status === id ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
                      border: a.status === id ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>{lbl}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={hcL}>Extracto <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(resumen para búsqueda y tarjeta)</span></label>
            <input className="fobo-input" value={a.excerpt} placeholder="Resumen de una línea" onChange={(e) => set("excerpt", e.target.value)} />
          </div>
          <label style={hcL}>Contenido <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(Markdown)</span></label>
          <div className="flex gap-[3px] flex-wrap" style={{ marginBottom: 6 }}>
            {MD_SNIPPETS.map((sn) => (
              <button key={sn.label} type="button" onMouseDown={(e) => { e.preventDefault(); insert(sn.insert); }}
                style={{ height: 30, minWidth: 30, padding: "0 8px", borderRadius: 7, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: sn.bold ? 700 : 500, fontFamily: "var(--font-ui)" }}>{sn.label}</button>
            ))}
          </div>
          <textarea ref={taRef} value={a.body} onChange={(e) => set("body", e.target.value)} spellCheck={false}
            style={{ width: "100%", boxSizing: "border-box", minHeight: 240, padding: 14, borderRadius: 12, border: "1px solid var(--color-border)", outline: "none", resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)", background: "var(--color-surface)" }} />
        </div>
        {/* preview side */}
        <div style={{ overflowY: "auto", background: "var(--color-background)" }}>
          <div className="flex items-center gap-2 sticky top-0" style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-background)" }}>
            <Icon name="eye" size={15} style={{ color: "var(--color-text-tertiary)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Vista previa en vivo</span>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary-ink)", marginBottom: 6 }}>{colName}</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: "0 0 6px", fontFamily: "var(--font-display)" }}>{a.title || "Artículo sin título"}</h1>
            <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 18 }}>Actualizado ahora mismo</div>
            <div dangerouslySetInnerHTML={{ __html: mdToHtml(a.body) }} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        {(!editing || a.status === "draft") && (
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" disabled={!can} onClick={() => onSave({ ...a, status: "draft" })}>Guardar borrador</button>
        )}
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onSave({ ...a, status: "published" })}>
          <Icon name="globe" size={16} /> {editing ? "Guardar y publicar" : "Publicar"}
        </button>
      </div>
    </Modal>
  );
}

export type CollectionDraft = { id?: string; name: string; desc: string; icon: Collection["icon"]; color: HcColor };

export function CollectionModal({ initial, onClose, onSave }: { initial?: Collection; onClose: () => void; onSave: (c: CollectionDraft) => void }) {
  const editing = !!initial;
  const [c, setC] = useState<CollectionDraft>(initial || { name: "", desc: "", icon: "book", color: "primary" });
  const set = <K extends keyof CollectionDraft>(k: K, v: CollectionDraft[K]) => setC((p) => ({ ...p, [k]: v }));
  const colors: [HcColor, string][] = [["primary", "var(--color-primary-ink)"], ["success", "var(--color-success)"], ["warning", "var(--color-warning)"]];
  const can = c.name.trim().length > 0;
  return (
    <Modal onClose={onClose} width={460}>
      <ModalHeader title={editing ? "Editar colección" : "Nueva colección"} subtitle="Agrupa artículos relacionados" onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ marginBottom: 14 }}>
          <label style={hcL}>Nombre</label>
          <input className="fobo-input" autoFocus value={c.name} placeholder="p. ej. Primeros pasos" onChange={(e) => set("name", e.target.value)} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={hcL}>Descripción</label>
          <input className="fobo-input" value={c.desc} placeholder="Resumen breve" onChange={(e) => set("desc", e.target.value)} />
        </div>
        <div className="flex" style={{ gap: 18 }}>
          <div>
            <label style={hcL}>Color</label>
            <div className="flex items-center gap-1.5" style={{ height: 40 }}>
              {colors.map(([id, col]) => <button key={id} type="button" onClick={() => set("color", id)} style={{ width: 28, height: 28, borderRadius: 9999, cursor: "pointer", background: col, border: c.color === id ? "2.5px solid var(--color-text-primary)" : "2.5px solid transparent" }} />)}
            </div>
          </div>
          <div className="flex-1">
            <label style={hcL}>Icono</label>
            <div className="flex gap-1.5 flex-wrap">
              {COLLECTION_ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => set("icon", ic)} className="inline-flex items-center justify-center cursor-pointer"
                  style={{ width: 38, height: 38, borderRadius: 10, background: c.icon === ic ? "var(--color-primary-subtle)" : "var(--color-surface)", color: c.icon === ic ? "var(--color-primary-ink)" : "var(--color-text-secondary)", border: c.icon === ic ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}><Icon name={ic} size={18} /></button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onSave(c)}><Icon name="check2" size={16} /> {editing ? "Guardar colección" : "Crear colección"}</button>
      </div>
    </Modal>
  );
}
