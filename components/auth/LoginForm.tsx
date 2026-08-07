"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { WappyLogo } from "@/components/shell/WappyLogo";

const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});
type FormData = z.infer<typeof schema>;

type View = "login" | "forgot" | "sent";

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
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
  const router = useRouter();

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

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Brand panel */}
      <div
        className="hidden lg:flex flex-col flex-none w-[44%] min-w-[380px] relative overflow-hidden p-[48px]"
        style={{
          background: "var(--color-brand-gradient)",
          color: "#fff",
        }}
      >
        {/* bg circles */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: -130, top: -130,
            width: 320, height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            right: -60, bottom: -160,
            width: 280, height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        {/* Logo */}
        <div className="flex items-center gap-3 flex-none">
          <div
            className="flex items-center justify-center rounded-[10px] font-bold"
            style={{
              width: 38, height: 38,
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.25)",
              fontFamily: "var(--font-display)",
              fontSize: 20,
              letterSpacing: "-0.04em",
            }}
          >
            f
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 23,
              letterSpacing: "-0.04em",
            }}
          >
            fobo
          </span>
          <span
            className="text-[10px] font-bold px-[7px] py-[3px] rounded-[5px]"
            style={{
              background: "rgba(255,255,255,0.16)",
              letterSpacing: "0.07em",
            }}
          >
            AGENCY
          </span>
        </div>

        {/* Pitch */}
        <div className="flex-1 flex flex-col justify-center max-w-[420px]">
          <h1
            className="m-0 leading-[1.12] tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 38,
            }}
          >
            El centro de operaciones de tu agencia.
          </h1>
          <p
            className="text-[15px] leading-[1.55] mt-4 mb-[30px]"
            style={{ opacity: 0.85 }}
          >
            Todas tus marcas, redes, campañas y reportes en un solo lugar.
          </p>
          <div className="flex flex-col gap-[14px]">
            {[
              ["chart",    "Analítica social, web y paid unificada"],
              ["calendar", "Contenido, calendario y aprobaciones"],
              ["star",     "Influencers, campañas y reportes por marca"],
            ].map(([ic, text]) => (
              <div key={ic} className="flex items-center gap-3 text-[14px] font-medium">
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: "rgba(255,255,255,0.14)",
                  }}
                >
                  <Icon name={ic as "chart"} size={16} color="#fff" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
        <div className="text-[12px] flex-none" style={{ opacity: 0.6 }}>
          © 2026 Fobo · Santa Cruz de la Sierra
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="w-full max-w-[392px]"
        >
          {view === "login" && (
            <form onSubmit={handleSubmit(doLogin)} className="flex flex-col gap-[18px]">
              <div className="mb-1">
                <h2
                  className="m-0 tracking-[-0.025em]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 27,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Inicia sesión
                </h2>
                <p className="text-[14px] mt-[7px] m-0" style={{ color: "var(--color-text-secondary)" }}>
                  Bienvenida de vuelta. Tu equipo te espera.
                </p>
              </div>

              <button
                type="button"
                className="fobo-btn fobo-btn-secondary w-full gap-[10px]"
                disabled={!!busy}
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
                  className="fobo-input"
                  placeholder="tu@agencia.com"
                  autoFocus
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-[12.5px] flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                    <Icon name="x" size={13} /> {errors.email.message}
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
                    className="ml-auto border-none bg-transparent cursor-pointer text-[12.5px] font-semibold p-0"
                    style={{ color: "var(--color-primary-ink)", fontFamily: "var(--font-ui)" }}
                    onClick={() => { setServerErr(null); setView("forgot"); }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    className="fobo-input"
                    placeholder="••••••••"
                    style={{ paddingRight: 46 }}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-[6px] top-1/2 -translate-y-1/2 w-9 h-9 border-none bg-transparent cursor-pointer flex items-center justify-center rounded-[8px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    <Icon name={showPass ? "eyeOff" : "eye"} size={17} />
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[12.5px] flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                    <Icon name="x" size={13} /> {errors.password.message}
                  </span>
                )}
              </div>

              {serverErr && (
                <div
                  className="text-[12.5px] flex items-center gap-[5px]"
                  style={{ color: "var(--color-error)" }}
                >
                  <Icon name="x" size={14} /> {serverErr}
                </div>
              )}

              <button
                type="submit"
                className="fobo-btn fobo-btn-primary w-full"
                disabled={!!busy}
              >
                {busy === "email" ? "Entrando…" : "Entrar"}
              </button>

              <div className="text-[13px] text-center" style={{ color: "var(--color-text-secondary)" }}>
                ¿Tu agencia aún no usa Fobo?{" "}
                <a
                  href="#"
                  className="font-semibold no-underline"
                  style={{ color: "var(--color-primary-ink)" }}
                  onClick={(e) => e.preventDefault()}
                >
                  Solicita una demo
                </a>
              </div>
              <div
                className="text-[11px] text-center mt-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                demo · cualquier correo y contraseña funcionan
              </div>
            </form>
          )}

          {view === "forgot" && (
            <form
              onSubmit={(e) => { e.preventDefault(); sendReset(); }}
              className="flex flex-col gap-[18px]"
            >
              <div className="mb-1">
                <h2
                  className="m-0 tracking-[-0.025em]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 27,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Recupera tu acceso
                </h2>
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
                  className="fobo-input"
                  placeholder="tu@agencia.com"
                  autoFocus
                />
              </div>
              <button type="submit" className="fobo-btn fobo-btn-primary w-full">
                Enviar enlace
              </button>
              <button
                type="button"
                className="fobo-btn fobo-btn-ghost w-full"
                onClick={() => setView("login")}
              >
                ← Volver a iniciar sesión
              </button>
            </form>
          )}

          {view === "sent" && (
            <div className="flex flex-col items-center text-center gap-4">
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 64, height: 64,
                  background: "var(--color-success-bg)",
                  color: "var(--color-success-dark)",
                }}
              >
                <Icon name="mail" size={28} color="var(--color-success-dark)" />
              </span>
              <h2
                className="m-0 tracking-[-0.025em]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 24,
                  color: "var(--color-text-primary)",
                }}
              >
                Revisa tu correo
              </h2>
              <p className="text-[14px] m-0 leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
                Enviamos un enlace de recuperación a<br />
                <strong style={{ color: "var(--color-text-primary)" }}>
                  {getValues("email") || "tu correo"}
                </strong>
              </p>
              <button
                className="fobo-btn fobo-btn-secondary mt-2"
                onClick={() => setView("login")}
              >
                Volver a iniciar sesión
              </button>
              <button
                className="border-none bg-transparent cursor-pointer text-[12.5px] font-semibold"
                style={{ color: "var(--color-primary-ink)", fontFamily: "var(--font-ui)" }}
                onClick={() => setView("forgot")}
              >
                ¿No llegó? Reenviar
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
