"use client";

import { useState, type CSSProperties } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import {
  INTEGRATION_BASE_URL,
  type ApiKeyEnvironment,
  type CreatedApiKey,
} from "@/lib/api/apiKeys";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/lib/hooks/apiKeys";

const card: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 14,
};
const mono: CSSProperties = {
  fontFamily: "var(--font-mono, ui-monospace, monospace)",
  fontSize: 12.5,
};

function CopyRow({ label, value }: { label: string; value: string }) {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast("Copiado");
    } catch {
      toast("No se pudo copiar", "error");
    }
  };
  return (
    <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
      <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", width: 84, flex: "none" }}>{label}</span>
      <code className="truncate" style={{ ...mono, color: "var(--color-text-secondary)", flex: 1, minWidth: 0 }}>{value}</code>
      <button
        className="fobo-btn fobo-btn-secondary fobo-btn-sm"
        onClick={copy}
        aria-label={`Copiar ${label}`}
      >
        <Icon name="copy" size={14} /> Copiar
      </button>
    </div>
  );
}

function GenerateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (k: CreatedApiKey) => void;
}) {
  const create = useCreateApiKey();
  const toast = useToast();
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>("sandbox");
  const [label, setLabel] = useState("");

  const submit = () => {
    create.mutate(
      { environment, label: label.trim() || null },
      {
        onSuccess: (k) => onCreated(k),
        onError: () => toast("No se pudo generar la key", "error"),
      },
    );
  };

  return (
    <Modal onClose={onClose} width={460}>
      <ModalHeader title="Generar API key" subtitle="Server-to-server" onClose={onClose} />
      <div className="flex flex-col gap-4" style={{ padding: 22 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-secondary)" }}>Entorno</label>
          <div className="flex gap-2" style={{ marginTop: 6 }}>
            {(["sandbox", "production"] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEnvironment(e)}
                aria-pressed={environment === e}
                className="fobo-btn fobo-btn-sm"
                style={{
                  flex: 1,
                  background: environment === e ? "var(--color-primary)" : "var(--color-background)",
                  color: environment === e ? "var(--color-on-primary)" : "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {e === "sandbox" ? "Sandbox" : "Producción"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="apikey-label" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Etiqueta (opcional)
          </label>
          <input
            id="apikey-label"
            className="fobo-input"
            style={{ marginTop: 6 }}
            placeholder="Ej: Plugin WooCommerce Yiyi"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2" style={{ marginTop: 4 }}>
          <button className="fobo-btn fobo-btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="fobo-btn fobo-btn-primary" onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Generando…" : "Generar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RevealModal({ created, onClose }: { created: CreatedApiKey; onClose: () => void }) {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(created.key);
      toast("API key copiada");
    } catch {
      toast("No se pudo copiar", "error");
    }
  };
  return (
    <Modal onClose={onClose} width={520}>
      <ModalHeader title="Tu nueva API key" subtitle="Guárdala ahora — no se vuelve a mostrar" onClose={onClose} />
      <div className="flex flex-col gap-4" style={{ padding: 22 }}>
        <div
          role="status"
          className="flex items-start gap-2"
          style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5 }}
        >
          <Icon name="alert" size={15} />
          <span>Por seguridad solo guardamos el hash. Copiala ahora; después solo verás los últimos dígitos.</span>
        </div>
        <code
          className="block"
          style={{ ...mono, background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "12px 14px", wordBreak: "break-all", color: "var(--color-text-primary)" }}
        >
          {created.key}
        </code>
        <div className="flex justify-end gap-2">
          <button className="fobo-btn fobo-btn-primary" onClick={copy} autoFocus>
            <Icon name="copy" size={14} /> Copiar key
          </button>
          <button className="fobo-btn fobo-btn-secondary" onClick={onClose}>Listo</button>
        </div>
      </div>
    </Modal>
  );
}

export function ApiKeysPanel() {
  const { data: keys, isLoading, isError, refetch } = useApiKeys();
  const revoke = useRevokeApiKey();
  const toast = useToast();
  const [showGenerate, setShowGenerate] = useState(false);
  const [revealed, setRevealed] = useState<CreatedApiKey | null>(null);

  const onRevoke = (id: string) =>
    revoke.mutate(id, { onError: () => toast("No se pudo revocar", "error") });

  return (
    <section style={{ ...card, padding: 0 }} aria-label="API de Wappy">
      <div className="flex items-center gap-3" style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>API de Wappy</h2>
          <p style={{ fontSize: 12.5, color: "var(--color-text-tertiary)", margin: "2px 0 0" }}>
            Claves server-to-server para integrar tu tienda (WooCommerce, etc.).
          </p>
        </div>
        <button
          className="fobo-btn fobo-btn-primary fobo-btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={() => setShowGenerate(true)}
        >
          <Icon name="plus" size={14} /> Generar key
        </button>
      </div>

      <div className="flex flex-col gap-2" style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border)" }}>
        <CopyRow label="URL base" value={INTEGRATION_BASE_URL} />
        <CopyRow label="Contactos" value={`${INTEGRATION_BASE_URL}/integration/contacts`} />
      </div>

      <div style={{ padding: "14px 20px" }}>
        {isLoading && (
          <div aria-busy="true" className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <div key={i} style={{ height: 44, borderRadius: 10, background: "var(--neutral-200)" }} className="animate-pulse" />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-3" style={{ fontSize: 13, color: "var(--color-error)" }}>
            No se pudieron cargar las keys.
            <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => refetch()}>Reintentar</button>
          </div>
        )}
        {keys && keys.length === 0 && (
          <div role="status" style={{ textAlign: "center", padding: "20px 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>
            Todavía no generaste ninguna key. Creá una para empezar a integrar.
          </div>
        )}
        {keys && keys.length > 0 && (
          <ul role="list" className="flex flex-col" style={{ gap: 8 }}>
            {keys.map((k) => {
              const revoked = !!k.revokedAt;
              return (
                <li
                  key={k.id}
                  className="flex items-center gap-3"
                  style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: "10px 12px", opacity: revoked ? 0.55 : 1 }}
                >
                  <span
                    className="fobo-badge"
                    style={{
                      fontSize: 10.5, padding: "1px 7px",
                      background: k.environment === "production" ? "var(--color-success-bg)" : "var(--color-primary-subtle)",
                      color: k.environment === "production" ? "var(--color-success-dark)" : "var(--color-primary-ink)",
                    }}
                  >
                    {k.environment === "production" ? "Producción" : "Sandbox"}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <code style={{ ...mono, color: "var(--color-text-primary)" }}>{k.keyPrefix}</code>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)" }}>
                      {k.label ? `${k.label} · ` : ""}{revoked ? "revocada" : "activa"}
                    </div>
                  </div>
                  {!revoked && (
                    <button
                      className="fobo-btn fobo-btn-secondary fobo-btn-sm"
                      style={{ marginLeft: "auto", color: "var(--color-error)" }}
                      onClick={() => onRevoke(k.id)}
                      disabled={revoke.isPending}
                      aria-label={`Revocar key ${k.keyPrefix}`}
                    >
                      Revocar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showGenerate && (
        <GenerateModal
          onClose={() => setShowGenerate(false)}
          onCreated={(k) => {
            setShowGenerate(false);
            setRevealed(k);
          }}
        />
      )}
      {revealed && <RevealModal created={revealed} onClose={() => setRevealed(null)} />}
    </section>
  );
}
