"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ConnectModal } from "./ConnectModal";
import { useToast } from "@/components/ui/Toast";
import { useUIStore } from "@/store/ui";
import { useConnections, useConnectMutation, useDisconnectMutation } from "@/lib/hooks";
import {
  BRANDS as BRANDS_FALLBACK,
  CHANNEL_META,
  CHANNEL_CATEGORIES,
  type ConnRecord,
} from "@/lib/mocks/data";
import type { IconName } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";

const HEALTH_STYLE = {
  ok:   { bg: "var(--color-success-bg)",  color: "var(--color-success-dark)", label: "Saludable" },
  warn: { bg: "var(--color-warning-bg)",  color: "var(--color-warning)",      label: "Expira pronto" },
  err:  { bg: "var(--color-error-bg)",    color: "var(--color-error)",        label: "Requiere acción" },
};

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
  const { activeBrand } = useUIStore();
  const brand = activeBrand ?? BRANDS_FALLBACK[0];
  const toast = useToast();

  const { data: conns = [], isPending } = useConnections(brand?.id);

  if (isPending) return <ConnectionsSkeleton />;
  const connectMutation    = useConnectMutation(brand?.id);
  const disconnectMutation = useDisconnectMutation(brand?.id);

  const [modal, setModal] = useState<{ ch: string; reauth?: boolean } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const connected = conns.filter((c) => c.status === "connected").length;
  const needsAttn = conns.filter(
    (c) => c.status === "reauth" || c.health === "err" || c.health === "warn"
  ).length;

  const handleConnect = (ch: string, accountName: string, accountId: string) => {
    connectMutation.mutate({ ch, accountId, accountName });
    setModal(null);
    toast(`${CHANNEL_META[ch].label} conectado`);
  };

  const handleDisconnect = (ch: string) => {
    disconnectMutation.mutate(ch);
    setExpanded(null);
    toast(`${CHANNEL_META[ch].label} desconectado`, "info");
  };

  const handleSync = () => {
    toast("Sincronizando todas las fuentes…", "info");
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

      {/* Summary strip */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {[
          {
            label: "Conectados",
            value: `${connected} / ${conns.length}`,
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
            value: "hace 8 min",
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
        const items = conns.filter((c) => CHANNEL_META[c.ch]?.cat === cat.id);
        if (!items.length) return null;
        const connCount = items.filter((c) => c.status === "connected").length;
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
                · {connCount}/{items.length}
              </span>
            </div>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
            >
              {items.map((conn) => (
                <ChannelCard
                  key={conn.ch}
                  conn={conn}
                  expanded={expanded === conn.ch}
                  onToggleExpand={() =>
                    setExpanded((prev) => (prev === conn.ch ? null : conn.ch))
                  }
                  onConnect={() => setModal({ ch: conn.ch })}
                  onReauth={() => setModal({ ch: conn.ch, reauth: true })}
                  onDisconnect={() => handleDisconnect(conn.ch)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Connect modal */}
      <AnimatePresence>
        {modal && (
          <ConnectModal
            channel={modal.ch}
            reauth={modal.reauth}
            onClose={() => setModal(null)}
            onConnect={handleConnect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Individual channel card ───────────────────────────────────────────────────
interface ChannelCardProps {
  conn: ConnRecord;
  expanded: boolean;
  onToggleExpand: () => void;
  onConnect: () => void;
  onReauth: () => void;
  onDisconnect: () => void;
}

function ChannelCard({
  conn, expanded, onToggleExpand, onConnect, onReauth, onDisconnect,
}: ChannelCardProps) {
  const ch = CHANNEL_META[conn.ch];
  const available = conn.status === "available";
  const reauth = conn.status === "reauth";
  const health = conn.health ? HEALTH_STYLE[conn.health] : null;

  return (
    <motion.div
      layout
      className="fobo-card p-[18px]"
      style={{
        border: reauth ? "1px solid var(--color-error)" : "1px solid var(--color-border)",
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
            {available ? "No conectado" : conn.account}
          </div>
        </div>
        {!available && health && (
          <span
            className="w-[9px] h-[9px] rounded-full flex-shrink-0"
            style={{ background: health.color }}
            title={health.label}
          />
        )}
      </div>

      {/* Health + last sync */}
      {!available && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {health && (
            <span
              className="text-[11px] font-semibold rounded-full px-[9px] py-[3px]"
              style={{ background: health.bg, color: health.color }}
            >
              ● {health.label}
            </span>
          )}
          {conn.lastSync && (
            <span className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
              Sync {conn.lastSync}
            </span>
          )}
        </div>
      )}

      {/* Expanded scopes */}
      <AnimatePresence>
        {expanded && !available && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-[10px] px-3 py-[10px] mb-3"
              style={{ background: "var(--color-background)" }}
            >
              <div
                className="text-[10.5px] font-bold uppercase mb-[7px]"
                style={{ letterSpacing: "0.05em", color: "var(--color-text-tertiary)" }}
              >
                Permisos otorgados
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {ch.scopes.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-medium rounded-full px-[9px] py-[3px] flex items-center gap-[5px]"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <Icon name="check" size={11} color="var(--color-success)" />
                    {s}
                  </span>
                ))}
              </div>
              {conn.since && (
                <div
                  className="text-[11.5px] mt-[9px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Conectado desde {conn.since}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-2">
        {reauth ? (
          <button
            onClick={onReauth}
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1"
            style={{ background: "var(--color-error)" }}
          >
            Reautenticar
          </button>
        ) : available ? (
          <button
            onClick={onConnect}
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1 gap-1"
          >
            <Icon name="plus" size={15} /> Conectar
          </button>
        ) : (
          <>
            <button
              onClick={onToggleExpand}
              className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1"
            >
              {expanded ? "Ocultar" : "Detalles"}
            </button>
            <button
              onClick={onDisconnect}
              title="Desconectar"
              className="fobo-btn fobo-btn-secondary fobo-btn-sm px-3"
              style={{ color: "var(--color-error)" }}
            >
              <Icon name="plug" size={15} color="var(--color-error)" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
