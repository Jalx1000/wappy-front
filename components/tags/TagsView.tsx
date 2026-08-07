"use client";

import { useState, type CSSProperties } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useTagsStore } from "@/store/tags";
import { TAG_COLORS, tagDot, type Tag, type TagColor } from "./data";

const card: CSSProperties = { background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", marginBottom: 14 };
const rowS: CSSProperties = { display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--color-border)" };
const fl: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };
const miniBtn: CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };

type TagDraft = { id?: string; name: string; color: TagColor; uses?: number };
type ModalState = { type: "new" } | { type: "edit"; tag: Tag } | { type: "del"; tag: Tag } | null;

function TagModal({ initial, onClose, onSave }: { initial?: Tag; onClose: () => void; onSave: (t: TagDraft) => void }) {
  const [t, setT] = useState<TagDraft>(initial || { name: "", color: "primary" });
  const can = !!t.name.trim();
  return (
    <Modal onClose={onClose} width={420}>
      <ModalHeader title={initial ? "Editar etiqueta" : "Nueva etiqueta"} onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        <label style={fl}>Nombre</label>
        <input className="fobo-input" autoFocus value={t.name} placeholder="p. ej. facturación" onChange={(e) => setT({ ...t, name: e.target.value.toLowerCase() })} />
        <label style={{ ...fl, marginTop: 14 }}>Color</label>
        <div style={{ display: "flex", gap: 8 }}>
          {TAG_COLORS.map((c) => (
            <button key={c.id} onClick={() => setT({ ...t, color: c.id })}
              style={{ width: 30, height: 30, borderRadius: 9999, background: c.dot, cursor: "pointer", border: t.color === c.id ? "2.5px solid var(--color-text-primary)" : "2.5px solid transparent" }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--color-border)", justifyContent: "flex-end" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onSave(t)}><Icon name="check2" size={16} /> {initial ? "Guardar" : "Crear"}</button>
      </div>
    </Modal>
  );
}

export function TagsView() {
  const { tags, setTags } = useTagsStore();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(null);

  const save = (t: TagDraft) => {
    if (t.id) setTags((p) => p.map((x) => (x.id === t.id ? { ...x, ...t } as Tag : x)));
    else setTags((p) => [...p, { name: t.name, color: t.color, id: "tag_" + Date.now(), uses: 0 }]);
    setModal(null); toast(t.id ? "Etiqueta actualizada" : "Etiqueta creada");
  };
  const del = (t: Tag) => { setTags((p) => p.filter((x) => x.id !== t.id)); setModal(null); toast("Etiqueta eliminada"); };

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--color-background)", height: "100%" }}>
      <div style={{ padding: "18px 28px 16px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Etiquetas</h1>
        <Badge variant="neutral">{tags.length}</Badge>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" style={{ marginLeft: "auto" }} onClick={() => setModal({ type: "new" })}><Icon name="plus" size={16} /> Nueva etiqueta</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        <div style={{ ...card, maxWidth: 720 }}>
          <div style={{ ...rowS, padding: "9px 20px" }}>
            {["Etiqueta", "Usada en", ""].map((h, i) => (
              <div key={i} style={{ flex: i === 0 ? 1 : "none", width: i === 1 ? 140 : i === 2 ? 80 : "auto", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" }}>{h}</div>
            ))}
          </div>
          {tags.map((t, i) => (
            <div key={t.id} style={{ ...rowS, borderBottom: i < tags.length - 1 ? rowS.borderBottom : "none" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: tagDot(t.color), flex: "none" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{t.name}</span>
              </div>
              <div style={{ width: 140, fontSize: 13, color: "var(--color-text-secondary)" }}>{t.uses} conversación{t.uses !== 1 ? "es" : ""}</div>
              <div style={{ width: 80, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <button title="Editar" onClick={() => setModal({ type: "edit", tag: t })} style={miniBtn}><Icon name="edit" size={16} /></button>
                <button title="Eliminar" onClick={() => setModal({ type: "del", tag: t })} style={{ ...miniBtn, color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>
              </div>
            </div>
          ))}
          {tags.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>Aún no hay etiquetas.</div>}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--color-text-tertiary)", maxWidth: 720 }}>Las etiquetas se aplican a conversaciones desde el panel de contacto y se pueden filtrar en la bandeja.</div>
      </div>
      {modal && (modal.type === "new" || modal.type === "edit") && <TagModal initial={modal.type === "edit" ? modal.tag : undefined} onClose={() => setModal(null)} onSave={save} />}
      {modal?.type === "del" && <ConfirmModal title="¿Eliminar etiqueta?" message={`«${modal.tag.name}» se quitará de todas las conversaciones.`} onClose={() => setModal(null)} onConfirm={() => del(modal.tag)} />}
    </div>
  );
}
