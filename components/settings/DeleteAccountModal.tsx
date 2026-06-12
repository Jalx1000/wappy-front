"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";
import { useDeleteMe } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-ui)",
};

interface Props {
  onClose: () => void;
}

export function DeleteAccountModal({ onClose }: Props) {
  const toast = useToast();
  const del = useDeleteMe();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const armed = confirmText.trim().toUpperCase() === "ELIMINAR";

  const submit = async () => {
    if (!armed) return;
    setErr(null);
    setBusy(true);
    try {
      await del.mutateAsync();
      toast("Cuenta eliminada", "info");
      await signOut({ callbackUrl: "/login" });
    } catch (e) {
      setBusy(false);
      if (e instanceof ApiError) {
        setErr(e.message || "No se pudo eliminar la cuenta");
        return;
      }
      setErr("Error inesperado");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{
        background: "var(--color-overlay-scrim)",
        backdropFilter: "blur(3px)",
      }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-[480px] max-w-[92vw] overflow-hidden"
        style={{
          background: "var(--color-surface)",
          borderRadius: 20,
          boxShadow: "var(--shadow-3)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 h-[64px] px-[22px]"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-[10px]"
            style={{
              background: "var(--color-error-bg)",
              color: "var(--color-error)",
            }}
          >
            <Icon name="x" size={18} />
          </div>
          <div className="flex-1">
            <div
              className="font-bold text-[16px]"
              style={{ color: "var(--color-text-primary)" }}
            >
              Eliminar cuenta
            </div>
            <div
              className="text-[12px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Esta acción no se puede deshacer
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[8px] border-none cursor-pointer"
            style={{ background: "transparent", color: "var(--color-text-tertiary)" }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="p-[22px]">
          <p
            className="text-[14px] leading-[1.5] mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Tu cuenta será eliminada del backend. Perderás acceso a todas las
            marcas en las que eres miembro. Para confirmar, escribe{" "}
            <strong style={{ color: "var(--color-error)" }}>ELIMINAR</strong>{" "}
            abajo.
          </p>

          {err && (
            <div
              className="mb-4 px-3 py-2 rounded-[10px] text-[13px]"
              style={{
                background: "var(--color-error-bg)",
                color: "var(--color-error)",
              }}
            >
              {err}
            </div>
          )}

          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Escribe ELIMINAR"
            autoFocus
            disabled={busy}
            className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px] mb-4"
            style={inputStyle}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!armed || busy}
              className="fobo-btn fobo-btn-sm flex-1"
              style={{
                background: armed ? "var(--color-error)" : "var(--color-error-bg)",
                color: armed ? "#fff" : "var(--color-error)",
                opacity: armed ? 1 : 0.6,
              }}
            >
              {busy ? "Eliminando…" : "Eliminar definitivamente"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
