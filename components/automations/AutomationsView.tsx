"use client";

import { useState, type CSSProperties } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { useAutomationsStore } from "@/store/automations";
import { TRIGGERS, ACTIONS, type Rule } from "./data";

const fl: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };
const card: CSSProperties = { background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)" };
const miniBtn: CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };

type RuleDraft = { id?: string; name: string; trigger: string; action: string; actionValue: string; active: boolean };
type ModalState = { type: "new" } | { type: "edit"; rule: Rule } | { type: "del"; rule: Rule } | null;

function RuleModal({ initial, onClose, onSave }: { initial?: Rule; onClose: () => void; onSave: (r: RuleDraft) => void }) {
  const [r, setR] = useState<RuleDraft>(initial || { name: "", trigger: TRIGGERS[0], action: ACTIONS[0], actionValue: "", active: true });
  const can = !!r.name.trim();
  return (
    <Modal onClose={onClose} width={500}>
      <ModalHeader title={initial ? "Editar automatización" : "Nueva automatización"} subtitle="Cuando pasa algo, haz algo automáticamente" onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ marginBottom: 14 }}>
          <label style={fl}>Nombre de la regla</label>
          <input className="fobo-input" autoFocus value={r.name} placeholder="p. ej. Enrutar VIP a prioridad" onChange={(e) => setR({ ...r, name: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span style={{ width: 60, fontSize: 12, fontWeight: 700, color: "var(--color-primary-ink)", textTransform: "uppercase" }}>Cuando</span>
            <select className="fobo-input" value={r.trigger} onChange={(e) => setR({ ...r, trigger: e.target.value })}>{TRIGGERS.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="flex items-center gap-2.5">
            <span style={{ width: 60, fontSize: 12, fontWeight: 700, color: "var(--color-success)", textTransform: "uppercase" }}>Entonces</span>
            <select className="fobo-input" value={r.action} onChange={(e) => setR({ ...r, action: e.target.value })}>{ACTIONS.map((a) => <option key={a}>{a}</option>)}</select>
          </div>
          <input className="fobo-input" value={r.actionValue} placeholder="Valor (equipo, etiqueta, mensaje…)" onChange={(e) => setR({ ...r, actionValue: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onSave(r)}><Icon name="check2" size={16} /> {initial ? "Guardar" : "Crear"}</button>
      </div>
    </Modal>
  );
}

export function AutomationsView() {
  const { rules, setRules } = useAutomationsStore();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(null);

  const toggle = (id: string) => setRules((p) => p.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  const save = (r: RuleDraft) => {
    if (r.id) setRules((p) => p.map((x) => (x.id === r.id ? { ...x, ...r } as Rule : x)));
    else setRules((p) => [...p, { ...r, id: "rule_" + Date.now(), runs: 0 }]);
    setModal(null); toast(r.id ? "Automatización guardada" : "Automatización creada");
  };
  const del = (r: Rule) => { setRules((p) => p.filter((x) => x.id !== r.id)); setModal(null); toast("Automatización eliminada"); };

  return (
    <div className="flex flex-col" style={{ flex: 1, minWidth: 0, background: "var(--color-background)", height: "100%" }}>
      <div className="flex items-center gap-3 flex-none" style={{ padding: "18px 28px 16px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Automatizaciones</h1>
        <Badge variant="neutral">{rules.filter((r) => r.active).length} activas</Badge>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" style={{ marginLeft: "auto" }} onClick={() => setModal({ type: "new" })}><Icon name="plus" size={16} /> Nueva regla</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {rules.map((r) => (
          <div key={r.id} style={{ ...card, maxWidth: 760, marginBottom: 12, opacity: r.active ? 1 : 0.6 }}>
            <div className="flex items-center gap-3" style={{ padding: "14px 18px" }}>
              <span className="flex items-center justify-center flex-none" style={{ width: 38, height: 38, borderRadius: 10, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}><Icon name="zap" size={19} /></span>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{r.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
                  <b style={{ color: "var(--color-text-primary)" }}>Cuando</b> {r.trigger} · <b style={{ color: "var(--color-text-primary)" }}>entonces</b> {r.action}{r.actionValue ? ` «${r.actionValue}»` : ""}
                </div>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--color-text-tertiary)" }}>{r.runs} ejec.</span>
              <button title="Editar" onClick={() => setModal({ type: "edit", rule: r })} style={miniBtn}><Icon name="edit" size={16} /></button>
              <button title="Eliminar" onClick={() => setModal({ type: "del", rule: r })} style={{ ...miniBtn, color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>
              <Toggle checked={r.active} onChange={() => toggle(r.id)} aria-label={`Activar ${r.name}`} />
            </div>
          </div>
        ))}
        {rules.length === 0 && <div className="text-center" style={{ padding: "60px 0", color: "var(--color-text-tertiary)" }}>Aún no hay automatizaciones.</div>}
      </div>
      {modal && (modal.type === "new" || modal.type === "edit") && <RuleModal initial={modal.type === "edit" ? modal.rule : undefined} onClose={() => setModal(null)} onSave={save} />}
      {modal?.type === "del" && <ConfirmModal title="¿Eliminar automatización?" message={`«${modal.rule.name}» dejará de ejecutarse.`} onClose={() => setModal(null)} onConfirm={() => del(modal.rule)} />}
    </div>
  );
}
