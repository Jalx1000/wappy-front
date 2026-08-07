"use client";

import { Modal } from "./Modal";
import { Icon } from "./Icon";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Small destructive/confirm dialog shared across modules. */
export function ConfirmModal({
  title, message, confirmLabel = "Eliminar", danger = true, onClose, onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onClose} width={400}>
      <div style={{ padding: "24px 24px 20px" }}>
        <div style={{ width: 48, height: 48, borderRadius: 9999, background: danger ? "var(--color-error-bg)" : "var(--color-primary-subtle)",
          color: danger ? "var(--color-error)" : "var(--color-primary-ink)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Icon name={danger ? "trash" : "check2"} size={22} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-display)", letterSpacing: "-0.01em", color: "var(--color-text-primary)", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{message}</div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "0 24px 22px", justifyContent: "flex-end" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className={"fobo-btn fobo-btn-sm " + (danger ? "fobo-btn-danger" : "fobo-btn-primary")} onClick={onConfirm}>
          {danger && <Icon name="trash" size={16} />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
