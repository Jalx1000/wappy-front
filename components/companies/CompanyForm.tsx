"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { companiesApi, type Company, type CompanyInput } from "@/lib/api/companies";
import { ApiError } from "@/lib/api/client";

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-ui)",
};

const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 };

export function CompanyForm({
  company,
  onClose,
  onSaved,
}: {
  company?: Company;
  onClose: () => void;
  onSaved: (saved: Company) => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const [name, setName] = useState(company?.name ?? "");
  const [domain, setDomain] = useState(company?.domain ?? "");
  const [industry, setIndustry] = useState(company?.industry ?? "");
  const [location, setLocation] = useState(company?.location ?? "");
  const [plan, setPlan] = useState(company?.plan ?? "");
  const [seats, setSeats] = useState(company?.seats != null ? String(company.seats) : "");
  const [notes, setNotes] = useState(company?.notes ?? "");

  const save = async () => {
    if (!name.trim()) {
      setServerErr("El nombre es obligatorio");
      return;
    }
    setServerErr(null);
    setSaving(true);
    const dto: CompanyInput = {
      name: name.trim(),
      domain: domain.trim() || null,
      industry: industry.trim() || null,
      location: location.trim() || null,
      plan: plan.trim() || null,
      seats: seats.trim() ? Number(seats) : null,
      notes: notes.trim() || null,
    };
    try {
      const saved = company
        ? await companiesApi.update(company.id, dto)
        : await companiesApi.create(dto);
      toast(company ? "Empresa actualizada" : "Empresa creada");
      onSaved(saved);
    } catch (e) {
      setServerErr(e instanceof ApiError ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4"
        style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="w-[560px] max-w-full"
          style={{ background: "var(--color-surface)", borderRadius: 16, boxShadow: "var(--shadow-3)", padding: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
              {company ? "Editar empresa" : "Nueva empresa"}
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
              style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
              <Icon name="x" size={15} />
            </button>
          </div>

          {serverErr && (
            <div className="mb-4 px-3 py-2 rounded-[10px] text-[13px]" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>{serverErr}</div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label style={label}>Nombre *</label>
              <input className="fobo-input" placeholder="Acme Corp" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label style={label}>Dominio</label><input className="fobo-input" placeholder="acme.com" value={domain} onChange={(e) => setDomain(e.target.value)} /></div>
              <div><label style={label}>Industria</label><input className="fobo-input" placeholder="Retail" value={industry} onChange={(e) => setIndustry(e.target.value)} /></div>
              <div><label style={label}>Ubicación</label><input className="fobo-input" placeholder="Madrid, ES" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
              <div>
                <label style={label}>Plan</label>
                <select className="fobo-input" value={plan} onChange={(e) => setPlan(e.target.value)}>
                  <option value="">—</option>
                  {["Free", "Pro", "Business", "Enterprise"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label style={label}>Asientos</label><input type="number" min="0" className="fobo-input" placeholder="0" value={seats} onChange={(e) => setSeats(e.target.value)} /></div>
            </div>
            <div>
              <label style={label}>Notas</label>
              <textarea className="fobo-input min-h-[76px] resize-y" style={{ paddingTop: 10 }} placeholder="Notas internas…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose} style={{ ...inputStyle, background: "transparent" }}>Cancelar</button>
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={save} disabled={saving}>
                <Icon name="check2" size={16} /> {saving ? "Guardando…" : company ? "Guardar" : "Crear empresa"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
