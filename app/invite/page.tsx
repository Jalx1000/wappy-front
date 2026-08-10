"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { invitationsApi, type Invitation } from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/client";
import { Icon, type IconName } from "@/components/ui/Icon";

type State = "loading" | "ready" | "accepting" | "done" | "authRequired" | "error";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  member: "Miembro",
  client: "Cliente",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-background)" }}
    >
      <div
        className="w-full max-w-[420px] text-center"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 18,
          boxShadow: "var(--shadow-3)",
          padding: 32,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InviteInner() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const [state, setState] = useState<State>(token ? "loading" : "error");
  const [invite, setInvite] = useState<Invitation | null>(null);
  const [msg, setMsg] = useState(token ? "" : "Falta el token de invitación.");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    invitationsApi
      .byToken(token)
      .then((inv) => {
        if (cancelled) return;
        setInvite(inv);
        setState(inv.status === "pending" ? "ready" : "error");
        if (inv.status !== "pending") setMsg("Esta invitación ya no es válida.");
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) return setState("authRequired");
        setState("error");
        setMsg(
          e instanceof ApiError && e.status === 404
            ? "La invitación no existe o expiró."
            : e instanceof Error
              ? e.message
              : "No se pudo cargar la invitación.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const accept = async () => {
    setState("accepting");
    try {
      await invitationsApi.accept(token);
      setState("done");
      setTimeout(() => router.push("/app"), 1000);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return setState("authRequired");
      setState("error");
      setMsg(e instanceof Error ? e.message : "No se pudo aceptar la invitación.");
    }
  };

  const title = (t: string) => (
    <div
      className="text-[20px] font-bold"
      style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)", marginTop: 14 }}
    >
      {t}
    </div>
  );
  const sub = (t: string) => (
    <div className="text-[13.5px]" style={{ color: "var(--color-text-secondary)", marginTop: 6 }}>
      {t}
    </div>
  );
  const badge = (color: string, icon: IconName) => (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: 52, height: 52, background: color }}
    >
      <Icon name={icon} size={24} style={{ color: "var(--color-on-primary)" }} />
    </span>
  );

  if (state === "loading") return <Card>{sub("Cargando invitación…")}</Card>;

  if (state === "authRequired")
    return (
      <Card>
        {badge("var(--color-primary)", "user")}
        {title("Inicia sesión para aceptar")}
        {sub("Entra con la cuenta invitada y vuelve a abrir el enlace del correo.")}
        <Link href="/login" className="fobo-btn fobo-btn-primary fobo-btn-sm" style={{ marginTop: 18, display: "inline-flex" }}>
          Ir a iniciar sesión
        </Link>
      </Card>
    );

  if (state === "error")
    return (
      <Card>
        {badge("var(--color-error)", "alert")}
        {title("Invitación no disponible")}
        {sub(msg)}
        <Link href="/app" className="fobo-btn fobo-btn-secondary fobo-btn-sm" style={{ marginTop: 18, display: "inline-flex" }}>
          Ir a la app
        </Link>
      </Card>
    );

  if (state === "done")
    return (
      <Card>
        {badge("var(--color-success)", "check2")}
        {title("¡Listo!")}
        {sub("Te uniste al equipo. Redirigiendo…")}
      </Card>
    );

  // ready / accepting
  const role = invite?.role ? ROLE_LABEL[invite.role] ?? invite.role : "Miembro";
  return (
    <Card>
      {badge("var(--color-primary)", "users")}
      {title("Te invitaron a un equipo")}
      {sub(`Únete como ${role}.`)}
      <button
        onClick={accept}
        disabled={state === "accepting"}
        className="fobo-btn fobo-btn-primary fobo-btn-sm"
        style={{ marginTop: 20, width: "100%" }}
      >
        {state === "accepting" ? "Aceptando…" : "Aceptar invitación"}
      </button>
      <Link href="/app" className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)", marginTop: 12, display: "inline-block" }}>
        Ahora no
      </Link>
    </Card>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<Card>{null}</Card>}>
      <InviteInner />
    </Suspense>
  );
}
