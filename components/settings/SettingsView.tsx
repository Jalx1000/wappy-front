"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import {
  useMe,
  useUpdateMe,
  useBrandMembers,
  useRemoveMember,
} from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { ApiError } from "@/lib/api/client";
import { InviteMemberModal } from "./InviteMemberModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import type { BrandMember, MemberRole } from "@/lib/api/members";

const SECTIONS = [
  { id: "account", label: "Mi cuenta", icon: "user" as const },
  { id: "security", label: "Seguridad", icon: "shield" as const },
  { id: "team", label: "Equipo", icon: "users" as const },
  { id: "notifs", label: "Notificaciones", icon: "bell" as const },
  { id: "session", label: "Sesión", icon: "logout" as const },
];

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-ui)",
};

type NotifPrefs = {
  reports: boolean;
  connections: boolean;
  approvals: boolean;
  insights: boolean;
  digest: boolean;
};

const NOTIF_DEFAULTS: NotifPrefs = {
  reports: true,
  connections: true,
  approvals: true,
  insights: false,
  digest: true,
};
const NOTIF_KEY = "fobo-notif-prefs";

function loadNotifs(): NotifPrefs {
  if (typeof window === "undefined") return NOTIF_DEFAULTS;
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return NOTIF_DEFAULTS;
    return { ...NOTIF_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return NOTIF_DEFAULTS;
  }
}

function saveNotifs(p: NotifPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_KEY, JSON.stringify(p));
}

export function SettingsView() {
  const [active, setActive] = useState<string>("account");

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="mb-6">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: "var(--color-text-primary)",
          }}
        >
          Configuración
        </h1>
        <p
          className="text-[14px] mt-[5px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Administra tu cuenta, el equipo y las preferencias del workspace
        </p>
      </div>

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "220px 1fr", maxWidth: 1200 }}
      >
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className="flex items-center gap-2 text-left px-3 py-[10px] rounded-[9px] border-none cursor-pointer text-[14px] font-medium"
              style={{
                fontFamily: "var(--font-ui)",
                background:
                  active === s.id
                    ? "var(--color-primary-subtle)"
                    : "transparent",
                color:
                  active === s.id
                    ? "var(--color-primary-ink)"
                    : "var(--color-text-secondary)",
              }}
            >
              <Icon name={s.icon} size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        <div>
          {active === "account" && <AccountSection />}
          {active === "security" && <SecuritySection />}
          {active === "team" && <TeamSection />}
          {active === "notifs" && <NotifsSection />}
          {active === "session" && <SessionSection />}
        </div>
      </div>
    </div>
  );
}

// ── Mi cuenta ────────────────────────────────────────────────────────────────
const accountSchema = z.object({
  firstName: z.string().min(1, "Requerido").max(80),
  lastName: z.string().min(1, "Requerido").max(80),
  email: z.string().email("Email inválido"),
});
type AccountForm = z.infer<typeof accountSchema>;

