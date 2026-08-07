"use client";

import { useState, type CSSProperties } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import {
  FIELD_TYPES,
  FIELD_TYPE_ORDER,
  MODULE_ICONS,
  MODULE_COLORS,
  colorTint,
  slugify,
  type FieldDef,
  type FieldType,
  type ModuleColor,
  type ModuleDef,
  type AttrRecord,
  type AttrValue,
} from "./data";

const aLabel: CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 500,
  color: "var(--color-text-secondary)", marginBottom: 6,
};

// ── Reusable inputs ──────────────────────────────────────────────────────────
function StyledSelect({
  value, options, onChange, placeholder = "Selecciona…",
}: { value: string | undefined; options: string[]; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="fobo-input"
        style={{ appearance: "none", paddingRight: 36, cursor: "pointer", color: value ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-text-tertiary)" }}>
        <Icon name="chevronDown" size={16} />
      </span>
    </div>
  );
}

function MultiChips({ value, options, onChange }: { value: string[]; options: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            style={{ height: 32, padding: "0 12px", borderRadius: 9999, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500,
              background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", color: on ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
              border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>{o}</button>
        );
      })}
    </div>
  );
}

function NumberInput({
  value, onChange, prefix, suffix, step = 1,
}: { value: number | "" | null | undefined; onChange: (v: number | "") => void; prefix?: string | null; suffix?: string | null; step?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14 }}>
      {prefix && <span style={{ color: "var(--color-text-tertiary)", fontSize: 14, fontWeight: 500 }}>{prefix}</span>}
      <input type="number" step={step} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--color-text-primary)", width: "100%" }} />
      {suffix && <span style={{ color: "var(--color-text-tertiary)", fontSize: 14 }}>{suffix}</span>}
    </div>
  );
}

/** Renders the correct input for a given field definition. */
export function FieldInput({ field, value, onChange }: { field: FieldDef; value: AttrValue; onChange: (v: AttrValue) => void }) {
  if (field.type === "boolean")
    return <Toggle checked={!!value} onChange={(v) => onChange(v)} aria-label={field.label} />;
  if (field.type === "select")
    return <StyledSelect value={value as string | undefined} options={field.options || []} onChange={onChange} />;
  if (field.type === "multiselect")
    return <MultiChips value={Array.isArray(value) ? value : []} options={field.options || []} onChange={onChange} />;
  if (field.type === "date")
    return <input className="fobo-input" type="date" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} />;
  if (["number", "decimal", "currency", "percent"].includes(field.type))
    return <NumberInput value={value as number | "" | null | undefined} onChange={onChange} step={field.type === "number" ? 1 : 0.01}
      prefix={field.type === "currency" ? (field.symbol || "$") : null} suffix={field.type === "percent" ? "%" : null} />;
  return <input className="fobo-input" type={field.type === "email" ? "email" : "text"} value={(value as string) || ""}
    placeholder={FIELD_TYPES[field.type].hint} onChange={(e) => onChange(e.target.value)} />;
}

// ── Field builder ────────────────────────────────────────────────────────────
type FieldDraft = { id?: string; key?: string; label: string; type: FieldType; required: boolean; options: string[]; symbol: string };

