"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useUIStore } from "@/store/ui";
import {
  useConnections,
  useDisconnectMutation,
  useSyncConnectionMutation,
  useOrphans,
  useStranded,
} from "@/lib/hooks";
import { ChangeBrandModal } from "@/components/connections/ChangeBrandModal";
import {
  CHANNEL_META,
  CHANNEL_CATEGORIES,
  type ConnRecord,
} from "@/lib/mocks/data";
import type { IconName } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";

// Mapeo del slug UI al urlChannel del backend OAuth gateway
const URL_CHANNEL: Record<string, string> = {
  facebook: "meta",       // Meta cubre FB + IG en un solo OAuth
  instagram: "meta",
  instagramlogin: "instagram-login",
  tiktok: "tiktok",
  tiktokads: "tiktok_ads",
  youtube: "youtube",
  linkedin: "linkedin",
  linkedinads: "linkedin_ads",
  ga4: "ga4",
  googleads: "google_ads",
  metaads: "meta-ads",
};

// Canales que existen en CHANNEL_META pero por ahora no se muestran en la UI.
const HIDDEN_CHANNELS = new Set<string>(["website"]);

const HEALTH_STYLE = {
  ok:   { bg: "var(--color-success-bg)",  color: "var(--color-success-dark)", label: "Saludable" },
  warn: { bg: "var(--color-warning-bg)",  color: "var(--color-warning)",      label: "Expira pronto" },
  err:  { bg: "var(--color-error-bg)",    color: "var(--color-error)",        label: "Requiere acción" },
};

type ChannelGroup = { ch: string; accounts: ConnRecord[] };

function ConnectionsSkeleton() {
  return (
    <div className="p-7 max-w-[1440px] flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4 mb-2">
        {[...Array(3)].map((_, i) => <Skeleton.KPI key={i} />)}
      </div>
      {[...Array(6)].map((_, i) => <Skeleton.Connection key={i} />)}
    </div>
  );
}

