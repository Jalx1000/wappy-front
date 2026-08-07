"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api/client";

// Real webhook endpoint (single, not per-brand): configure this in the Meta App
// Dashboard → WhatsApp → Configuration. The verify token must match the
// backend's META_WHATSAPP_WEBHOOK_VERIFY_TOKEN.
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100"}/api/v1/webhooks/whatsapp`;

// Embedded Signup (coexistence): the "Wappy" Meta app + its ES config.
const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";
const ES_CONFIG_ID = process.env.NEXT_PUBLIC_WHATSAPP_ES_CONFIG_ID ?? "";
const GRAPH_VERSION = "v25.0";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const CATEGORIES_WABA = [
  "Marketing",
  "Utility",
  "Authentication",
  "Service",
] as const;

const schema = z.object({
  wabaId: z
    .string()
    .min(5, "WABA ID es obligatorio")
    .regex(/^\d+$/, "Solo números"),
  phoneNumberId: z
    .string()
    .min(5, "Phone Number ID es obligatorio")
    .regex(/^\d+$/, "Solo números"),
  accessToken: z.string().min(20, "Token de al menos 20 caracteres"),
  displayName: z.string().max(40).optional(),
  phoneNumber: z.string().optional(),
  category: z.enum(CATEGORIES_WABA).optional(),
});

type WaConnectionForm = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  brand?: { id?: string | number; name?: string; slug?: string };
}

const labelCls = "text-[12px] font-semibold block mb-2";
const labelStyle = { color: "var(--color-text-secondary)" } as const;
const helpCls = "text-[11.5px] mt-1.5";
const helpStyle = { color: "var(--color-text-tertiary)" } as const;
const errCls = "text-[11.5px] mt-1.5";
const errStyle = { color: "var(--color-error)" } as const;

