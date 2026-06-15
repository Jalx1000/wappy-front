"use client";

import { useState } from "react";
import {
  useBrands,
  useOrphans,
  useAssignOrphan,
  useDiscardOrphan,
} from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";

const CHANNEL_LABELS: Record<string, string> = {
  ga4: "Google Analytics 4",
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  facebook_page: "Facebook Page",
  instagram: "Instagram",
  tiktok_ads: "TikTok Ads",
  tiktok: "TikTok",
  linkedin_ads: "LinkedIn Ads",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export function OrphansList() {
  const { data: brands = [] } = useBrands();
  const { data: orphans = [], isPending } = useOrphans();
  const assignMut = useAssignOrphan();
  const discardMut = useDiscardOrphan();
  const toast = useToast();
  const [picks, setPicks] = useState<Record<number, number | "">>({});

  if (isPending) return <OrphansSkeleton />;

  if (orphans.length === 0) {
    return (
      <div className="p-7 max-w-[860px]">
        <h1
          style={{
            fontFamily: "var(--ff-display)",
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: "var(--color-text-primary)",
          }}
        >
          Cuentas sin asignar
        </h1>
        <div
          className="rounded-xl p-6 text-center mt-4"
          style={{
            border: "1px dashed var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <div
            className="text-[14px] font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            No hay cuentas sin asignar.
          </div>
          <div
            className="text-[12.5px] mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Cuando conectes un proveedor y dejes alguna cuenta sin asignar,
            aparecerá acá.
          </div>
        </div>
      </div>
    );
  }

  const onAssign = async (orphanId: number) => {
    const brandId = picks[orphanId];
    if (brandId === undefined || brandId === "" || brandId === 0) {
      toast("Elegí una marca antes de asignar", "error");
      return;
    }
    try {
      await assignMut.mutateAsync({ orphanId, brandId: Number(brandId) });
      toast("Cuenta asignada");
    } catch (err) {
      toast(
        `Error: ${(err as { message?: string })?.message ?? "no se pudo asignar"}`,
        "error",
      );
    }
  };

  const onDiscard = async (orphanId: number) => {
    if (!confirm("¿Descartar esta cuenta? Tendrías que volver a hacer OAuth para recuperarla.")) return;
    try {
      await discardMut.mutateAsync(orphanId);
      toast("Cuenta descartada");
    } catch (err) {
      toast(
        `Error: ${(err as { message?: string })?.message ?? "no se pudo descartar"}`,
        "error",
      );
    }
  };

  return (
    <div className="p-7 overflow-y-auto h-full max-w-[860px]">
      <h1
        style={{
          fontFamily: "var(--ff-display)",
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "-0.02em",
          color: "var(--color-text-primary)",
        }}
      >
        Cuentas sin asignar ({orphans.length})
      </h1>
      <p
        className="text-[14px] mt-1 mb-5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Cuentas detectadas por OAuth que aún no se asignaron a ninguna marca.
        Cualquier admin del equipo puede asignarlas.
      </p>

      <div className="flex flex-col gap-3">
        {orphans.map((o) => (
          <div key={o.id} className="fobo-card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div
                className="text-[14px] font-semibold truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {o.accountHandle}
              </div>
              <div
                className="text-[12px] truncate"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {CHANNEL_LABELS[o.channel] ?? o.channel} · {o.accountId}
              </div>
              <div
                className="text-[11.5px] mt-1"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Detectada {new Date(o.discoveredAt).toLocaleString("es-BO")}
              </div>
            </div>
            <select
              value={picks[o.id] ?? ""}
              onChange={(e) =>
                setPicks((prev) => ({
                  ...prev,
                  [o.id]: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              className="fobo-btn fobo-btn-secondary fobo-btn-sm"
              style={{ minWidth: 200 }}
            >
              <option value="">Asignar a marca...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => onAssign(o.id)}
              disabled={assignMut.isPending}
              className="fobo-btn fobo-btn-primary fobo-btn-sm"
            >
              Asignar
            </button>
            <button
              onClick={() => onDiscard(o.id)}
              disabled={discardMut.isPending}
              title="Descartar"
              className="fobo-btn fobo-btn-secondary fobo-btn-sm px-3"
              style={{ color: "var(--color-error)" }}
            >
              <Icon name="trash" size={15} color="var(--color-error)" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrphansSkeleton() {
  return (
    <div className="p-7 max-w-[860px] flex flex-col gap-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton.Card key={i} lines={2} />
      ))}
    </div>
  );
}
