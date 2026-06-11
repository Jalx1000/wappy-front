"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";

type ToastItem = { id: number; message: string; type: "success" | "error" | "info" };

const ToastCtx = createContext<(msg: string, type?: ToastItem["type"]) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, type: ToastItem["type"] = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-[100] pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3 px-4 py-3 rounded-[14px] pointer-events-auto"
              style={{
                background: "var(--color-surface-raised)",
                boxShadow: "var(--shadow-3)",
                border: "1px solid var(--color-border)",
                maxWidth: 360,
                fontFamily: "var(--font-ui)",
              }}
            >
              <span
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 26,
                  height: 26,
                  background:
                    t.type === "error"
                      ? "var(--color-error-bg)"
                      : t.type === "info"
                      ? "var(--color-primary-subtle)"
                      : "var(--color-success-bg)",
                  color:
                    t.type === "error"
                      ? "var(--color-error)"
                      : t.type === "info"
                      ? "var(--color-primary-ink)"
                      : "var(--color-success-dark)",
                }}
              >
                <Icon
                  name={t.type === "error" ? "x" : t.type === "info" ? "info" : "check"}
                  size={14}
                />
              </span>
              <span className="text-[13.5px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                {t.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