export function WhatsAppConnectModal({ onClose, onSuccess }: Props) {
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [esBusy, setEsBusy] = useState(false);
  const sessionInfo = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

  // Load the Facebook JS SDK once (Embedded Signup runs in a popup).
  useEffect(() => {
    if (!FB_APP_ID || document.getElementById("facebook-jssdk")) return;
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: FB_APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: GRAPH_VERSION,
      });
    };
    const s = document.createElement("script");
    s.id = "facebook-jssdk";
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    document.body.appendChild(s);
  }, []);

  // Session logging: capture waba_id / phone_number_id from Embedded Signup.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        typeof event.origin !== "string" ||
        !event.origin.endsWith("facebook.com")
      )
        return;
      try {
        const data = JSON.parse(event.data as string);
        if (data?.type === "WA_EMBEDDED_SIGNUP") {
          sessionInfo.current = {
            wabaId: data.data?.waba_id ?? sessionInfo.current.wabaId,
            phoneNumberId:
              data.data?.phone_number_id ?? sessionInfo.current.phoneNumberId,
          };
        }
      } catch {
        /* not every postMessage is JSON */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const launchCoexistence = () => {
    if (!window.FB) {
      toast("El SDK de Facebook aún no cargó, reintenta", "error");
      return;
    }
    if (!ES_CONFIG_ID) {
      toast("Falta NEXT_PUBLIC_WHATSAPP_ES_CONFIG_ID", "error");
      return;
    }
    sessionInfo.current = {};
    setEsBusy(true);
    window.FB.login(
      (response: { authResponse?: { code?: string } }) => {
        const code = response?.authResponse?.code;
        const { wabaId, phoneNumberId } = sessionInfo.current;
        if (!code || !wabaId) {
          setEsBusy(false);
          toast("Flujo cancelado o incompleto", "error");
          return;
        }
        api
          .post("/connections/whatsapp/coexistence", {
            code,
            wabaId,
            phoneNumberId,
          })
          .then(() => {
            toast("WhatsApp coexistence conectado ✓", "success");
            onSuccess?.();
            onClose();
          })
          .catch((e) =>
            toast(
              e instanceof ApiError ? e.message : "Error en el onboarding",
              "error",
            ),
          )
          .finally(() => setEsBusy(false));
      },
      {
        config_id: ES_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        // `features: app_only_install` is what triggers the Coexistence
        // "connect your existing WhatsApp Business account" screen. Without it
        // the flow only offers to CREATE a new WABA.
        extras: { version: "v4", features: [{ name: "app_only_install" }] },
      },
    );
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaConnectionForm>({
    resolver: zodResolver(schema),
  });

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
    try {
      await api.post("/connections/whatsapp/cloud-api", {
        wabaId: data.wabaId,
        phoneNumberId: data.phoneNumberId,
        accessToken: data.accessToken,
        displayName: data.displayName || undefined,
        phoneNumber: data.phoneNumber || undefined,
        category: data.category || undefined,
      });
      toast("WhatsApp Cloud API conectado ✓", "success");
      onSuccess?.();
      onClose();
    } catch (e) {
      toast(
        e instanceof ApiError ? e.message : "No se pudo conectar",
        "error",
      );
    }
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
          className="w-[560px] max-w-full my-6"
          style={{
            background: "var(--color-surface)",
            borderRadius: 20,
            boxShadow: "var(--shadow-3)",
            padding: 24,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div
                className="font-semibold text-[16px]"
                style={{ color: "var(--color-text-primary)" }}
              >
                Conectar WhatsApp — Cloud API
              </div>
              <div
                className="text-[12px] mt-0.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Pega tus credenciales de Cloud API para validar el envío y la
                recepción.
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

          {/* Embedded Signup (coexistence) — primary action */}
          <button
            type="button"
            onClick={launchCoexistence}
            disabled={esBusy}
            className="w-full flex items-center justify-center gap-2 rounded-[12px] py-3 font-semibold cursor-pointer mb-2"
            style={{
              background: "#25D366",
              color: "#fff",
              border: "none",
              opacity: esBusy ? 0.7 : 1,
            }}
          >
            <Icon name="inbox" size={16} />
            {esBusy
              ? "Abriendo Embedded Signup…"
              : "Conectar con Embedded Signup (Coexistence)"}
          </button>
          <div
            className="text-[11.5px] text-center mb-4"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Vincula un número existente de la WhatsApp Business app. Requiere
            pop-ups habilitados.
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--color-border)" }}
            />
            <span
              className="text-[11px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              o conecta manualmente por Cloud API
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--color-border)" }}
            />
          </div>

          {/* Webhook reference */}
          <div
            className="rounded-[12px] border p-3 mb-4"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-background)",
            }}
          >
            <label className={labelCls} style={labelStyle}>
              Callback URL (configúrala en Meta → WhatsApp → Configuration)
            </label>
            <div className="flex gap-2">
              <input readOnly className="fobo-input flex-1" value={WEBHOOK_URL} />
              <button
                type="button"
                className="fobo-btn fobo-btn-secondary fobo-btn-sm"
                onClick={() => copy("url", WEBHOOK_URL)}
              >
                <Icon name={copied === "url" ? "check" : "copy"} size={14} />
              </button>
            </div>
            <div className={helpCls} style={helpStyle}>
              El Verify Token en Meta debe coincidir con{" "}
              <code>META_WHATSAPP_WEBHOOK_VERIFY_TOKEN</code> del backend. Suscribe
              los campos <code>messages</code> y <code>account_update</code>.
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls} style={labelStyle}>
                  WhatsApp Business Account ID (WABA)
                </label>
                <input
                  className="fobo-input w-full"
                  placeholder="102290129340398"
                  {...register("wabaId")}
                />
                {errors.wabaId && (
                  <div className={errCls} style={errStyle}>
                    {errors.wabaId.message}
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>
                  Phone Number ID
                </label>
                <input
                  className="fobo-input w-full"
                  placeholder="106540352242922"
                  {...register("phoneNumberId")}
                />
                {errors.phoneNumberId && (
                  <div className={errCls} style={errStyle}>
                    {errors.phoneNumberId.message}
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>
                  Access Token (permanente / system user)
                </label>
                <input
                  className="fobo-input w-full font-mono text-[12px]"
                  placeholder="EAAG…"
                  {...register("accessToken")}
                />
                {errors.accessToken && (
                  <div className={errCls} style={errStyle}>
                    {errors.accessToken.message}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={labelStyle}>
                    Nombre visible (opcional)
                  </label>
                  <input
                    className="fobo-input w-full"
                    placeholder="Mi Negocio"
                    {...register("displayName")}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>
                    Número (opcional)
                  </label>
                  <input
                    className="fobo-input w-full"
                    placeholder="+591 70000000"
                    {...register("phoneNumber")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="fobo-btn fobo-btn-ghost fobo-btn-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="fobo-btn fobo-btn-primary fobo-btn-sm"
                style={{ opacity: isSubmitting ? 0.6 : 1 }}
              >
                {isSubmitting ? "Conectando…" : "Conectar"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