export function ConnectionsHub() {
  const { activeBrand: brand } = useUIStore();
  const toast = useToast();
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: conns = [], isPending } = useConnections(brand?.id);
  const { data: orphans = [] } = useOrphans();
  const { data: stranded = [] } = useStranded();

  const disconnectMutation = useDisconnectMutation(brand?.id);
  const syncMutation       = useSyncConnectionMutation(brand?.id);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reassignTarget, setReassignTarget] = useState<{
    id: number;
    channel: string;
    accountHandle: string;
  } | null>(null);

  // Detectar callback del backend OAuth (?success=true&connectionIds=... | ?error=...)
  const successFlag = searchParams.get("success");
  const errorFlag = searchParams.get("error");
  useEffect(() => {
    if (successFlag === "true") {
      const ids = searchParams.get("connectionIds") ?? "";
      toast(
        ids
          ? `Conexión creada ✓ (IDs ${ids})`
          : "Autorización OK, pero no se encontraron cuentas conectables",
      );
      qc.invalidateQueries({ queryKey: ["connections", brand?.id] });
      router.replace("/app/connections");
    } else if (errorFlag) {
      toast(`Error al conectar: ${errorFlag}`, "info");
      router.replace("/app/connections");
    }
  }, [successFlag, errorFlag]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (isPending || !brand) return <ConnectionsSkeleton />;

  // Catálogo completo: un grupo por canal con TODAS sus cuentas conectadas
  // (una marca puede tener varias páginas/cuentas del mismo canal).
  const byCh = new Map<string, ConnRecord[]>();
  for (const c of conns) {
    const list = byCh.get(c.ch) ?? [];
    list.push(c);
    byCh.set(c.ch, list);
  }
  const cataloged: ChannelGroup[] = Object.keys(CHANNEL_META)
    .filter((ch) => !HIDDEN_CHANNELS.has(ch))
    .map((ch) => ({ ch, accounts: byCh.get(ch) ?? [] }));

  const totalAccounts = conns.length;
  const connectedAccounts = conns.filter((c) => c.status === "connected").length;
  const needsAttn = conns.filter(
    (c) => c.status === "reauth" || c.health === "err" || c.health === "warn"
  ).length;
  const lastSyncLabel = (() => {
    const latest = conns
      .filter((c) => c.lastSyncAt)
      .sort((a, b) =>
        String(b.lastSyncAt).localeCompare(String(a.lastSyncAt)),
      )[0];
    return latest?.lastSync ?? "sin sincronizar";
  })();

  const unassignedCount = orphans.length + stranded.length;

  const handleConnect = (ch: string) => {
    const urlChannel = URL_CHANNEL[ch];
    if (!urlChannel) {
      toast(`Canal sin OAuth configurado: ${ch}`, "info");
      return;
    }
    toast(`Te llevamos a ${CHANNEL_META[ch]?.label ?? ch}…`);
    // Redirige al route handler que adjunta el JWT y forwardea al backend.
    // El backend devuelve 302 al consent NATIVO de la plataforma.
    window.location.assign(`/oauth/launch/${urlChannel}?brandId=${brand.id}`);
  };

  const handleDisconnect = (conn: ConnRecord) => {
    if (!conn.id) {
      toast("Esta conexión aún no existe en backend", "info");
      return;
    }
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        `¿Desconectar "${conn.account}"? Dejará de sincronizar datos.`,
      );
      if (!ok) return;
    }
    disconnectMutation.mutate({ id: conn.id, ch: conn.ch });
    setExpandedId(null);
    toast(`${conn.account ?? CHANNEL_META[conn.ch]?.label ?? conn.ch} desconectado`, "info");
  };

  const handleSync = () => {
    const targets = conns.filter(
      (c): c is ConnRecord & { id: number } =>
        typeof c.id === "number" && c.status === "connected",
    );
    if (!targets.length) {
      toast("No hay conexiones para sincronizar", "info");
      return;
    }
    targets.forEach((c) => syncMutation.mutate(c.id));
    toast(`Sincronizando ${targets.length} fuente(s)…`, "info");
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      {/* Page header */}
      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            Conexiones
          </h1>
          <p className="text-[14px] mt-[5px]" style={{ color: "var(--color-text-secondary)" }}>
            Conecta las cuentas de{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>{brand.name}</strong>{" "}
            para alimentar reportes y analítica
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-2" onClick={handleSync}>
            <Icon name="refresh" size={15} /> Sincronizar todo
          </button>
        </div>
      </div>

      {unassignedCount > 0 && (
        <button
          onClick={() => router.push("/app/connections/orphans")}
          className="w-full mb-4 fobo-card p-4 flex items-center gap-3 text-left"
          style={{
            border: "1px solid rgba(245, 158, 11, 0.4)",
            background: "rgba(245, 158, 11, 0.06)",
          }}
        >
          <Icon name="bell" size={18} color="var(--color-warning)" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Hay {unassignedCount} cuenta(s) sin asignar
            </div>
            <div className="text-[12.5px]" style={{ color: "var(--color-text-secondary)" }}>
              {orphans.length > 0 && `${orphans.length} detectada(s) por OAuth sin marca`}
              {orphans.length > 0 && stranded.length > 0 && " · "}
              {stranded.length > 0 && `${stranded.length} de marcas eliminadas`}
              . Cualquier admin las puede asignar.
            </div>
          </div>
          <div className="text-[13px] font-semibold" style={{ color: "var(--color-warning)" }}>
            Ver y asignar →
          </div>
        </button>
      )}

      {/* Summary strip */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {[
          {
            label: "Cuentas conectadas",
            value: `${connectedAccounts} / ${totalAccounts}`,
            color: "var(--color-success)",
            icon: "check" as IconName,
          },
          {
            label: "Requieren atención",
            value: String(needsAttn),
            color: needsAttn ? "var(--color-warning)" : "var(--color-text-tertiary)",
            icon: "bell" as IconName,
          },
          {
            label: "Última sincronización",
            value: lastSyncLabel,
            color: "var(--color-secondary-ink)",
            icon: "refresh" as IconName,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="fobo-card flex items-center gap-[14px] px-[18px] py-4"
          >
            <span
              className="flex items-center justify-center rounded-[11px] flex-shrink-0"
              style={{
                width: 42, height: 42,
                background: "var(--color-background)",
                color: s.color,
              }}
            >
              <Icon name={s.icon} size={20} color={s.color} />
            </span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text-primary)",
                }}
              >
                {s.value}
              </div>
              <div className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {CHANNEL_CATEGORIES.map((cat) => {
        const items = cataloged.filter((g) => CHANNEL_META[g.ch]?.cat === cat.id);
        if (!items.length) return null;
        const connCount = items.reduce(
          (n, g) => n + g.accounts.filter((a) => a.status === "connected").length,
          0,
        );
        return (
          <div key={cat.id} className="mb-7">
            <div className="flex items-center gap-[9px] mb-3">
              <Icon name={cat.icon} size={17} color="var(--color-text-secondary)" />
              <span
                className="text-[14px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {cat.label}
              </span>
              <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                · {connCount} cuenta(s)
              </span>
            </div>
            <div
              className="grid gap-4 items-start"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
            >
              {items.map((group) => (
                <ChannelCard
                  key={group.ch}
                  group={group}
                  expandedId={expandedId}
                  onToggleExpand={(id) =>
                    setExpandedId((prev) => (prev === id ? null : id))
                  }
                  onConnect={() => handleConnect(group.ch)}
                  onDisconnect={handleDisconnect}
                  onSync={(id) => syncMutation.mutate(id)}
                  syncingId={
                    syncMutation.isPending
                      ? (syncMutation.variables as number)
                      : null
                  }
                  onChangeBrand={(conn) =>
                    setReassignTarget({
                      id: conn.id as number,
                      channel: conn.ch,
                      accountHandle: conn.account ?? "",
                    })
                  }
                />
              ))}
            </div>
          </div>
        );
      })}

      <ChangeBrandModal
        open={reassignTarget !== null}
        connectionId={reassignTarget?.id ?? null}
        currentBrandId={brand?.id ?? null}
        channelLabel={
          reassignTarget ? CHANNEL_META[reassignTarget.channel]?.label ?? reassignTarget.channel : ""
        }
        accountHandle={reassignTarget?.accountHandle ?? ""}
        onClose={() => setReassignTarget(null)}
      />
    </div>
  );
}

// ── Card por canal con todas sus cuentas ─────────────────────────────────────
interface ChannelCardProps {
  group: ChannelGroup;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  onConnect: () => void;
  onDisconnect: (conn: ConnRecord) => void;
  onSync: (id: number) => void;
  syncingId: number | null;
  onChangeBrand: (conn: ConnRecord) => void;
}

function ChannelCard({
  group, expandedId, onToggleExpand, onConnect, onDisconnect, onSync, syncingId, onChangeBrand,
}: ChannelCardProps) {
  const ch = CHANNEL_META[group.ch];
  const accounts = group.accounts;
  const available = accounts.length === 0;
  const anyReauth = accounts.some((a) => a.status === "reauth");

  return (
    <motion.div
      layout
      className="fobo-card p-[18px]"
      style={{
        border: anyReauth ? "1px solid var(--color-error)" : "1px solid var(--color-border)",
      }}
    >
      {/* Channel header */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="flex items-center justify-center font-bold text-[16px] flex-shrink-0"
          style={{
            width: 44, height: 44, borderRadius: 11,
            background: available ? "var(--color-background)" : ch.color,
            color: available ? "var(--color-text-tertiary)" : "#fff",
            border: available ? "1px solid var(--color-border)" : "none",
          }}
        >
          {ch.letter}
        </span>
        <div className="flex-1 min-w-0">
          <div
            className="text-[15px] font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {ch.label}
          </div>
          <div
            className="text-[12px] truncate"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {available
              ? "No conectado"
              : `${accounts.length} cuenta${accounts.length === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>

      {/* Account rows */}
      {accounts.map((conn) => {
        const health = conn.health ? HEALTH_STYLE[conn.health] : null;
        const reauth = conn.status === "reauth";
        const expanded = typeof conn.id === "number" && expandedId === conn.id;
        return (
          <div
            key={conn.id ?? conn.account}
            className="rounded-[10px] px-3 py-[9px] mb-2"
            style={{
              background: "var(--color-background)",
              border: reauth
                ? "1px solid var(--color-error)"
                : "1px solid transparent",
            }}
          >
            <div className="flex items-center gap-2">
              {health && (
                <span
                  className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                  style={{ background: health.color }}
                  title={health.label}
                />
              )}
              <button
                onClick={() => typeof conn.id === "number" && onToggleExpand(conn.id)}
                className="flex-1 min-w-0 text-left border-none bg-transparent cursor-pointer p-0"
                title="Ver detalles"
              >
                <span
                  className="block text-[13px] font-medium truncate"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {conn.account}
                </span>
                <span
                  className="block text-[11px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {reauth
                    ? "Requiere reautenticación"
                    : conn.lastSync
                      ? `Sync ${conn.lastSync}`
                      : "Sin sincronizar"}
                </span>
              </button>
              <div className="flex items-center gap-1 flex-shrink-0">
                {conn.status === "connected" && typeof conn.id === "number" && (
                  <IconBtn
                    title="Sincronizar ahora"
                    onClick={() => onSync(conn.id as number)}
                    disabled={syncingId === conn.id}
                  >
                    <Icon
                      name="refresh"
                      size={14}
                      className={syncingId === conn.id ? "animate-spin" : undefined}
                    />
                  </IconBtn>
                )}
                {typeof conn.id === "number" && (
                  <IconBtn title="Cambiar de marca" onClick={() => onChangeBrand(conn)}>
                    <Icon name="edit" size={14} />
                  </IconBtn>
                )}
                <IconBtn
                  title="Desconectar"
                  onClick={() => onDisconnect(conn)}
                  danger
                >
                  <Icon name="plug" size={14} color="var(--color-error)" />
                </IconBtn>
              </div>
            </div>

            {/* Expanded: permisos reales + desde cuándo */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="pt-[9px]">
                    {(conn.scopes ?? []).length > 0 ? (
                      <>
                        <div
                          className="text-[10.5px] font-bold uppercase mb-[6px]"
                          style={{ letterSpacing: "0.05em", color: "var(--color-text-tertiary)" }}
                        >
                          Permisos otorgados
                        </div>
                        <div className="flex flex-wrap gap-[5px]">
                          {(conn.scopes ?? []).map((s) => (
                            <span
                              key={s}
                              className="text-[10.5px] font-medium rounded-full px-[8px] py-[2px]"
                              style={{
                                background: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div
                        className="text-[11.5px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        Sin permisos registrados para esta conexión.
                      </div>
                    )}
                    {conn.since && (
                      <div
                        className="text-[11px] mt-[7px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        Conectado desde {conn.since}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        {anyReauth && (
          <button
            onClick={onConnect}
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1"
            style={{ background: "var(--color-error)" }}
          >
            Reautenticar
          </button>
        )}
        <button
          onClick={onConnect}
          className={
            available
              ? "fobo-btn fobo-btn-primary fobo-btn-sm flex-1 gap-1"
              : "fobo-btn fobo-btn-secondary fobo-btn-sm flex-1 gap-1"
          }
        >
          <Icon name="plus" size={15} />
          {available ? "Conectar" : "Añadir otra cuenta"}
        </button>
      </div>
    </motion.div>
  );
}

function IconBtn({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none cursor-pointer flex-shrink-0"
      style={{
        background: "transparent",
        color: danger ? "var(--color-error)" : "var(--color-text-secondary)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
      }
    >
      {children}
    </button>
  );
}
