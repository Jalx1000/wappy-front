"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useBrands,
  useDiscovery,
  useAssignDiscovery,
} from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";

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

export function ConnectionAssignmentScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const discoveryId = Number(params.get("discoveryId"));
  const { data: brands = [] } = useBrands();
  const {
    data: discovery,
    isPending,
    isError,
    error,
  } = useDiscovery(Number.isFinite(discoveryId) ? discoveryId : null);
  const assignMut = useAssignDiscovery();

  // accountId → brandId (null = sin asignar)
  const [picks, setPicks] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (!discovery) return;
    setPicks((prev) => {
      const next = { ...prev };
      for (const a of discovery.accounts) {
        if (!(a.accountId in next)) {
          next[a.accountId] = discovery.triggeredBrandId ?? null;
        }
      }
      return next;
    });
  }, [discovery]);

  const counts = useMemo(() => {
    let toAssign = 0;
    let toOrphan = 0;
    for (const v of Object.values(picks)) {
      if (v == null) toOrphan++;
      else toAssign++;
    }
    return { toAssign, toOrphan };
  }, [picks]);

  if (!Number.isFinite(discoveryId)) {
    return (
      <ErrorState message="discoveryId inválido. Volvé a iniciar la conexión." />
    );
  }
  if (isPending) return <AssignSkeleton />;
  if (isError || !discovery) {
    return (
      <ErrorState
        message={
          (error as { message?: string })?.message ??
          "No se pudo cargar el discovery."
        }
      />
    );
  }

  const channelLabel =
    CHANNEL_LABELS[discovery.channel] ?? discovery.channel.toUpperCase();

  const onConfirm = async () => {
    const assignments = Object.entries(picks).map(([accountId, brandId]) => ({
      accountId,
      brandId,
    }));
    try {
      const result = await assignMut.mutateAsync({
        id: discovery.id,
        assignments,
      });
      const msgParts: string[] = [];
      if (result.connectionsCreated)
        msgParts.push(`${result.connectionsCreated} conectada(s)`);
      if (result.orphansCreated)
        msgParts.push(`${result.orphansCreated} sin asignar`);
      toast(`Listo: ${msgParts.join(" · ")}`);
      router.push("/app/connections?success=true");
    } catch (err) {
      toast(
        `Error: ${(err as { message?: string })?.message ?? "no se pudo asignar"}`,
        "error",
      );
    }
  };

  const onCancel = () => router.push("/app/connections");

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
        Asignar cuentas — {channelLabel}
      </h1>
      <p
        className="text-[14px] mt-1 mb-5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Detectamos <strong>{discovery.accounts.length}</strong> cuenta(s)
        accesibles. Elegí a qué marca pertenece cada una. Las que dejes "Sin
        asignar" quedan en la bandeja para conectar después.
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {discovery.accounts.map((acc) => (
          <div
            key={acc.accountId}
            className="fobo-card p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div
                className="text-[14px] font-semibold truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {acc.accountHandle}
              </div>
              <div
                className="text-[12px] truncate"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {acc.accountId}
              </div>
            </div>
            <select
              value={picks[acc.accountId] == null ? "" : String(picks[acc.accountId])}
              onChange={(e) => {
                const v = e.target.value;
                setPicks((prev) => ({
                  ...prev,
                  [acc.accountId]: v === "" ? null : Number(v),
                }));
              }}
              className="fobo-btn fobo-btn-secondary fobo-btn-sm"
              style={{ minWidth: 220 }}
            >
              <option value="">⊘ Sin asignar (guardar para después)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-3 sticky bottom-0 py-3"
        style={{
          background: "var(--color-background)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div
          className="text-[13px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <strong style={{ color: "var(--color-text-primary)" }}>
            {counts.toAssign}
          </strong>{" "}
          a conectar ·{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {counts.toOrphan}
          </strong>{" "}
          sin asignar
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={onCancel}
            className="fobo-btn fobo-btn-secondary fobo-btn-sm"
            disabled={assignMut.isPending}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="fobo-btn fobo-btn-primary fobo-btn-sm"
            disabled={assignMut.isPending}
          >
            {assignMut.isPending ? "Guardando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignSkeleton() {
  return (
    <div className="p-7 max-w-[860px] flex flex-col gap-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton.Card key={i} lines={2} />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-7 max-w-[860px]">
      <div
        className="rounded-xl p-6 text-center"
        style={{
          border: "1px dashed var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div
          className="text-[14px] font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
