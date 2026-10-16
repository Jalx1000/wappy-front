"use client";

import { useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/Icon";
import { WappyLogo } from "@/components/shell/WappyLogo";

const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});
type FormData = z.infer<typeof schema>;

type View = "login" | "forgot" | "sent";

/* The login mirrors the marketing site's always-light "sky" aesthetic. The
   brand panel uses the same sky gradient + lime accents, and the whole page
   pins a light, marketing-aligned palette (SKY_LIGHT_TOKENS) so it matches the
   public site regardless of the user's system light/dark theme. */
const SKY_GRADIENT =
  "linear-gradient(180deg, #5BB8F5 0%, #86CCF6 34%, #BFE3FA 64%, #EAF6FE 100%)";
const LIME = "#C7F303";
const INK = "#0E1300";

const SKY_LIGHT_TOKENS = {
  colorScheme: "light",
  background: "var(--color-background)",
  "--color-background": "#F6F7F9",
  "--color-surface": "#FFFFFF",
  "--color-text-primary": INK,
  "--color-text-secondary": "#5A6470",
  "--color-text-tertiary": "#9AA0A8",
  "--color-border": "#E7EAEE",
  "--color-primary": INK,
  "--color-on-primary": "#FFFFFF",
  "--color-primary-ink": INK,
  "--color-primary-hover": "#2C2C2C",
  "--color-primary-light": "rgba(199,243,3,0.45)",
  "--color-primary-subtle": "#F1FBC6",
  "--neutral-50": "#F6F7F9",
  "--color-error": "#CF3136",
  "--color-error-bg": "#FDDEDE",
  "--color-success-bg": "#D6F4DF",
  "--color-success-dark": "#0A5818",
} as CSSProperties;

const FEATURES: ReadonlyArray<readonly [IconName, string]> = [
  ["whatsapp", "WhatsApp, email y chat web en una bandeja compartida"],
  ["bot", "Responde en segundos con tu Copilot de IA"],
  ["users", "Asignaciones, filtros y colaboración en tiempo real"],
];

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3a7.24 7.24 0 0 1-10.78-3.8H1.29v3.1A12 12 0 0 0 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.29a12 12 0 0 0 0 10.78l3.99-3.1z"/>
      <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.97 11.97 0 0 0 1.29 6.6l3.99 3.1A7.24 7.24 0 0 1 12 4.77z"/>
    </svg>
  );
}

