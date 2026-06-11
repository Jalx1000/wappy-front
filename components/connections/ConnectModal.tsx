"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { CHANNEL_META, MOCK_ACCOUNTS } from "@/lib/mocks/data";

interface ConnectModalProps {
  channel: string;
  reauth?: boolean;
  onClose: () => void;
  onConnect: (channel: string, accountName: string, accountId: string) => void;
}

export function ConnectModal({ channel, reauth, onClose, onConnect }: ConnectModalProps) {
  const ch = CHANNEL_META[channel];
  const accounts = MOCK_ACCOUNTS[channel] ?? [{ id: "a1", name: ch.label + " principal", meta: "Cuenta business" }];
  const [step, setStep] = useState<0 | 1>(reauth ? 1 : 0);
  const [picked, setPicked] = useState(accounts[0].id);
  const [busy, setBusy] = useState(false);

  const finish = () => {
    setBusy(true);
    setTimeout(() => {
      const account = accounts.find((a) => a.id === picked)?.name ?? ch.label;
      onConnect(channel, account, picked);
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-[440px] max-w-[92vw] overflow-hidden"
        style={{
          background: "var(--color-surface)",
          borderRadius: 20,
          boxShadow: "var(--shadow-3)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-[14px] h-[78px] px-[22px]"
          style={{ background: ch.color }}
        >
          <span
            className="flex items-center justify-center text-white font-bold text-[20px] flex-shrink-0"
            style={{
              width: 48, height: 48, borderRadius: 13,
              background: "rgba(255,255,255,0.2)",
            }}
          >
            {ch.letter}
          </span>
          <div className="text-white">
            <div className="font-bold text-[17px]">{ch.label}</div>
            <div className="text-[12.5px]" style={{ opacity: 0.9 }}>
              {reauth ? "Reautenticar conexión" : "Conectar a Fobo"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
          >
            <Icon name="x" size={15} color="#fff" />
          </button>
        </div>

        {/* Body */}
        <div className="p-[22px]">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="scopes"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <p
                  className="text-[14px] leading-[1.55] mb-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Fobo solicitará acceso para leer estos datos de tu cuenta de {ch.label}:
                </p>
                <div className="flex flex-col gap-[8px] mb-5">
                  {ch.scopes.map((s) => (
                    <div
                      key={s}
                      className="flex items-center gap-[10px] text-[14px]"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      <span
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{
                          width: 24, height: 24,
                          background: "var(--color-success-bg)",
                        }}
                      >
                        <Icon name="check" size={13} color="var(--color-success-dark)" />
                      </span>
                      {s}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="fobo-btn fobo-btn-primary w-full gap-2"
                >
                  <Icon name="plug" size={17} /> Continuar con {ch.label}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="accounts"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <p
                  className="text-[13px] font-semibold mb-[10px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Elige la cuenta a vincular
                </p>
                <div className="flex flex-col gap-[8px] mb-5">
                  {accounts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setPicked(a.id)}
                      className="flex items-center gap-3 px-[14px] py-3 rounded-[12px] text-left cursor-pointer border transition-colors"
                      style={{
                        fontFamily: "var(--font-ui)",
                        border:
                          picked === a.id
                            ? "1.5px solid var(--color-primary)"
                            : "1px solid var(--color-border)",
                        background:
                          picked === a.id
                            ? "var(--color-primary-subtle)"
                            : "var(--color-surface)",
                      }}
                    >
                      <span
                        className="flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
                        style={{ width: 34, height: 34, borderRadius: 9, background: ch.color }}
                      >
                        {ch.letter}
                      </span>
                      <div className="flex-1">
                        <div
                          className="text-[14px] font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {a.name}
                        </div>
                        <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                          {a.meta}
                        </div>
                      </div>
                      {picked === a.id && (
                        <Icon name="check" size={18} color="var(--color-primary-ink)" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={finish}
                  disabled={busy}
                  className="fobo-btn fobo-btn-primary w-full"
                >
                  {busy ? "Conectando…" : "Autorizar y conectar"}
                </button>
                {!reauth && (
                  <button
                    onClick={() => setStep(0)}
                    className="fobo-btn fobo-btn-ghost fobo-btn-sm w-full mt-2"
                  >
                    ← Volver
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
