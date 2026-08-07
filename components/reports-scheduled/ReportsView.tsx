"use client";

import { useState, type CSSProperties } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { useReportsStore, type ScheduledReport } from "@/store/reports";

const fl: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };
const card: CSSProperties = { background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)" };
const rowS: CSSProperties = { display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--color-border)" };
const miniBtn: CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };

const METRICS = ["Volumen de conversaciones", "Tiempos de respuesta", "Resumen CSAT", "Rendimiento de agentes", "Vista general"];
const FREQS = ["Diario · 9:00", "Semanal · Lun 9:00", "Mensual · día 1 9:00"];

type Draft = { id?: string; name: string; metric: string; frequency: string; recipients: string; active: boolean };
type ModalState = { type: "new" } | { type: "edit"; report: ScheduledReport } | { type: "del"; report: ScheduledReport } | null;

function ReportModal({ initial, onClose, onSave }: { initial?: ScheduledReport; onClose: () => void; onSave: (r: Draft) => void }) {
  const [r, setR] = useState<Draft>(initial || { name: "", metric: METRICS[4], frequency: FREQS[1], recipients: "tu@wappy.dev", active: true });
  const can = !!r.name.trim() && !!r.recipients.trim();
  return (
    <Modal onClose={onClose} width={480}>
      <ModalHeader title={initial ? "Editar reporte" : "Programar un reporte"} subtitle="Recibe analytics en tu bandeja" onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ marginBottom: 14 }}><label style={fl}>Nombre del reporte</label><input className="fobo-input" autoFocus value={r.name} placeholder="p. ej. Resumen semanal" onChange={(e) => setR({ ...r, name: e.target.value })} /></div>
        <div style={{ marginBottom: 14 }}><label style={fl}>Métrica</label><select className="fobo-input" value={r.metric} onChange={(e) => setR({ ...r, metric: e.target.value })}>{METRICS.map((m) => <option key={m}>{m}</option>)}</select></div>
        <div style={{ marginBottom: 14 }}><label style={fl}>Frecuencia</label><select className="fobo-input" value={r.frequency} onChange={(e) => setR({ ...r, frequency: e.target.value })}>{FREQS.map((f) => <option key={f}>{f}</option>)}</select></div>
        <div><label style={fl}>Enviar a</label><input className="fobo-input" value={r.recipients} placeholder="correos separados por comas" onChange={(e) => setR({ ...r, recipients: e.target.value })} /></div>
      </div>
      <div className="flex justify-end gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onSave(r)}><Icon name="check2" size={16} /> {initial ? "Guardar" : "Programar"}</button>
      </div>
    </Modal>
  );
}

export function ReportsView() {
  const { reports, setReports } = useReportsStore();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(null);

  const toggle = (id: string) => setReports((p) => p.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  const save = (r: Draft) => {
    if (r.id) setReports((p) => p.map((x) => (x.id === r.id ? { ...x, ...r } as ScheduledReport : x)));
    else setReports((p) => [...p, { ...r, id: "rep_" + Date.now() }]);
    setModal(null); toast(r.id ? "Reporte actualizado" : "Reporte programado");
  };
  const del = (r: ScheduledReport) => { setReports((p) => p.filter((x) => x.id !== r.id)); setModal(null); toast("Reporte eliminado"); };

  return (
    <div className="flex flex-col" style={{ flex: 1, minWidth: 0, background: "var(--color-background)", height: "100%" }}>
      <div className="flex items-center gap-3 flex-none" style={{ padding: "18px 28px 16px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Reportes programados</h1>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" style={{ marginLeft: "auto" }} onClick={() => setModal({ type: "new" })}><Icon name="plus" size={16} /> Programar reporte</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        <div style={{ ...card, maxWidth: 760 }}>
          {reports.map((r, i) => (
            <div key={r.id} style={{ ...rowS, borderBottom: i < reports.length - 1 ? (rowS.borderBottom as string) : "none" }}>
              <span className="flex items-center justify-center flex-none" style={{ width: 38, height: 38, borderRadius: 10, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}><Icon name="chart" size={18} /></span>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{r.name}</div>
                <div className="flex items-center gap-1.5" style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
                  <Icon name="calendar" size={13} /> {r.frequency} · <Icon name="mail" size={13} /> {r.recipients}
                </div>
              </div>
              <button title="Editar" onClick={() => setModal({ type: "edit", report: r })} style={miniBtn}><Icon name="edit" size={16} /></button>
              <button title="Eliminar" onClick={() => setModal({ type: "del", report: r })} style={{ ...miniBtn, color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>
              <Toggle checked={r.active} onChange={() => toggle(r.id)} aria-label={`Activar ${r.name}`} />
            </div>
          ))}
          {reports.length === 0 && <div className="text-center" style={{ padding: "40px 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>Aún no hay reportes programados.</div>}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--color-text-tertiary)", maxWidth: 760, marginTop: 12 }}>Los reportes se envían por email automáticamente. Gestiona las preferencias en <b style={{ color: "var(--color-text-secondary)" }}>Ajustes → Notificaciones</b>.</div>
      </div>
      {modal && (modal.type === "new" || modal.type === "edit") && <ReportModal initial={modal.type === "edit" ? modal.report : undefined} onClose={() => setModal(null)} onSave={save} />}
      {modal?.type === "del" && <ConfirmModal title="¿Eliminar reporte?" message={`«${modal.report.name}» dejará de enviarse.`} onClose={() => setModal(null)} onConfirm={() => del(modal.report)} />}
    </div>
  );
}
