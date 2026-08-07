"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

// ──────────────────────────────────────────────────────────────────────────────
// WhatsApp Cloud API — fields (https://developers.facebook.com/docs/whatsapp/cloud-api)
// ──────────────────────────────────────────────────────────────────────────────
// Mock URL de Developer Dashboard de Meta for Developers. Esta sería la URL pública del APP
// ya que el user debe configurar el Webhook real en la consola.
// En producción reemplazar MOCK_WEBHOOK_VERIFY_TOKEN por un token aleatorio por marca.
// ──────────────────────────────────────────────────────────────────────────────

export const MOCK_WHATSAPP_WEBHOOK_URL = (brandId: string | number, brandSlug?: string) => {
  const base =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";
  const slug = brandSlug ? encodeURIComponent(brandSlug) : brandId;
  return `${base}/api/v1/whatsapp/webhook/${slug}`;
};

export const MOCK_WEBHOOK_VERIFY_TOKEN = "WAPPY_WA_VERIFY_2025";

const CATEGORIES_WABA = [
  "Marketing",
  "Utility",
  "Authentication",
  "Service",
] as const;

const schema = z.object({
  // ── Credenciales Cloud API
  appId: z
    .string()
    .min(5, "App ID mínimo 5 caracteres")
    .regex(/^\d+$/, "Solo números (Meta App ID)"),
  appSecret: z.string().min(10, "App Secret mínimo 10 caracteres"),
  accessToken: z
    .string()
    .min(20, "Permanent Token debe ser de al menos 20 caracteres"),
  phoneNumberId: z
    .string()
    .min(5, "Phone Number ID es obligatorio")
    .regex(/^\d+$/, "Solo números"),
  businessAccountId: z
    .string()
    .min(5, "WABA ID es obligatorio")
    .regex(/^\d+$/, "Solo números"),
  // ── Datos del número
  displayName: z.string().min(2, "Nombre visible mínimo 2 caracteres").max(40),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s-]+$/, "Formato internacional: +591 70000000"),
  category: z.enum(CATEGORIES_WABA, {
    message: "Selecciona una categoría",
  }),
});

export type WaConnectionForm = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSave?: (data: WaConnectionForm) => void;
  brand?: { id: string | number; name: string; slug?: string };
}

const inputCls = "fobo-input";
const labelCls = "text-[12px] font-semibold block mb-2";
const labelStyle = { color: "var(--color-text-secondary)" } as React.CSSProperties;
const helpCls = "text-[11.5px] mt-1.5";
const helpStyle = { color: "var(--color-text-tertiary)" } as React.CSSProperties;
const errCls = "text-[11.5px] mt-1.5";
const errStyle = { color: "var(--color-error)" } as React.CSSProperties;