export function FieldFormModal({ initial, onClose, onSave }: { initial?: FieldDef; onClose: () => void; onSave: (f: FieldDef) => void }) {
  const editing = !!initial;
  const [f, setF] = useState<FieldDraft>(
    initial
      ? { id: initial.id, key: initial.key, label: initial.label, type: initial.type, required: !!initial.required, options: initial.options ?? [], symbol: initial.symbol ?? "$" }
      : { label: "", type: "text", required: false, options: [], symbol: "$" }
  );
  const [optInput, setOptInput] = useState("");
  const set = <K extends keyof FieldDraft>(k: K, v: FieldDraft[K]) => setF((p) => ({ ...p, [k]: v }));
  const type = FIELD_TYPES[f.type];
  const canSave = !!f.label.trim() && (!type.hasOptions || f.options.length > 0);
  const addOpt = () => { const o = optInput.trim(); if (o && !f.options.includes(o)) set("options", [...f.options, o]); setOptInput(""); };

  const save = () => {
    const out: FieldDef = { id: f.id ?? "", key: f.key || slugify(f.label), label: f.label, type: f.type, required: f.required };
    if (type.hasOptions) out.options = f.options;
    if (f.type === "currency") out.symbol = f.symbol;
    onSave(out);
  };

  return (
    <Modal onClose={onClose} width={520}>
      <ModalHeader title={editing ? "Editar campo" : "Nuevo campo"} subtitle={editing ? f.label : "Añade un atributo personalizado"} onClose={onClose} />
      <div style={{ padding: "18px 22px", overflowY: "auto" }}>
        <div style={{ marginBottom: 16 }}>
          <label style={aLabel}>Nombre del campo *</label>
          <input className="fobo-input" value={f.label} placeholder="p. ej. Nivel de cuenta" autoFocus onChange={(e) => set("label", e.target.value)} />
          {f.label && <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 5 }}>Clave API: <code style={{ fontFamily: "var(--font-mono)" }}>{slugify(f.label)}</code></div>}
        </div>

        <label style={aLabel}>Tipo</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
          {FIELD_TYPE_ORDER.map((tid) => {
            const t = FIELD_TYPES[tid]; const on = f.type === tid;
            return (
              <button key={tid} type="button" onClick={() => set("type", tid)} title={t.hint}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 10px", borderRadius: 10, cursor: "pointer",
                  background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", textAlign: "left",
                  border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
                <span style={{ color: on ? "var(--color-primary-ink)" : "var(--color-text-secondary)", flex: "none" }}><Icon name={t.icon} size={17} /></span>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: on ? "var(--color-primary-ink)" : "var(--color-text-primary)" }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {f.type === "currency" && (
          <div style={{ marginBottom: 16 }}>
            <label style={aLabel}>Símbolo de moneda</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["$", "€", "£", "¥", "R$"].map((sym) => (
                <button key={sym} type="button" onClick={() => set("symbol", sym)}
                  style={{ minWidth: 44, height: 38, borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600,
                    background: f.symbol === sym ? "var(--color-primary-subtle)" : "var(--color-surface)", color: f.symbol === sym ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
                    border: f.symbol === sym ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>{sym}</button>
              ))}
            </div>
          </div>
        )}

        {type.hasOptions && (
          <div style={{ marginBottom: 16 }}>
            <label style={aLabel}>Opciones *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 8 }}>
              {f.options.map((o) => (
                <Badge key={o} variant="primary" className="gap-[5px]">{o}
                  <span onClick={() => set("options", f.options.filter((x) => x !== o))} style={{ cursor: "pointer", fontWeight: 700 }}>×</span></Badge>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="fobo-input" value={optInput} placeholder="Añadir una opción…" onChange={(e) => setOptInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOpt(); } }} />
              <button type="button" className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={addOpt}><Icon name="plus" size={16} /></button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--color-background)", borderRadius: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>Obligatorio</div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>No se puede guardar un registro sin este campo</div>
          </div>
          <Toggle checked={f.required} onChange={(v) => set("required", v)} aria-label="Obligatorio" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--color-border)", justifyContent: "flex-end" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!canSave} onClick={save}>
          <Icon name="check2" size={16} /> {editing ? "Guardar campo" : "Añadir campo"}
        </button>
      </div>
    </Modal>
  );
}

// ── Module builder ───────────────────────────────────────────────────────────
type ModuleDraft = Pick<ModuleDef, "name" | "icon" | "color" | "description"> & { id?: string };

export function ModuleFormModal({ initial, onClose, onSave }: { initial?: ModuleDef; onClose: () => void; onSave: (m: ModuleDraft) => void }) {
  const editing = !!initial;
  const [m, setM] = useState<ModuleDraft>(
    initial
      ? { id: initial.id, name: initial.name, icon: initial.icon, color: initial.color, description: initial.description }
      : { name: "", icon: "layers", color: "primary", description: "" }
  );
  const set = <K extends keyof ModuleDraft>(k: K, v: ModuleDraft[K]) => setM((p) => ({ ...p, [k]: v }));
  const canSave = m.name.trim().length > 0;
  const tint = colorTint[m.color];
  return (
    <Modal onClose={onClose} width={500}>
      <ModalHeader title={editing ? "Editar módulo" : "Nuevo módulo"} subtitle={editing ? m.name : "Define un objeto personalizado"} onClose={onClose} />
      <div style={{ padding: "18px 22px", overflowY: "auto" }}>
        <div style={{ marginBottom: 16 }}>
          <label style={aLabel}>Nombre del módulo *</label>
          <input className="fobo-input" value={m.name} placeholder="p. ej. Oportunidades, Vehículos, Tickets…" autoFocus onChange={(e) => set("name", e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={aLabel}>¿Qué contiene este módulo?</label>
          <textarea className="fobo-input" rows={2} value={m.description || ""} placeholder="Describe qué representa cada registro y para qué se usa…"
            style={{ height: "auto", paddingTop: 12, paddingBottom: 12, resize: "none", fontFamily: "var(--font-ui)" }}
            onChange={(e) => set("description", e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={aLabel}>Icono</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {MODULE_ICONS.map((ic) => {
              const on = m.icon === ic;
              return (
                <button key={ic} type="button" onClick={() => set("icon", ic)}
                  style={{ width: 42, height: 42, borderRadius: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    background: on ? tint.bg : "var(--color-surface)", color: on ? tint.fg : "var(--color-text-secondary)",
                    border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
                  <Icon name={ic} size={20} />
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label style={aLabel}>Color</label>
          <div style={{ display: "flex", gap: 10 }}>
            {MODULE_COLORS.map((c) => (
              <button key={c.id} type="button" onClick={() => set("color", c.id as ModuleColor)}
                style={{ width: 30, height: 30, borderRadius: 9999, cursor: "pointer", background: c.dot, border: "none",
                  boxShadow: m.color === c.id ? "0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-text-primary)" : "none" }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--color-border)", justifyContent: "flex-end" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!canSave} onClick={() => onSave(m)}>
          <Icon name="check2" size={16} /> {editing ? "Guardar módulo" : "Crear módulo"}
        </button>
      </div>
    </Modal>
  );
}

// ── Dynamic record form ──────────────────────────────────────────────────────
export function RecordFormModal({ module, initial, onClose, onSave }: { module: ModuleDef; initial?: AttrRecord; onClose: () => void; onSave: (r: Record<string, AttrValue> & { id?: string }) => void }) {
  const editing = !!initial;
  const [rec, setRec] = useState<Record<string, AttrValue> & { id?: string }>(initial || {});
  const set = (k: string, v: AttrValue) => setRec((p) => ({ ...p, [k]: v }));
  const missing = module.fields.filter((fl) => fl.required && (rec[fl.key] == null || rec[fl.key] === "" || (Array.isArray(rec[fl.key]) && (rec[fl.key] as string[]).length === 0)));
  const canSave = missing.length === 0;
  const singular = module.name.replace(/s$/, "");

  return (
    <Modal onClose={onClose} width={520}>
      <ModalHeader title={editing ? `Editar ${singular.toLowerCase()}` : `Nuevo ${singular.toLowerCase()}`} subtitle={`en ${module.name}`} onClose={onClose} />
      <div style={{ padding: "18px 22px", overflowY: "auto", maxHeight: "62vh" }}>
        {module.fields.map((fl) => (
          <div key={fl.id} style={{ marginBottom: 16, display: fl.type === "boolean" ? "flex" : "block", alignItems: "center", gap: 12 }}>
            <div style={{ flex: fl.type === "boolean" ? 1 : "none" }}>
              <label style={{ ...aLabel, marginBottom: fl.type === "boolean" ? 0 : 6 }}>
                {fl.label}{fl.required && <span style={{ color: "var(--color-error)" }}> *</span>}
              </label>
              {fl.type === "boolean" && <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{FIELD_TYPES[fl.type].hint}</div>}
            </div>
            <FieldInput field={fl} value={rec[fl.key]} onChange={(v) => set(fl.key, v)} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--color-border)", justifyContent: "flex-end" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!canSave} onClick={() => onSave(rec)}>
          <Icon name="check2" size={16} /> {editing ? "Guardar" : `Añadir ${singular.toLowerCase()}`}
        </button>
      </div>
    </Modal>
  );
}
