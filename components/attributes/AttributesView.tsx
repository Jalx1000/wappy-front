"use client";

import { useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useAttributesStore } from "@/store/attributes";
import {
  FIELD_TYPES, colorTint, formatValue,
  type FieldDef, type ModuleDef, type AttrRecord, type AttrValue,
} from "./data";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FieldFormModal, ModuleFormModal, RecordFormModal } from "./AttributesModals";

const miniBtn: CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent",
  color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const colHead: CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)",
};

type ModalState =
  | { type: "field"; data?: FieldDef }
  | { type: "module"; data?: ModuleDef }
  | { type: "record"; data?: AttrRecord }
  | { type: "confirm"; title: string; message: string; onConfirm: () => void }
  | null;

// ── Left rail: module list ───────────────────────────────────────────────────
function ModuleRail({ modules, selectedId, onSelect, onNew }: {
  modules: ModuleDef[]; selectedId: string; onSelect: (id: string) => void; onNew: () => void;
}) {
  return (
    <div style={{ width: 260, flex: "none", background: "var(--color-sidebar)", height: "100%", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 12px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Atributos</div>
        <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }}>Campos y módulos personalizados</div>
      </div>
      <div style={{ padding: "0 10px 6px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)", padding: "8px 8px 6px" }}>Módulos</div>
        {modules.map((m) => {
          const on = m.id === selectedId; const tint = colorTint[m.color] || colorTint.primary;
          return (
            <div key={m.id} onClick={() => onSelect(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, cursor: "pointer",
              background: on ? "var(--color-surface)" : "transparent", boxShadow: on ? "var(--shadow-2)" : "none", marginBottom: 2 }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--neutral-100)"; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: tint.bg, color: tint.fg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name={m.icon} size={18} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{m.fields.length} campos · {m.records.length} registros</div>
              </div>
              {m.system && <span title="Módulo del sistema" style={{ color: "var(--color-text-tertiary)" }}><Icon name="settings" size={13} /></span>}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "8px 12px" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" style={{ width: "100%" }} onClick={onNew}>
          <Icon name="plus" size={16} /> Nuevo módulo
        </button>
      </div>
    </div>
  );
}

// ── Field row (schema tab) ───────────────────────────────────────────────────
function FieldRow({ field, onEdit, onDelete }: { field: FieldDef; onEdit: (f: FieldDef) => void; onDelete: (f: FieldDef) => void }) {
  const [hover, setHover] = useState(false);
  const t = FIELD_TYPES[field.type];
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--color-border)", background: hover ? "var(--neutral-50)" : "transparent" }}>
      <span style={{ color: "var(--color-text-tertiary)", cursor: "grab", flex: "none" }}><Icon name="grip" size={16} /></span>
      <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--color-background)", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon name={t.icon} size={17} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{field.label}</span>
          {field.required && <Badge variant="warning" className="text-[10px]">Obligatorio</Badge>}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 1 }}>
          <code style={{ fontFamily: "var(--font-mono)" }}>{field.key}</code>
          {t.hasOptions && field.options ? " · " + field.options.length + " opciones" : ""}
          {field.type === "currency" && field.symbol ? " · " + field.symbol : ""}
        </div>
      </div>
      <Badge variant="neutral">{t.label}</Badge>
      <div style={{ display: "flex", gap: 2, opacity: hover ? 1 : 0, transition: "opacity 120ms", width: 64, justifyContent: "flex-end" }}>
        <button title="Editar" onClick={() => onEdit(field)} style={miniBtn}><Icon name="edit" size={16} /></button>
        <button title="Eliminar" onClick={() => onDelete(field)} style={{ ...miniBtn, color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>
      </div>
    </div>
  );
}

// ── Records table (records tab) ──────────────────────────────────────────────
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

function RecordsTable({ module, onEdit, onDelete }: { module: ModuleDef; onEdit: (r: AttrRecord) => void; onDelete: (r: AttrRecord) => void }) {
  const cols = module.fields.slice(0, 6);
  if (module.records.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-tertiary)" }}>
        <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Icon name="database" size={26} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)" }}>Aún no hay registros</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Añade tu primer registro en {module.name}.</div>
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: cols.length * 150 + 120 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, minmax(130px, 1fr)) 84px`, gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", position: "sticky", top: 0 }}>
          {cols.map((c) => <div key={c.id} style={colHead}>{c.label}</div>)}
          <div style={colHead}></div>
        </div>
        {module.records.map((rec) => (
          <RecordRow key={rec.id} rec={rec} cols={cols} onEdit={() => onEdit(rec)} onDelete={() => onDelete(rec)} />
        ))}
      </div>
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────
export function AttributesView() {
  const { modules, setModules } = useAttributesStore();
  const toast = useToast();
  const params = useSearchParams();
  const focusModuleId = params.get("module") || undefined;

  const [selectedId, setSelectedId] = useState(focusModuleId || modules[0].id);
  const [tab, setTab] = useState<"fields" | "records">("fields");
  const [modal, setModal] = useState<ModalState>(null);
  const [prevFocus, setPrevFocus] = useState(focusModuleId);

  // Sync the ?module= deep-link into local selection during render (not an
  // effect) — React re-renders immediately with the new selection.
  if (focusModuleId && focusModuleId !== prevFocus) {
    setPrevFocus(focusModuleId);
    setSelectedId(focusModuleId);
    setTab("fields");
  }

  const mod = modules.find((m) => m.id === selectedId) || modules[0];
  const tint = colorTint[mod.color] || colorTint.primary;

  // ── module CRUD ──
  const saveModule = (data: Partial<ModuleDef> & { id?: string; name: string }) => {
    if (data.id) { setModules((p) => p.map((m) => (m.id === data.id ? { ...m, ...data } : m))); toast("Módulo actualizado"); }
    else {
      const id = "mod_" + Date.now();
      setModules((p) => [...p, { ...(data as ModuleDef), id, system: false, fields: [], records: [] }]);
      setSelectedId(id); setTab("fields"); toast("Módulo creado — añade algunos campos");
    }
    setModal(null);
  };
  const deleteModule = (m: ModuleDef) => {
    setModules((p) => p.filter((x) => x.id !== m.id));
    setSelectedId(modules[0].id); setModal(null); toast("Módulo eliminado");
  };

  // ── field CRUD ──
  const saveField = (data: FieldDef) => {
    setModules((p) => p.map((m) => {
      if (m.id !== selectedId) return m;
      if (data.id) return { ...m, fields: m.fields.map((f) => (f.id === data.id ? { ...f, ...data } : f)) };
      return { ...m, fields: [...m.fields, { ...data, id: "fld_" + Date.now() }] };
    }));
    toast(data.id ? "Campo actualizado" : "Campo añadido"); setModal(null);
  };
  const deleteField = (f: FieldDef) => {
    setModules((p) => p.map((m) => (m.id === selectedId ? { ...m, fields: m.fields.filter((x) => x.id !== f.id) } : m)));
    setModal(null); toast("Campo eliminado");
  };

  // ── record CRUD ──
  const saveRecord = (data: Record<string, AttrValue> & { id?: string }) => {
    setModules((p) => p.map((m) => {
      if (m.id !== selectedId) return m;
      if (data.id) return { ...m, records: m.records.map((r) => (r.id === data.id ? { ...r, ...data } as AttrRecord : r)) };
      return { ...m, records: [{ ...data, id: "rec_" + Date.now() } as AttrRecord, ...m.records] };
    }));
    toast(data.id ? "Registro guardado" : "Registro añadido"); setModal(null);
  };
  const deleteRecord = (r: AttrRecord) => {
    setModules((p) => p.map((m) => (m.id === selectedId ? { ...m, records: m.records.filter((x) => x.id !== r.id) } : m)));
    setModal(null); toast("Registro eliminado");
  };

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", height: "100%" }}>
      <ModuleRail modules={modules} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setTab("fields"); }} onNew={() => setModal({ type: "module" })} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--color-background)" }}>
        {/* Module header */}
        <div style={{ padding: "20px 24px 0", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", flex: "none" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span style={{ width: 48, height: 48, borderRadius: 13, background: tint.bg, color: tint.fg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon name={mod.icon} size={24} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0, fontSize: 20 }}>{mod.name}</h1>
                {mod.system ? <Badge variant="neutral">Sistema</Badge> : <Badge variant="primary">Personalizado</Badge>}
              </div>
              <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", margin: "4px 0 0", maxWidth: 620, lineHeight: 1.5 }}>{mod.description || "Sin descripción todavía."}</p>
            </div>
            {!mod.system && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => setModal({ type: "module", data: mod })}><Icon name="edit" size={16} /> Editar</button>
                <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" style={{ color: "var(--color-error)" }}
                  onClick={() => setModal({ type: "confirm", title: "¿Eliminar módulo?", message: `«${mod.name}», sus ${mod.fields.length} campos y ${mod.records.length} registros se eliminarán permanentemente.`, onConfirm: () => deleteModule(mod) })}>
                  <Icon name="trash" size={16} /></button>
              </div>
            )}
          </div>
          {/* sub-tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
            {([["fields", "Campos", mod.fields.length], ["records", "Registros", mod.records.length]] as const).map(([id, label, count]) => (
              <button key={id} onClick={() => setTab(id)} style={{ position: "relative", padding: "10px 14px 14px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: tab === id ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
                {label} <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{count}</span>
                {tab === id && <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "var(--color-primary)", borderRadius: 2 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 24px", gap: 10, borderBottom: "1px solid var(--color-border)", flex: "none" }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {tab === "fields" ? `${mod.fields.length} campo${mod.fields.length !== 1 ? "s" : ""} personalizado${mod.fields.length !== 1 ? "s" : ""}` : `${mod.records.length} registro${mod.records.length !== 1 ? "s" : ""}`}
          </span>
          <div style={{ marginLeft: "auto" }}>
            {tab === "fields"
              ? <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setModal({ type: "field" })}><Icon name="plus" size={16} /> Añadir campo</button>
              : <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={mod.fields.length === 0} onClick={() => setModal({ type: "record" })}><Icon name="plus" size={16} /> Añadir registro</button>}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", background: "var(--color-surface)" }}>
          {tab === "fields" ? (
            mod.fields.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-tertiary)" }}>
                <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon name="layers" size={26} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)" }}>Aún no hay campos</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Añade un campo para definir los datos de este módulo.</div>
              </div>
            ) : mod.fields.map((f) => (
              <FieldRow key={f.id} field={f} onEdit={(f) => setModal({ type: "field", data: f })}
                onDelete={(f) => setModal({ type: "confirm", title: "¿Eliminar campo?", message: `«${f.label}» se eliminará de los ${mod.records.length} registros.`, onConfirm: () => deleteField(f) })} />
            ))
          ) : (
            <RecordsTable module={mod} onEdit={(r) => setModal({ type: "record", data: r })}
              onDelete={(r) => setModal({ type: "confirm", title: "¿Eliminar registro?", message: "Este registro se eliminará permanentemente.", onConfirm: () => deleteRecord(r) })} />
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "field" && <FieldFormModal initial={modal.data} onClose={() => setModal(null)} onSave={saveField} />}
      {modal?.type === "module" && <ModuleFormModal initial={modal.data} onClose={() => setModal(null)} onSave={saveModule} />}
      {modal?.type === "record" && <RecordFormModal module={mod} initial={modal.data} onClose={() => setModal(null)} onSave={saveRecord} />}
      {modal?.type === "confirm" && <ConfirmModal title={modal.title} message={modal.message} onClose={() => setModal(null)} onConfirm={modal.onConfirm} />}
    </div>
  );
}