export function WhatsAppConnectModal({ onClose, onSave, brand }: Props) {
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [copied, setCopied] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WaConnectionForm>({
    resolver: zodResolver(schema),
    defaultValues: { category: CATEGORIES_WABA[0] },
  });

  const webhookUrl = MOCK_WHATSAPP_WEBHOOK_URL(
    brand?.id ?? 0, brand?.slug);
  const verifyToken = MOCK_WEBHOOK_VERIFY_TOKEN;

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast("Copiado al portapapeles", "success");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast("No se pudo copiar", "error");
    }
  };

  const onSubmit = async (data: WaConnectionForm) => {
    // TODO: reemplazar por llamada real al backend (POST /whatsapp/connect)
    await new Promise((r) => setTimeout(r, 500));
    onSave?.(data);
    onClose();
    toast(`WhatsApp Business conectado ✓ (${data.displayName})`, "success");
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4"
        style={{
          background: "var(--color-overlay-scrim)",
          backdropFilter: "blur(3px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="w-[720px] max-w-full my-6"
          style={{
            background: "var(--color-surface)",
            borderRadius: 20,
            boxShadow: "var(--shadow-3)",
            padding: 24,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/socials/WhatsApp.webp"
                alt=""
                className="w-8 h-8"
              />
              <div>
                <div className="font-semibold text-[16px]"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Conectar WhatsApp Business
                </div>
                <div className="text-[12px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Cloud API · Paso {step} de 2
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
              style={{
                background: "var(--color-background)",
                color: "var(--color-text-secondary)",
              }}
            >
              <Icon name="x" size={15} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map((n) => (
              <div key={n} className="flex-1">
                <div
                  className="h-1 rounded-full"
                  style={{
                    background:
                      step >= n
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                  }}
                />
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className="flex flex-col gap-4 max-h-[calc(100vh-280px)] overflow-y-auto"
            >
              {step === 1 && (
                <>
                  {/* STEP 1: Configurar Webhook en Meta for Developers */}
                  <div
                    className="rounded-[12px] border p-4"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-background)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
                        style={{
                          background: "var(--color-primary-subtle)",
                          color: "var(--color-primary-ink)",
                        }}
                      >
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-semibold text-[14px]"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          Configura el Webhook en Meta for Developers
                        </div>
                        <div
                          className="text-[12.5px] mt-1"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Abre tu App de Meta → Dashboard → WhatsApp →
                          Configuration y pega estos valores.
                        </div>
                      </div>
                      <a
                        href="https://developers.facebook.com/apps/"
                        target="_blank"
                        rel="noreferrer"
                        className="fobo-btn fobo-btn-ghost fobo-btn-sm flex items-center gap-1 whitespace-nowrap"
                      >
                        <Icon name="external" size={13} /> Abrir
                      </a>
                    </div>

                    {/* Webhook URL */}
                    <div className="mt-4">
                      <label className={labelCls} style={labelStyle}>
                        Callback URL (Webhook)
                      </label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          className="fobo-input flex-1"
                          value={webhookUrl}
                        />
                        <button
                          type="button"
                          className="fobo-btn fobo-btn-secondary fobo-btn-sm"
                          onClick={() => copy("url", webhookUrl)}
                        >
                          <Icon
                            name={copied === "url" ? "check" : "copy"}
                            size={14}
                          />
                        </button>
                      </div>
                      <div className={helpCls} style={helpStyle}>
                        Endpoint público donde Meta envía eventos de WhatsApp.
                      </div>
                    </div>

                    {/* Verify Token */}
                    <div className="mt-3">
                      <label className={labelCls} style={labelStyle}>
                        Verify Token
                      </label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          className="fobo-input flex-1 font-mono text-[12px]"
                          value={verifyToken}
                        />
                        <button
                          type="button"
                          className="fobo-btn fobo-btn-secondary fobo-btn-sm"
                          onClick={() => copy("vt", verifyToken)}
                        >
                          <Icon
                            name={copied === "vt" ? "check" : "copy"}
                            size={14}
                          />
                        </button>
                      </div>
                      <div className={helpCls} style={helpStyle}>
                        String para validar el webhook con Meta.
                      </div>
                    </div>

                    {/* Fields hint */}
                    <div className="mt-3">
                      <label className={labelCls} style={labelStyle}>
                        Webhook fields (suscríbete a estos
                      </label>
                      <div
                        className="flex flex-wrap gap-1.5">
                        {[
                          "messages",
                          "message_template_status_update",
                          "messages_statuses",
                        ].map((f) => (
                          <span
                            key={f}
                            className="text-[11.5px] px-2 py-1 rounded-md"
                            style={{
                              background: "var(--color-surface)",
                              color: "var(--color-text-secondary)",
                              border: "1px solid var(--color-border)",
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="fobo-btn fobo-btn-primary fobo-btn-sm"
                      onClick={() => setStep(2)}
                    >
                      Continuar →
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* STEP 2: Credenciales Cloud API */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} style={labelStyle}>
                        App ID *
                      </label>
                      <input
                        className={inputCls}
                        placeholder="123456789012345"
                        {...register("appId")}
                      />
                      {errors.appId && (
                        <div className={errCls} style={errStyle}>
                          {errors.appId.message}
                        </div>
                      )}
                      <div className={helpCls} style={helpStyle}>
                        App Settings → Basic → App ID.
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>
                        App Secret *
                      </label>
                      <input
                        type="password"
                        className={inputCls}
                        placeholder="••••••••••••••••"
                        {...register("appSecret")}
                      />
                      {errors.appSecret && (
                        <div className={errCls} style={errStyle}>
                          {errors.appSecret.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls} style={labelStyle}>
                      Permanent Access Token *
                    </label>
                    <input
                      type="password"
                      className={inputCls + " font-mono text-[12px]"}
                      placeholder="EAAX... (System User Token 2+ meses)"
                      {...register("accessToken")}
                    />
                    {errors.accessToken && (
                      <div className={errCls} style={errStyle}>
                        {errors.accessToken.message}
                      </div>
                    )}
                    <div className={helpCls} style={helpStyle}>
                      Crea uno en Business Settings → System Users →
                      Generate Token. Scopes: whatsapp_business_management, whatsapp_business_messaging
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} style={labelStyle}>
                        Phone Number ID *
                      </label>
                      <input
                        className={inputCls + " font-mono text-[12px]"}
                        placeholder="10581234567890"
                        {...register("phoneNumberId")}
                      />
                      {errors.phoneNumberId && (
                        <div className={errCls} style={errStyle}>
                          {errors.phoneNumberId.message}
                        </div>
                      )}
                      <div className={helpCls} style={helpStyle}>
                        WhatsApp → Phone Numbers → ID del número.
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>
                        WABA ID *
                      </label>
                      <input
                        className={inputCls + " font-mono text-[12px]"}
                        placeholder="111222333444555"
                        {...register("businessAccountId")}
                      />
                      {errors.businessAccountId && (
                        <div className={errCls} style={errStyle}>
                          {errors.businessAccountId.message}
                        </div>
                      )}
                      <div className={helpCls} style={helpStyle}>
                        WhatsApp → WhatsApp Business Account → ID.
                      </div>
                    </div>
                  </div>

                  <div
                    className="pt-2 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="font-semibold text-[13.5px] mb-3"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Datos del número
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className={labelCls} style={labelStyle}>
                          Nombre visible *
                        </label>
                        <input
                          className={inputCls}
                          placeholder="Mi Tienda"
                          {...register("displayName")}
                        />
                        {errors.displayName && (
                          <div className={errCls} style={errStyle}>
                            {errors.displayName.message}
                          </div>
                        )}
                      </div>
                      <div className="sm:col-span-1">
                        <label className={labelCls} style={labelStyle}>
                          Número *
                        </label>
                        <input
                          className={inputCls}
                          placeholder="+591 70000000"
                          {...register("phoneNumber")}
                        />
                        {errors.phoneNumber && (
                          <div className={errCls} style={errStyle}>
                            {errors.phoneNumber.message}
                            <div className={helpCls} style={helpStyle}>
                              El número de teléfono debe ser en formato +591 70000000.
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="sm:col-span-1">
                        <label className={labelCls} style={labelStyle}>
                          Categoría *
                        </label>
                        <select
                          className={inputCls}
                          {...register("category")}
                        >
                          {CATEGORIES_WABA.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <div className={errCls} style={errStyle}>
                            {errors.category.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1"
                      onClick={() => setStep(1)}
                    >
                      ← Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1"
                    >
                      {isSubmitting ? "Conectando..." : "Conectar WhatsApp"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}