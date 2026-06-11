"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { useToast } from "@/components/ui/Toast";
import { useCreateInflencer, useUpdateInfluencer } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import type { InfluencerItem, InfluencerTier, InfluencerStatus } from "@/lib/mocks/analyticsData";

const CHANNELS = ["instagram", "tiktok", "youtube", "facebook", "linkedin"];
const TIERS = ["Nano", "Micro", "Macro", "Mega"];
const STATUSES = ["active", "negotiation", "prospect"];

interface InfluencerFormProps {
  influencer?: InfluencerItem;
  onClose: () => void;
  onDelete?: () => void;
}

export function InfluencerForm({ influencer, onClose, onDelete }: InfluencerFormProps) {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const create = useCreateInflencer(brandId);
  const update = useUpdateInfluencer(brandId);
  const toast = useToast();

  const [name, setName] = useState(influencer?.name ?? "");
  const [handle, setHandle] = useState(influencer?.handle ?? "");
  const [ch, setCh] = useState(influencer?.ch ?? "instagram");
  const [followers, setFollowers] = useState(influencer?.followers ?? "");
  const [eng, setEng] = useState(influencer?.eng ?? "");
  const [tier, setTier] = useState(influencer?.tier ?? "Micro");
  const [status, setStatus] = useState(influencer?.status ?? "prospect");

  const handleSave = () => {
    if (!name.trim() || !handle.trim() || !followers.trim() || !eng.trim()) {
      toast("Completa todos los campos", "error");
      return;
    }

    const payload = { name: name.trim(), handle: handle.trim(), ch, followers, eng, tier, status, deals: influencer?.deals ?? 0 };

    if (influencer) {
      update.mutate({ id: influencer.id, data: payload });
    } else {
      create.mutate({ id: `i${Date.now()}`, ...payload });
    }
    onClose();
    toast(influencer ? "Influencer actualizado" : "Influencer creado ✓");
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center"
        style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="w-[500px] max-w-[94vw]"
          style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-3)", padding: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
              {influencer ? "Editar influencer" : "Nuevo influencer"}
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
              <Icon name="x" size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Nombre
              </label>
              <input className="fobo-input" placeholder="Nombre del influencer" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                @Handle
              </label>
              <input className="fobo-input" placeholder="@handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Red
                </label>
                <select className="fobo-input" value={ch} onChange={(e) => setCh(e.target.value)}>
                  {CHANNELS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Tier
                </label>
                <select className="fobo-input" value={tier} onChange={(e) => setTier(e.target.value as InfluencerTier)}>
                  {TIERS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Seguidores
                </label>
                <input className="fobo-input" placeholder="ej: 412K" value={followers} onChange={(e) => setFollowers(e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Engagement %
                </label>
                <input className="fobo-input" placeholder="ej: 6.8" value={eng} onChange={(e) => setEng(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Estado
              </label>
              <select className="fobo-input" value={status} onChange={(e) => setStatus(e.target.value as InfluencerStatus)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "active" ? "Activo" : s === "negotiation" ? "Negociando" : "Prospecto"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              {influencer && onDelete && (
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
                {influencer ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