function AccountSection() {
  const toast = useToast();
  const { data: me, isPending } = useMe();
  const updateMe = useUpdateMe();
  const [serverErr, setServerErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  useEffect(() => {
    if (me) {
      reset({
        firstName: me.firstName ?? "",
        lastName: me.lastName ?? "",
        email: me.email,
      });
    }
  }, [me, reset]);

  const submit = async (data: AccountForm) => {
    setServerErr(null);
    try {
      await updateMe.mutateAsync(data);
      toast("Cuenta actualizada ✓");
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422 && e.details && typeof e.details === "object") {
          const det = e.details as { errors?: Record<string, string> };
          const first = det.errors ? Object.values(det.errors)[0] : undefined;
          setServerErr(first ?? e.message);
          return;
        }
        setServerErr(e.message);
        return;
      }
      setServerErr("Error inesperado");
    }
  };

  if (isPending) return <SectionSkeleton />;
  if (!me) return <SectionError message="No se pudo cargar tu cuenta" />;

  return (
    <div className="fobo-card p-6">
      <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div
          className="flex items-center justify-center text-white font-bold text-[20px] rounded-[14px] flex-shrink-0"
          style={{ width: 56, height: 56, background: "var(--color-brand-gradient)", fontFamily: "var(--font-display)" }}
        >
          {(me.firstName?.[0] ?? "") + (me.lastName?.[0] ?? "")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-bold" style={{ color: "var(--color-text-primary)" }}>
            {me.firstName} {me.lastName}
          </div>
          <div className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>
            {me.email} · ID #{me.id} · miembro desde{" "}
            {new Date(me.createdAt).toLocaleDateString("es-BO", { month: "long", year: "numeric" })}
          </div>
        </div>
        <span
          className="text-[12px] font-semibold px-3 py-[5px] rounded-full"
          style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}
        >
          {me.role.name}
        </span>
      </div>

      <form onSubmit={handleSubmit(submit)}>
        {serverErr && (
          <div
            className="mb-4 px-3 py-2 rounded-[10px] text-[13px]"
            style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}
          >
            {serverErr}
          </div>
        )}

        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Nombre" error={errors.firstName?.message}>
            <input
              {...register("firstName")}
              disabled={isSubmitting}
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
            />
          </Field>
          <Field label="Apellido" error={errors.lastName?.message}>
            <input
              {...register("lastName")}
              disabled={isSubmitting}
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
            />
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Email" error={errors.email?.message} hint="Cambiarlo no actualiza la sesión actual — vuelve a iniciar sesión después">
              <input
                {...register("email")}
                type="email"
                disabled={isSubmitting}
                className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
                style={inputStyle}
              />
            </Field>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="fobo-btn fobo-btn-primary fobo-btn-sm"
          >
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Seguridad ───────────────────────────────────────────────────────────────
const securitySchema = z
  .object({
    oldPassword: z.string().min(4, "Mínimo 4 caracteres"),
    password: z.string().min(4, "Mínimo 4 caracteres"),
    confirm: z.string().min(4),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });
type SecurityForm = z.infer<typeof securitySchema>;

