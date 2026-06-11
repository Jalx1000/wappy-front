"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useCreateContract, useUpdateContract, useInfluencers, useBriefs } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import type { Contract, ContractType, SignatureStatus } from "@/lib/mocks/analyticsData";

const TYPES: ContractType[] = ["Reel", "Reels", "Stories", "Post", "Campaña", "Video"];
const SIGNATURE_STATUSES: SignatureStatus[] = ["pendiente", "firmado", "vencido"];

interface ContractFormProps {
  contract?: Contract;
  onClose: () => void;
  onDelete?: () => void;
}

export function ContractForm({ contract, onClose, onDelete }: ContractFormProps) {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: influencers = [] } = useInfluencers(brandId);
  const { data: briefs = [] } = useBriefs(brandId);
  const create = useCreateContract(brandId);
  const update = useUpdateContract(brandId);
  const toast = useToast();

  const [influencerId, setInfluencerId] = useState(contract?.influencerId ?? "");
  const [briefId, setBriefId] = useState(contract?.briefId ?? "");
  const [type, setType] = useState(contract?.type ?? "Reel");
  const [amount, setAmount] = useState(contract?.amount?.toString() ?? "");
  const [conditions, setConditions] = useState(contract?.conditions ?? "");
  const [signatureStatus, setSignatureStatus] = useState(contract?.signatureStatus ?? "pendiente");
  const [expiresAt, setExpiresAt] = useState(contract?.expiresAt ?? "");

  const handleSave = () => {
    if (!influencerId.trim() || !type.trim() || !amount.trim() || !expiresAt.trim()) {
      toast("Completa todos los campos requeridos", "error");
      return;
    }

    const payload = {
      influencerId,
      briefId: briefId || undefined,
      type,
      amount: Number(amount),
      conditions: conditions.trim(),
      signatureStatus,
      expiresAt,
    };

    if (contract) {
      update.mutate({ id: contract.id, data: payload });
    } else {
      create.mutate({ id: `CT-${Date.now()}`, ...payload } as Contract);
    }
    onClose();
    toast(contract ? "Contrato actualizado" : "Contrato creado ✓");
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto"
        style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="w-[600px] max-w-[94vw] my-6"
          style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-3)", padding: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
              {contract ? "Editar contrato" : "Nuevo contrato"}
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
              <Icon name="x" size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Influencer *
                </label>
                <select className="fobo-input" value={influencerId} onChange={(e) => setInfluencerId(e.target.value)}>
                  <option value="">Selecciona un influencer</option>
                  {influencers.map((inf: any) => (
                    <option key={inf.id} value={inf.id}>{inf.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Brief (Opcional)
                </label>
                <select className="fobo-input" value={briefId} onChange={(e) => setBriefId(e.target.value)}>
                  <option value="">Sin brief asociado</option>
                  {briefs.map((brief: any) => (
                    <option key={brief.id} value={brief.id}>{brief.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Tipo de contenido *
                </label>
                <select className="fobo-input" value={type} onChange={(e) => setType(e.target.value as ContractType)}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Monto ($) *
                </label>
                <input className="fobo-input" placeholder="5000" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Condiciones
              </label>
              <textarea className="fobo-input" placeholder="Términos y condiciones del contrato" rows={3} value={conditions} onChange={(e) => setConditions(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Vence el *
                </label>
                <input type="date" className="fobo-input" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Estatus de firma
                </label>
                <select className="fobo-input" value={signatureStatus} onChange={(e) => setSignatureStatus(e.target.value as SignatureStatus)}>
                  {SIGNATURE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {contract && onDelete && (
                <button
                  className="fobo-btn fobo-btn-sm"
                  style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}
                  onClick={onDelete}
                >
                  <Icon name="trash" size={14} />
                </button>
              )}
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1" onClick={onClose}>
                Cancelar
              </button>
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1" onClick={handleSave}>
                {contract ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
