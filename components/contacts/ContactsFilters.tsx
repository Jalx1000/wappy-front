"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { useTagsStore } from "@/store/tags";
import { useSavedSegmentsStore } from "@/store/savedSegments";
import { channelLabel } from "@/lib/channels";
import { uid } from "@/lib/id";
import { contactChannels, FILTER_FIELDS, OP_LABEL, type FilterField, type FilterOp, type FilterRule } from "./segments";
import type { ContactWithIdentities } from "@/lib/api/contacts";

const chip: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 6px 0 10px", borderRadius: 8, fontSize: 12.5, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" };
const sel: CSSProperties = { height: 34, borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: 13, padding: "0 8px" };

export function ContactsFilters({ contacts, rules, onChange }: {
  contacts: ContactWithIdentities[];
  rules: FilterRule[];
  onChange: (rules: FilterRule[]) => void;
}) {
  const tags = useTagsStore((s) => s.tags);
  const saveSegment = useSavedSegmentsStore((s) => s.add);
  const [adding, setAdding] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [segName, setSegName] = useState("");
  const channels = [...new Set(contacts.flatMap(contactChannels))];

  // Draft rule while composing.
  const [draft, setDraft] = useState<FilterRule>({ id: "", field: "name", op: "contains", value: "" });
  const fieldDef = FILTER_FIELDS.find((f) => f.id === draft.field)!;

  const startAdd = () => { setDraft({ id: uid("r_"), field: "name", op: "contains", value: "" }); setAdding(true); };
  const commit = () => {
    if (!draft.value.trim()) return;
    onChange([...rules, draft]);
    setAdding(false);
  };
  const removeRule = (id: string) => onChange(rules.filter((r) => r.id !== id));

  const labelForRule = (r: FilterRule): string => {
    const fd = FILTER_FIELDS.find((f) => f.id === r.field);
    let v = r.value;
    if (r.field === "tag") v = tags.find((t) => t.id === r.value)?.name ?? r.value;
    else if (r.field === "channel") v = channelLabel(r.value);
    return `${fd?.label} ${OP_LABEL[r.op]} ${v}`;
  };

  const onFieldChange = (field: FilterField) => {
    const fd = FILTER_FIELDS.find((f) => f.id === field)!;
    setDraft((d) => ({ ...d, field, op: fd.ops[0], value: "" }));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap flex-none" style={{ padding: "10px 20px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <Icon name="filter" size={15} style={{ color: "var(--color-text-tertiary)" }} />
      {rules.map((r) => (
        <span key={r.id} style={chip}>
          {labelForRule(r)}
          <button onClick={() => removeRule(r.id)} aria-label="Quitar filtro" style={{ border: "none", background: "transparent", color: "var(--color-primary-ink)", cursor: "pointer", display: "inline-flex", padding: 2 }}><Icon name="x" size={13} /></button>
        </span>
      ))}

      {/* Add filter */}
      <div className="relative">
        <button onClick={startAdd} className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1" style={{ height: 30 }}>
          <Icon name="plus" size={14} /> Añadir filtro
        </button>
        {adding && (
          <>
            <div className="fixed inset-0 z-[40]" onClick={() => setAdding(false)} />
            <div className="absolute z-[41] flex flex-col gap-2" style={{ top: "calc(100% + 6px)", left: 0, width: 260, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 12 }}>
              <select value={draft.field} onChange={(e) => onFieldChange(e.target.value as FilterField)} style={sel}>
                {FILTER_FIELDS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              {fieldDef.ops.length > 1 && (
                <select value={draft.op} onChange={(e) => setDraft((d) => ({ ...d, op: e.target.value as FilterOp }))} style={sel}>
                  {fieldDef.ops.map((op) => <option key={op} value={op}>{OP_LABEL[op]}</option>)}
                </select>
              )}
              {fieldDef.kind === "text" && (
                <input autoFocus aria-label="Valor del filtro" value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} placeholder="Escribe un valor…" style={{ ...sel, height: 36 }} onKeyDown={(e) => { if (e.key === "Enter") commit(); }} />
              )}
              {fieldDef.kind === "days" && (
                <input autoFocus aria-label="Número de días" type="number" min={1} value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} placeholder="Nº de días" style={{ ...sel, height: 36 }} onKeyDown={(e) => { if (e.key === "Enter") commit(); }} />
              )}
              {fieldDef.kind === "channel" && (
                <select value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} style={sel}>
                  <option value="">Selecciona canal…</option>
                  {channels.map((ch) => <option key={ch} value={ch}>{channelLabel(ch)}</option>)}
                </select>
              )}
              {fieldDef.kind === "tag" && (
                <select value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} style={sel}>
                  <option value="">Selecciona etiqueta…</option>
                  {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => setAdding(false)} className="fobo-btn fobo-btn-secondary fobo-btn-sm">Cancelar</button>
                <button onClick={commit} disabled={!draft.value.trim()} className="fobo-btn fobo-btn-primary fobo-btn-sm" style={{ opacity: draft.value.trim() ? 1 : 0.5 }}>Añadir</button>
              </div>
            </div>
          </>
        )}
      </div>

      {rules.length > 0 && (
        <>
          <button onClick={() => onChange([])} className="text-[12.5px] cursor-pointer" style={{ border: "none", background: "transparent", color: "var(--color-text-tertiary)" }}>Limpiar</button>
          <div className="relative ml-auto">
            <button onClick={() => { setSaveOpen((v) => !v); setSegName(""); }} className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1" style={{ height: 30 }}>
              <Icon name="star" size={14} /> Guardar segmento
            </button>
            {saveOpen && (
              <>
                <div className="fixed inset-0 z-[40]" onClick={() => setSaveOpen(false)} />
                <div className="absolute z-[41] flex flex-col gap-2" style={{ top: "calc(100% + 6px)", right: 0, width: 240, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 12 }}>
                  <div className="text-[12px] font-medium" style={{ color: "var(--color-text-secondary)" }}>Nombre del segmento</div>
                  <input autoFocus aria-label="Nombre del segmento" value={segName} onChange={(e) => setSegName(e.target.value)} placeholder="p. ej. VIP inactivos" style={{ ...sel, height: 36 }}
                    onKeyDown={(e) => { if (e.key === "Enter" && segName.trim()) { saveSegment(segName.trim(), rules); setSaveOpen(false); } }} />
                  <button onClick={() => { if (segName.trim()) { saveSegment(segName.trim(), rules); setSaveOpen(false); } }} disabled={!segName.trim()}
                    className="fobo-btn fobo-btn-primary fobo-btn-sm" style={{ opacity: segName.trim() ? 1 : 0.5 }}>Guardar</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