export function LoginForm() {
  const [view, setView] = useState<View>("login");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const doLogin = async (data: FormData) => {
    setBusy("email");
    setServerErr(null);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setBusy(null);
    if (res?.error) {
      setServerErr("Correo o contraseña incorrectos.");
    } else {
      router.replace("/app");
    }
  };

  const doGoogleLogin = async () => {
    setBusy("google");
    await signIn("google", { callbackUrl: "/app" });
  };

  const sendReset = () => {
    setView("sent");
  };

  const headingStyle = {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 27,
    color: "var(--color-text-primary)",
  } as const;

  return (
    <div className="flex min-h-screen" style={SKY_LIGHT_TOKENS}>
      {/* ── Brand panel ("sky", hidden on mobile) ─────────────────────────── */}
      <aside
        className="relative hidden lg:flex flex-col flex-none w-[46%] min-w-[400px] max-w-[560px] overflow-hidden p-12"
        style={{
          background: SKY_GRADIENT,
          color: INK,
          borderRight: "1px solid rgba(14,19,0,0.06)",
        }}
      >
        {/* decorative clouds */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{ top: 80, left: -40, width: 240, height: 110, borderRadius: 9999, background: "rgba(255,255,255,0.6)", filter: "blur(40px)" }}
        />
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{ bottom: 40, right: -30, width: 220, height: 100, borderRadius: 9999, background: "rgba(255,255,255,0.5)", filter: "blur(40px)" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3 flex-none">
          <img
            src="/wappy-logotipo.jpg"
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            className="rounded-[10px]"
            style={{ boxShadow: "0 2px 8px rgba(20,40,80,0.12)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 23,
              letterSpacing: "-0.04em",
            }}
          >
            Wappy
          </span>
        </div>

        {/* Pitch */}
        <div className="relative flex-1 flex flex-col justify-center max-w-[440px]">
          <span
            className="inline-flex items-center gap-2 self-start mb-5"
            style={{
              height: 30,
              padding: "0 13px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 2px 8px rgba(20,40,80,0.05)",
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: LIME }} />
            Bandeja compartida · IA
          </span>
          <p
            className="m-0 leading-[1.12] tracking-[-0.03em]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 38 }}
          >
            El soporte que se siente{" "}
            <span style={{ borderBottom: `3px solid ${LIME}`, paddingBottom: 2 }}>
              sin esfuerzo.
            </span>
          </p>
          <p className="text-[15px] leading-[1.55] mt-4 mb-8" style={{ color: "rgba(14,19,0,0.66)" }}>
            Cada conversación de WhatsApp, email y chat web — en una bandeja
            compartida y veloz. Responde en segundos con tu Copilot de IA.
          </p>

          <ul className="flex flex-col gap-[14px] m-0 p-0 list-none">
            {FEATURES.map(([icon, text]) => (
              <li key={icon} className="flex items-center gap-3 text-[14px] font-medium">
                <span
                  className="flex items-center justify-center flex-none"
                  style={{ width: 26, height: 26, borderRadius: 9999, background: LIME }}
                >
                  <Icon name={icon} size={14} color={INK} />
                </span>
                <span style={{ color: "rgba(14,19,0,0.82)" }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[12px] flex-none" style={{ color: "rgba(14,19,0,0.5)" }}>
          SOC 2 compliant · GDPR-ready
        </div>
      </aside>

      {/* ── Form panel ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[392px]">
          {/* Mobile-only brand header (brand panel is hidden < lg) */}
          <div className="lg:hidden mb-9 flex justify-center">
            <WappyLogo />
          </div>

          <motion.div
            key={view}
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {view === "login" && (
              <form
                onSubmit={handleSubmit(doLogin)}
                noValidate
                className="flex flex-col gap-[18px]"
              >
                <div className="mb-1">
                  <h1 className="m-0 tracking-[-0.025em]" style={headingStyle}>
                    Inicia sesión
                  </h1>
                  <p className="text-[14px] mt-[7px] m-0" style={{ color: "var(--color-text-secondary)" }}>
                    Bienvenido de vuelta. Tu equipo te espera.
                  </p>
                </div>

                <button
                  type="button"
                  className="fobo-btn fobo-btn-secondary w-full gap-[10px]"
                  disabled={!!busy}
                  aria-busy={busy === "google"}
                  onClick={doGoogleLogin}
                >
                  {busy === "google" ? "Conectando…" : <><GoogleIcon /> Continuar con Google</>}
                </button>

                <div
                  className="flex items-center gap-3 text-[12px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <span className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
                  o con tu correo
                  <span className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
                </div>

                <div className="flex flex-col gap-[7px]">
                  <label
                    htmlFor="email"
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Correo
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="fobo-input"
                    placeholder="tu@agencia.com"
                    autoFocus
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                  />
                  {errors.email && (
                    <span
                      id="email-error"
                      role="alert"
                      className="text-[12.5px] flex items-center gap-1"
                      style={{ color: "var(--color-error)" }}
                    >
                      <Icon name="warning" size={13} /> {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-[7px]">
                  <div className="flex items-center">
                    <label
                      htmlFor="password"
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      className="ml-auto border-none bg-transparent cursor-pointer text-[12.5px] font-semibold p-0 fobo-focus-ring"
                      style={{ color: "var(--color-primary-ink)", fontFamily: "var(--font-ui)" }}
                      onClick={() => { setServerErr(null); setResetEmail(getValues("email") || ""); setView("forgot"); }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      className="fobo-input"
                      placeholder="••••••••"
                      style={{ paddingRight: 46 }}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={showPass}
                      className="absolute right-[6px] top-1/2 -translate-y-1/2 w-9 h-9 border-none bg-transparent cursor-pointer flex items-center justify-center rounded-[8px] fobo-focus-ring"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      <Icon name={showPass ? "eyeOff" : "eye"} size={17} />
                    </button>
                  </div>
                  {errors.password && (
                    <span
                      id="password-error"
                      role="alert"
                      className="text-[12.5px] flex items-center gap-1"
                      style={{ color: "var(--color-error)" }}
                    >
                      <Icon name="warning" size={13} /> {errors.password.message}
                    </span>
                  )}
                </div>

                {serverErr && (
                  <div
                    role="alert"
                    className="text-[12.5px] flex items-center gap-[6px] rounded-[10px] px-3 py-2"
                    style={{ color: "var(--color-error)", background: "var(--color-error-bg)" }}
                  >
                    <Icon name="warning" size={14} /> {serverErr}
                  </div>
                )}

                <button
                  type="submit"
                  className="fobo-btn fobo-btn-primary w-full"
                  disabled={!!busy}
                  aria-busy={busy === "email"}
                >
                  {busy === "email" ? "Entrando…" : "Entrar"}
                </button>

                <div className="text-[13px] text-center" style={{ color: "var(--color-text-secondary)" }}>
                  ¿Tu empresa aún no usa Wappy?{" "}
                  <a
                    href="#"
                    className="font-semibold no-underline rounded fobo-focus-ring"
                    style={{ color: "var(--color-primary-ink)" }}
                    onClick={(e) => e.preventDefault()}
                  >
                    Solicita una demo
                  </a>
                </div>
                <p
                  className="text-[11px] text-center mt-1 m-0"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}
                >
                  demo · cualquier correo y contraseña funcionan
                </p>
              </form>
            )}

            {view === "forgot" && (
              <form
                onSubmit={(e) => { e.preventDefault(); sendReset(); }}
                noValidate
                className="flex flex-col gap-[18px]"
              >
                <div className="mb-1">
                  <h1 className="m-0 tracking-[-0.025em]" style={headingStyle}>
                    Recupera tu acceso
                  </h1>
                  <p className="text-[14px] mt-[7px] m-0 leading-[1.5]" style={{ color: "var(--color-text-secondary)" }}>
                    Te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                </div>
                <div className="flex flex-col gap-[7px]">
                  <label
                    htmlFor="forgot-email"
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Correo
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="fobo-input"
                    placeholder="tu@agencia.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="fobo-btn fobo-btn-primary w-full">
                  Enviar enlace
                </button>
                <button
                  type="button"
                  className="fobo-btn fobo-btn-ghost w-full gap-[6px]"
                  onClick={() => setView("login")}
                >
                  <Icon name="chevronL" size={15} /> Volver a iniciar sesión
                </button>
              </form>
            )}

            {view === "sent" && (
              <div className="flex flex-col items-center text-center gap-4">
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 64, height: 64, background: "var(--color-success-bg)", color: "var(--color-success-dark)" }}
                >
                  <Icon name="mail" size={28} color="var(--color-success-dark)" />
                </span>
                <h1 className="m-0 tracking-[-0.025em]" style={{ ...headingStyle, fontSize: 24 }}>
                  Revisa tu correo
                </h1>
                <p className="text-[14px] m-0 leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
                  Enviamos un enlace de recuperación a<br />
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    {resetEmail || "tu correo"}
                  </strong>
                </p>
                <button
                  className="fobo-btn fobo-btn-secondary w-full mt-2"
                  onClick={() => setView("login")}
                >
                  Volver a iniciar sesión
                </button>
                <button
                  className="border-none bg-transparent cursor-pointer text-[12.5px] font-semibold rounded fobo-focus-ring"
                  style={{ color: "var(--color-primary-ink)", fontFamily: "var(--font-ui)" }}
                  onClick={() => setView("forgot")}
                >
                  ¿No llegó? Reenviar
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
