"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useCreateBrief, useUpdateBrief, useInfluencers } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import type { Brief, BriefStatus } from "@/lib/mocks/analyticsData";

const STATUSES: BriefStatus[] = ["borrador", "enviado", "firmado", "activo"];

interface BriefFormProps {
  brief?: Brief;
  onClose: () => void;
  onDelete?: () => void;
}

export function BriefForm({ brief, onClose, onDelete }: BriefFormProps) {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: influencers = [] } = useInfluencers(brandId);
  const create = useCreateBrief(brandId);
  const update = useUpdateBrief(brandId);
  const toast = useToast();

  const [influencerId, setInfluencerId] = useState(brief?.influencerId ?? "");
  const [title, setTitle] = useState(brief?.title ?? "");
  const [objective, setObjective] = useState(brief?.objective ?? "");
  const [deliverables, setDeliverables] = useState(brief?.deliverables ?? "");
  const [startDate, setStartDate] = useState(brief?.startDate ?? "");
  const [endDate, setEndDate] = useState(brief?.endDate ?? "");
  const [status, setStatus] = useState(brief?.status ?? "borrador");
  const [hashtags, setHashtags] = useState(brief?.hashtags?.join(", ") ?? "");
  const [mentions, setMentions] = useState(brief?.mentions?.join(", ") ?? "");
  const [dos, setDos] = useState(brief?.dos ?? "");
  const [donts, setDonts] = useState(brief?.donts ?? "");

  const handleSave = () => {
    if (!influencerId.trim() || !title.trim() || !objective.trim() || !deliverables.trim() || !startDate.trim() || !endDate.trim()) {
      toast("Completa todos los campos requeridos", "error");
      return;
    }

    const payload = {
      influencerId,
      title: title.trim(),
      objective: objective.trim(),
      deliverables: deliverables.trim(),
      startDate,
      endDate,
      status,
      hashtags: hashtags.split(",").map(h => h.trim()).filter(h => h),
      mentions: mentions.split(",").map(m => m.trim()).filter(m => m),
      dos: dos.trim(),
      donts: donts.trim(),
    };

    if (brief) {
      update.mutate({ id: brief.id, data: payload });
    } else {
      create.mutate({ id: `BR-${Date.now()}`, ...payload } as Brief);
    }
    onClose();
    toast(brief ? "Brief actualizado" : "Brief creado ✓");
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
              {brief ? "Editar brief" : "Nuevo brief"}
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
                  Estado
                </label>
                <select className="fobo-input" value={status} onChange={(e) => setStatus(e.target.value as BriefStatus)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Título *
              </label>
              <input className="fobo-input" placeholder="Título del brief" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Objetivo *
              </label>
              <textarea className="fobo-input" placeholder="Objetivo de la colaboración" rows={3} value={objective} onChange={(e) => setObjective(e.target.value)} />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Entregables *
              </label>
              <textarea className="fobo-input" placeholder="Qué se debe entregar" rows={3} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Fecha inicio *
                </label>
                <input type="date" className="fobo-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Fecha fin *
                </label>
                <input type="date" className="fobo-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Hashtags (separados por comas)
              </label>
              <input className="fobo-input" placeholder="#hashtag1, #hashtag2" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Menciones (separadas por comas)
              </label>
              <input className="fobo-input" placeholder="@mention1, @mention2" value={mentions} onChange={(e) => setMentions(e.target.value)} />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Debe hacer (Do's)
              </label>
              <textarea className="fobo-input" placeholder="Qué sí debe hacer" rows={2} value={dos} onChange={(e) => setDos(e.target.value)} />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                No debe hacer (Don'ts)
              </label>
              <textarea className="fobo-input" placeholder="Qué no debe hacer" rows={2} value={donts} onChange={(e) => setDonts(e.target.value)} />
            </div>

            <div className="flex gap-2 pt-2">
              {brief && onDelete && (
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
                {brief ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
