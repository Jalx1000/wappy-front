"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useAttributesStore } from "@/store/attributes";
import { RecordFormModal } from "@/components/attributes/AttributesModals";
import {
  colorTint,
  formatValue,
  type AttrRecord,
  type AttrValue,
  type FieldDef,
} from "@/components/attributes/data";

const miniBtn: CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent",
  color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex",
  alignItems: "center", justifyContent: "center",
};
const colHead: CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
  color: "var(--color-text-tertiary)",
};

type ModalState =
  | { type: "record"; data?: AttrRecord }
  | { type: "confirm"; title: string; message: string; onConfirm: () => void }
  | null;

/** Vista de registros de un módulo (custom object), navegable desde el sidebar.
 *  La edición del esquema (campos) vive en Atributos; aquí se gestionan filas. */
export function ObjectRecordsView({ moduleId }: { moduleId: string }) {
  const { modules, setModules } = useAttributesStore();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(null);

  const mod = modules.find((m) => m.id === moduleId);

  if (!mod) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40, background: "var(--color-background)" }}>
        <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
          <Icon name="database" size={26} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)" }}>Módulo no encontrado</div>
        <Link href="/app/attributes" className="fobo-btn fobo-btn-secondary fobo-btn-sm">Ir a Atributos</Link>
      </div>
    );
  }

  const tint = colorTint[mod.color] || colorTint.primary;
  const cols = mod.fields.slice(0, 6);

  const saveRecord = (data: Record<string, AttrValue> & { id?: string }) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        if (data.id) {
          return { ...m, records: m.records.map((r) => (r.id === data.id ? ({ ...r, ...data } as AttrRecord) : r)) };
        }
        return { ...m, records: [{ ...data, id: "rec_" + Date.now() } as AttrRecord, ...m.records] };
      }),
    );
    toast(data.id ? "Registro guardado" : "Registro añadido");
    setModal(null);
  };

  const deleteRecord = (r: AttrRecord) => {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, records: m.records.filter((x) => x.id !== r.id) } : m)));
    toast("Registro eliminado");
    setModal(null);
  };

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%", background: "var(--color-background)" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: tint.bg, color: tint.fg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <Icon name={mod.icon} size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0, fontSize: 20 }}>{mod.name}</h1>
              {mod.system ? <Badge variant="neutral">Sistema</Badge> : <Badge variant="primary">Personalizado</Badge>}
            </div>
            <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", margin: "4px 0 0", maxWidth: 620, lineHeight: 1.5 }}>
              {mod.description || `${mod.records.length} registro${mod.records.length === 1 ? "" : "s"} · ${mod.fields.length} campo${mod.fields.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flex: "none" }}>
            <Link href={`/app/attributes?module=${mod.id}`} className="fobo-btn fobo-btn-secondary fobo-btn-sm">
              <Icon name="settings" size={16} /> Editar campos
            </Link>
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setModal({ type: "record" })}>
              <Icon name="plus" size={16} /> Nuevo registro
            </button>
          </div>
        </div>
      </div>

      {/* Records */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div className="fobo-card" style={{ overflow: "hidden" }}>
          {mod.records.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-tertiary)" }}>
              <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon name="database" size={26} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)" }}>Aún no hay registros</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Añade tu primer registro en {mod.name}.</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: cols.length * 150 + 120 }}>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, minmax(130px, 1fr)) 84px`, gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", position: "sticky", top: 0 }}>
                  {cols.map((c) => <div key={c.id} style={colHead}>{c.label}</div>)}
                  <div style={colHead} />
                </div>
                {mod.records.map((rec) => (
                  <RecordRow
                    key={rec.id}
                    rec={rec}
                    cols={cols}
                    onEdit={() => setModal({ type: "record", data: rec })}
                    onDelete={() => setModal({ type: "confirm", title: "¿Eliminar registro?", message: "Este registro se eliminará permanentemente.", onConfirm: () => deleteRecord(rec) })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal?.type === "record" && (
        <RecordFormModal module={mod} initial={modal.data} onClose={() => setModal(null)} onSave={saveRecord} />
      )}
      {modal?.type === "confirm" && (
        <ConfirmModal title={modal.title} message={modal.message} confirmLabel="Eliminar" danger onConfirm={modal.onConfirm} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function RecordRow({ rec, cols, onEdit, onDelete }: { rec: AttrRecord; cols: FieldDef[]; onEdit: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onEdit}
      style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, minmax(130px, 1fr)) 84px`, gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--color-border)", alignItems: "center", cursor: "pointer", background: hover ? "var(--neutral-100)" : "transparent" }}>
      {cols.map((c, i) => (
        <div key={c.id} style={{ fontSize: 13.5, color: i === 0 ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontWeight: i === 0 ? 600 : 400, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {c.type === "boolean"
            ? <Badge variant={rec[c.key] ? "success" : "neutral"}>{rec[c.key] ? "Sí" : "No"}</Badge>
            : c.type === "select"
              ? (rec[c.key] ? <Badge variant="neutral">{String(rec[c.key])}</Badge> : "—")
              : <span className={["currency", "number", "decimal", "percent"].includes(c.type) ? "tnum" : ""}>{formatValue(c, rec[c.key])}</span>}
        </div>
      ))}
      <div style={{ display: "flex", gap: 2, justifyContent: "flex-end", opacity: hover ? 1 : 0, transition: "opacity 120ms" }}>
        <button title="Editar" onClick={(e) => { e.stopPropagation(); onEdit(); }} style={miniBtn}><Icon name="edit" size={16} /></button>
        <button title="Eliminar" onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ ...miniBtn, color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>
      </div>
    </div>
  );
}