function SecuritySection() {
  const toast = useToast();
  const updateMe = useUpdateMe();
  const [serverErr, setServerErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SecurityForm>({
    resolver: zodResolver(securitySchema),
    defaultValues: { oldPassword: "", password: "", confirm: "" },
  });

  const submit = async (data: SecurityForm) => {
    setServerErr(null);
    try {
      await updateMe.mutateAsync({
        oldPassword: data.oldPassword,
        password: data.password,
      });
      toast("Contraseña actualizada ✓");
      reset();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422 && e.details && typeof e.details === "object") {
          const det = e.details as { errors?: Record<string, string> };
          if (det.errors?.oldPassword) {
            setServerErr("La contraseña actual no es correcta");
            return;
          }
          const first = det.errors ? Object.values(det.errors)[0] : undefined;
          setServerErr(first ?? e.message);
          return;
        }
        setServerErr(e.message);
        return;
      }
      setServerErr("Error inesperado");
    }
  };

  return (
    <div className="fobo-card p-6">
      <div className="text-[16px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Cambiar contraseña
      </div>
      <p className="text-[13.5px] mb-5" style={{ color: "var(--color-text-secondary)" }}>
        Te pediremos tu contraseña actual antes de aplicar el cambio.
      </p>

      <form onSubmit={handleSubmit(submit)}>
        {serverErr && (
          <div
            className="mb-4 px-3 py-2 rounded-[10px] text-[13px]"
            style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}
          >
            {serverErr}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Field label="Contraseña actual" error={errors.oldPassword?.message}>
            <input
              {...register("oldPassword")}
              type="password"
              disabled={isSubmitting}
              autoComplete="current-password"
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
            />
          </Field>
          <Field label="Nueva contraseña" error={errors.password?.message}>
            <input
              {...register("password")}
              type="password"
              disabled={isSubmitting}
              autoComplete="new-password"
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
            />
          </Field>
          <Field label="Confirmar nueva contraseña" error={errors.confirm?.message}>
            <input
              {...register("confirm")}
              type="password"
              disabled={isSubmitting}
              autoComplete="new-password"
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
            />
          </Field>
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="fobo-btn fobo-btn-primary fobo-btn-sm"
          >
            {isSubmitting ? "Actualizando…" : "Actualizar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Equipo ──────────────────────────────────────────────────────────────────
const ROLE_PALETTE: Record<MemberRole, { bg: string; color: string; label: string }> = {
  admin: { bg: "var(--color-primary-subtle)", color: "var(--color-primary-ink)", label: "Admin" },
  member: { bg: "var(--color-background)", color: "var(--color-text-secondary)", label: "Miembro" },
  client: { bg: "var(--color-warning-bg)", color: "var(--color-warning)", label: "Cliente" },
};

function TeamSection() {
  const toast = useToast();
  const { activeBrand } = useUIStore();
  const { data: me } = useMe();
  const { data: members = [], isPending } = useBrandMembers(activeBrand?.id);
  const removeMember = useRemoveMember(activeBrand?.id);
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleRemove = (m: BrandMember) => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      `¿Quitar al usuario #${m.userId} de ${activeBrand?.name}?`,
    );
    if (!ok) return;
    removeMember.mutate(m.userId, {
      onSuccess: () => toast(`Usuario #${m.userId} removido`, "info"),
      onError: () => toast("No se pudo remover", "info"),
    });
  };

  if (!activeBrand) return <SectionError message="Selecciona una marca primero" />;

  return (
    <>
      <div className="fobo-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <div className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Equipo de {activeBrand.name}
            </div>
            <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
              {members.length} miembro{members.length === 1 ? "" : "s"}
            </div>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1"
          >
            <Icon name="plus" size={14} /> Invitar
          </button>
        </div>

        <div
          className="px-5 py-3 text-[12px]"
          style={{
            background: "var(--color-background)",
            color: "var(--color-text-tertiary)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <Icon name="info" size={12} /> El backend devuelve solo el userId.
          Para mostrar nombres y emails reales se necesita un endpoint enriquecido (TODO).
        </div>

        {isPending ? (
          <div className="p-5 text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
            Cargando miembros…
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-[14px] mb-2" style={{ color: "var(--color-text-primary)" }}>
              Aún no hay miembros
            </div>
            <div className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>
              Invita a tu equipo para colaborar en {activeBrand.name}
            </div>
          </div>
        ) : (
          members.map((m, i) => {
            const isMe = me?.id === m.userId;
            const palette = ROLE_PALETTE[m.role];
            return (
              <div
                key={m.id}
                className="flex items-center gap-4 px-5 py-[14px]"
                style={{
                  borderBottom: i < members.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <span
                  className="flex items-center justify-center text-white font-bold text-[13px] rounded-full flex-shrink-0"
                  style={{ width: 38, height: 38, background: "var(--color-secondary-ink)" }}
                >
                  U{m.userId}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Usuario #{m.userId} {isMe && <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(tú)</span>}
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                    Miembro desde {new Date(m.createdAt).toLocaleDateString("es-BO")}
                  </div>
                </div>
                <span
                  className="text-[12.5px] font-medium px-3 py-[4px] rounded-full"
                  style={{ background: palette.bg, color: palette.color }}
                >
                  {palette.label}
                </span>
                {!isMe && (
                  <button
                    onClick={() => handleRemove(m)}
                    className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                    title="Remover del equipo"
                    style={{ color: "var(--color-error)" }}
                  >
                    <Icon name="x" size={15} color="var(--color-error)" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {inviteOpen && (
          <InviteMemberModal
            brandId={activeBrand.id}
            brandName={activeBrand.name}
            onClose={() => setInviteOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Notificaciones ──────────────────────────────────────────────────────────
function NotifsSection() {
  const toast = useToast();
  const [prefs, setPrefs] = useState<NotifPrefs>(NOTIF_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(loadNotifs());
    setLoaded(true);
  }, []);

  const update = (key: keyof NotifPrefs, v: boolean) => {
    const next = { ...prefs, [key]: v };
    setPrefs(next);
    saveNotifs(next);
    toast("Preferencia guardada", "info");
  };

  const items: { key: keyof NotifPrefs; label: string; sub: string }[] = [
    { key: "reports", label: "Reportes generados", sub: "Cuando un reporte esté listo" },
    { key: "connections", label: "Alertas de conexión", sub: "Tokens expirados o errores de sincronización" },
    { key: "approvals", label: "Aprobaciones pendientes", sub: "Piezas que esperan tu revisión" },
    { key: "insights", label: "Insights de IA", sub: "Nuevos hallazgos y recomendaciones" },
    { key: "digest", label: "Resumen semanal", sub: "Digest de desempeño todos los lunes" },
  ];

  return (
    <div className="fobo-card p-6">
      <div className="text-[16px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Preferencias de notificación
      </div>
      <div
        className="mb-5 px-3 py-[10px] rounded-[10px] text-[12.5px]"
        style={{
          background: "var(--color-primary-subtle)",
          color: "var(--color-primary-ink)",
        }}
      >
        <Icon name="info" size={13} /> Estas preferencias se guardan solo en este
        navegador. El backend de notificaciones es trabajo pendiente.
      </div>

      {loaded &&
        items.map((it) => (
          <Toggle
            key={it.key}
            label={it.label}
            sub={it.sub}
            value={prefs[it.key]}
            onChange={(v) => update(it.key, v)}
          />
        ))}
    </div>
  );
}

// ── Sesión ──────────────────────────────────────────────────────────────────
function SessionSection() {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <div className="fobo-card p-6 mb-4">
        <div className="text-[16px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Cerrar sesión
        </div>
        <p className="text-[13.5px] mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Cierra la sesión actual y vuelve a la pantalla de login. Tendrás que
          autenticarte de nuevo para acceder al portal.
        </p>
        <button
          onClick={handleSignOut}
          className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-2"
        >
          <Icon name="logout" size={15} /> Cerrar sesión
        </button>
      </div>

      <div
        className="fobo-card p-6"
        style={{ border: "1px solid var(--color-error)" }}
      >
        <div
          className="text-[16px] font-semibold mb-1"
          style={{ color: "var(--color-error)" }}
        >
          Eliminar cuenta
        </div>
        <p className="text-[13.5px] mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Esta acción borra tu cuenta permanentemente y revoca tu acceso a todas
          las marcas. No es reversible.
        </p>
        <button
          onClick={() => setDeleteOpen(true)}
          className="fobo-btn fobo-btn-sm"
          style={{ background: "var(--color-error)", color: "#fff" }}
        >
          Eliminar mi cuenta
        </button>
      </div>

      <AnimatePresence>
        {deleteOpen && <DeleteAccountModal onClose={() => setDeleteOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-[12.5px] font-semibold mb-[6px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <div
          className="text-[11.5px] mt-[5px]"
          style={{ color: "var(--color-error)" }}
        >
          {error}
        </div>
      ) : hint ? (
        <div
          className="text-[11.5px] mt-[5px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between py-[14px]"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div>
        <div className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </div>
        {sub && (
          <div className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>
            {sub}
          </div>
        )}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative border-none cursor-pointer flex-shrink-0"
        style={{
          width: 44,
          height: 24,
          borderRadius: 9999,
          background: value ? "var(--color-primary)" : "var(--neutral-400)",
          transition: "background 160ms ease",
          padding: 0,
        }}
      >
        <span
          className="absolute"
          style={{
            top: 2,
            left: 2,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transition: "transform 160ms ease",
            transform: value ? "translateX(20px)" : "none",
          }}
        />
      </button>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div
      className="fobo-card p-6"
      style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}
    >
      Cargando…
    </div>
  );
}

function SectionError({ message }: { message: string }) {
  return (
    <div
      className="fobo-card p-6 text-[13.5px]"
      style={{ color: "var(--color-error)" }}
    >
      {message}
    </div>
  );
}
