"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";

interface ModalProps {
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

/**
 * Centered dialog with scrim, spring entrance, Esc-to-close and backdrop click.
 * Rendered through a portal so it escapes any transformed/overflow ancestor.
 */
export function Modal({ onClose, width = 500, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onMouseDown={onClose}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: "var(--color-overlay-scrim)" }}
      >
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex flex-col w-full max-h-[88vh] overflow-hidden"
          style={{
            width,
            maxWidth: "100%",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-3)",
            border: "1px solid var(--color-border)",
          }}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div
      className="flex items-start gap-3 px-[22px] py-[18px] flex-none"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex-1 min-w-0">
        <div
          className="text-[16px] font-semibold truncate"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-[12.5px] mt-0.5 truncate" style={{ color: "var(--color-text-tertiary)" }}>
            {subtitle}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="flex-none flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer transition-colors"
        style={{ background: "transparent", color: "var(--color-text-secondary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Icon name="x" size={18} />
      </button>
    </div>
  );
}
