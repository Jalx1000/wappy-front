"use client";

import { useState } from "react";
import { useBrands, useReassignConnectionBrand } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  connectionId: number | null;
  currentBrandId: string | null;
  channelLabel: string;
  accountHandle: string;
  onClose: () => void;
}

export function ChangeBrandModal({
  open,
  connectionId,
  currentBrandId,
  channelLabel,
  accountHandle,
  onClose,
}: Props) {
  const { data: brands = [] } = useBrands();
  const reassign = useReassignConnectionBrand();
  const toast = useToast();
  const [newBrandId, setNewBrandId] = useState<string>("");

  if (!open || connectionId == null) return null;

  const onConfirm = async () => {
    if (!newBrandId) {
      toast("Elegí una marca", "error");
      return;
    }
    try {
      await reassign.mutateAsync({
        id: connectionId,
        brandId: Number(newBrandId),
      });
      toast(`Movida a ${brands.find((b) => String(b.id) === newBrandId)?.name ?? "marca"}`);
      onClose();
    } catch (err) {
      toast(
        `Error: ${(err as { message?: string })?.message ?? "no se pudo mover"}`,
        "error",
      );
    }
  };

  const currentBrandName =
    brands.find((b) => b.id === currentBrandId)?.name ?? "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="fobo-card p-5 w-full max-w-[440px]"
        style={{ background: "var(--color-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-[16px] font-semibold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Cambiar marca · {channelLabel}
        </h3>
        <div
          className="text-[12.5px] mb-4 truncate"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {accountHandle}
        </div>

        <div className="mb-4">
          <div
            className="text-[11px] font-bold uppercase mb-1"
            style={{
              letterSpacing: "0.05em",
              color: "var(--color-text-tertiary)",
            }}
          >
            Marca actual
          </div>
          <div
            className="text-[14px]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {currentBrandName}
          </div>
        </div>

        <label className="block">
          <span
            className="text-[11px] font-bold uppercase block mb-1"
            style={{
              letterSpacing: "0.05em",
              color: "var(--color-text-tertiary)",
            }}
          >
            Mover a
          </span>
          <select
            value={newBrandId}
            onChange={(e) => setNewBrandId(e.target.value)}
            className="fobo-btn fobo-btn-secondary fobo-btn-sm w-full"
          >
            <option value="">Seleccionar marca…</option>
            {brands
              .filter((b) => b.id !== currentBrandId)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
        </label>

        <div
          className="mt-4 rounded-lg p-3 text-[12.5px]"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "var(--color-text-primary)",
          }}
        >
          Esto mueve también todos los reportes históricos asociados.
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="fobo-btn fobo-btn-secondary fobo-btn-sm"
            disabled={reassign.isPending}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="fobo-btn fobo-btn-primary fobo-btn-sm"
            disabled={reassign.isPending}
          >
            {reassign.isPending ? "Moviendo…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
