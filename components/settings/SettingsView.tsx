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
import { TeamsManager } from "./TeamsManager";
import { DeleteAccountModal } from "./DeleteAccountModal";
import type { BrandMember, MemberRole } from "@/lib/api/members";
import { WhatsAppConnectModal } from "./WhatsAppConnectModal";
import { inputStyle, NOTIF_DEFAULTS, NotifPrefs, SECTIONS, waConnectSchema, loadNotifs, saveNotifs, WaAccount, _WA_SEED } from "./utils/channel.helper";

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
          {active === "whatsapp" && <WhatsAppConnectModal onClose={() => setActive("whatsapp")} />}
          {active === "session" && <SessionSection />}
          {active === "channel" && <ChannelSection />}
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
      <div
        className="flex items-center gap-3 mb-5 pb-5"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div
          className="flex items-center justify-center text-white font-bold text-[20px] rounded-[14px] flex-shrink-0"
          style={{
            width: 56,
            height: 56,
            background: "var(--color-brand-gradient)",
            fontFamily: "var(--font-display)",
          }}
        >
          {(me.firstName?.[0] ?? "") + (me.lastName?.[0] ?? "")}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[16px] font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {me.firstName} {me.lastName}
          </div>
          <div
            className="text-[12.5px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {me.email} · ID #{me.id} · miembro desde{" "}
            {new Date(me.createdAt).toLocaleDateString("es-BO", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <span
          className="text-[12px] font-semibold px-3 py-[5px] rounded-full"
          style={{
            background: "var(--color-primary-subtle)",
            color: "var(--color-primary-ink)",
          }}
        >
          {me.role.name}
        </span>
      </div>

      <form onSubmit={handleSubmit(submit)}>
        {serverErr && (
          <div
            className="mb-4 px-3 py-2 rounded-[10px] text-[13px]"
            style={{
              background: "var(--color-error-bg)",
              color: "var(--color-error)",
            }}
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
            <Field
              label="Email"
              error={errors.email?.message}
              hint="Cambiarlo no actualiza la sesión actual — vuelve a iniciar sesión después"
            >
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
      <div
        className="text-[16px] font-semibold mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        Cambiar contraseña
      </div>
      <p
        className="text-[13.5px] mb-5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Te pediremos tu contraseña actual antes de aplicar el cambio.
      </p>

      <form onSubmit={handleSubmit(submit)}>
        {serverErr && (
          <div
            className="mb-4 px-3 py-2 rounded-[10px] text-[13px]"
            style={{
              background: "var(--color-error-bg)",
              color: "var(--color-error)",
            }}
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
          <Field
            label="Confirmar nueva contraseña"
            error={errors.confirm?.message}
          >
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
const ROLE_PALETTE: Record<
  MemberRole,
  { bg: string; color: string; label: string }
> = {
  admin: {
    bg: "var(--color-primary-subtle)",
    color: "var(--color-primary-ink)",
    label: "Admin",
  },
  member: {
    bg: "var(--color-background)",
    color: "var(--color-text-secondary)",
    label: "Miembro",
  },
  client: {
    bg: "var(--color-warning-bg)",
    color: "var(--color-warning)",
    label: "Cliente",
  },
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

  if (!activeBrand)
    return <SectionError message="Selecciona una marca primero" />;

  return (
    <>
      <div className="fobo-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <div
              className="text-[16px] font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Equipo de {activeBrand.name}
            </div>
            <div
              className="text-[12px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
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
          Para mostrar nombres y emails reales se necesita un endpoint
          enriquecido (TODO).
        </div>

        {isPending ? (
          <div
            className="p-5 text-[13px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Cargando miembros…
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <div
              className="text-[14px] mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Aún no hay miembros
            </div>
            <div
              className="text-[12.5px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
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
                  borderBottom:
                    i < members.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                }}
              >
                <span
                  className="flex items-center justify-center text-white font-bold text-[13px] rounded-full flex-shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    background: "var(--color-secondary-ink)",
                  }}
                >
                  U{m.userId}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Usuario #{m.userId}{" "}
                    {isMe && (
                      <span
                        style={{
                          color: "var(--color-text-tertiary)",
                          fontWeight: 400,
                        }}
                      >
                        (tú)
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[12px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Miembro desde{" "}
                    {new Date(m.createdAt).toLocaleDateString("es-BO")}
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

      <TeamsManager brandId={activeBrand.id} members={members} />

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

function ChannelSection() {
  const { activeBrand } = useUIStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<WaAccount[]>(_WA_SEED);
  const toast = useToast();

  return (
    <div className="">
      <div
        className="text-[16px] font-semibold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Canales
      </div>
      <p
        className="text-[13.5px] mb-5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Conecta múltiples números, páginas o inboxes por canal.
        Integración nativa con Cloud API — sin middleware de terceros.
      </p>

      <div className="flex flex-col gap-4">
        {/* WHATSAPP */}
        <div className="fobo-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/socials/WhatsApp.webp"
                alt="WhatsApp"
                className="w-12 h-12"
              />
              <div>
                <div
                  className="text-[16px] font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  WhatsApp Business
                </div>
                <p
                  className="text-[12.5px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {accounts.length === 0
                    ? "0 cuentas conectadas"
                    : `${accounts.length} cuenta${accounts.length === 1 ? "" : "s"} conectada${accounts.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
            <button
              className="fobo-btn fobo-btn-primary fobo-btn-sm"
              onClick={() => setModalOpen(true)}
            >
              <Icon name="plus" size={15} />
              Agregar cuenta
            </button>
          </div>

          {accounts.length > 0 && (
            <div className="mt-5 space-y-2.5">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-[12px] px-4 py-3"
                  style={{
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--color-success-bg)",
                        color: "var(--color-success-dark)",
                      }}
                    >
                      <Icon name="check" size={16} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[13.5px] font-semibold truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {a.displayName}
                      </div>
                      <div
                        className="text-[12px] truncate"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {a.phoneNumber} · {a.category} · ID {a.phoneNumberId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
                      title="Probar conexión"
                      onClick={() =>
                        toast("Prueba enviada a WhatsApp", "success")
                      }
                    >
                      <Icon name="send" size={14} />
                    </button>
                    <button
                      className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
                      title="Eliminar cuenta"
                      onClick={() => {
                        setAccounts((prev) =>
                          prev.filter((x) => x.id !== a.id)
                        );
                        toast("Cuenta desconectada", "error");
                      }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* FACEBOOK */}
        <div className="fobo-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/socials/Facebook.png"
                alt="Facebook"
                className="w-12 h-12 rounded-[6px]"
              />
              <div>
                <div
                  className="text-[16px] font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Facebook Business
                </div>
                <p
                  className="text-[12.5px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {accounts.length === 0
                    ? "0 cuentas conectadas"
                    : `${accounts.length} cuenta${accounts.length === 1 ? "" : "s"} conectada${accounts.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
            <button
              className="fobo-btn fobo-btn-primary fobo-btn-sm"
              onClick={() => setModalOpen(true)}
            >
              <Icon name="plus" size={15} />
              Agregar cuenta
            </button>
          </div>

          {accounts.length > 0 && (
            <div className="mt-5 space-y-2.5">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-[12px] px-4 py-3"
                  style={{
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--color-success-bg)",
                        color: "var(--color-success-dark)",
                      }}
                    >
                      <Icon name="check" size={16} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[13.5px] font-semibold truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {a.displayName}
                      </div>
                      <div
                        className="text-[12px] truncate"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {a.phoneNumber} · {a.category} · ID {a.phoneNumberId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
                      title="Probar conexión"
                      onClick={() =>
                        toast("Prueba enviada a WhatsApp", "success")
                      }
                    >
                      <Icon name="send" size={14} />
                    </button>
                    <button
                      className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
                      title="Eliminar cuenta"
                      onClick={() => {
                        setAccounts((prev) =>
                          prev.filter((x) => x.id !== a.id)
                        );
                        toast("Cuenta desconectada", "error");
                      }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FUTURE CHANNELS: layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "Instagram",
              img: "/socials/Instagram.webp",
              desc: "DMs, Comentarios, Stories y Menciones",
            },
            {
              name: "Facebook Messenger",
              img: "/socials/Facebook.webp",
              desc: "Inbox empresarial y respuestas automáticas",
            },
          ].map((c) => (
            <div
              key={c.name}
              className="fobo-card p-6 opacity-60"
              style={{
                position: "relative",
                overflow: "hidden",
                filter: "grayscale(60%)",
              }}
            >
              <div className="flex items-center gap-3">
                <img src={c.img} alt={c.name} className="w-10 h-10" />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[14.5px] font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="text-[12px]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {c.desc}
                  </div>
                </div>
                <div
                  className="text-[10.5px] px-2 py-1 rounded-md font-semibold uppercase tracking-wide"
                  style={{
                    background: "var(--color-background)",
                    color: "var(--color-text-tertiary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  Próx.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <WhatsAppConnectModal
            onClose={() => setModalOpen(false)}
            onSave={(data) =>
              setAccounts((prev) => [
                {
                  id: `wa-${Date.now()}`,
                  displayName: data.displayName,
                  phoneNumber: data.phoneNumber,
                  phoneNumberId: data.phoneNumberId,
                  category: data.category,
                  connectedAt: new Date().toISOString(),
                  health: "ok",
                },
                ...prev,
              ])
            }
            brand={activeBrand || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Modal: conectar WhatsApp Cloud API ───────────────────────────────────────


// function WhatsAppConnectModal({
//   onClose,
//   onSave,
//   brand,
// }: WaModalProps) {
//   const [step, setStep] = useState<1 | 2>(1);
//   const [copied, setCopied] = useState<string | null>(null);
//   const toast = useToast();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<WaConnectForm>({
//     resolver: zodResolver(waConnectSchema),
//     defaultValues: { category: "Marketing" },
//   });

//   const webhookUrl = MOCK_WEBHOOK_URL(brand?.id, brand?.slug);
//   const vt = MOCK_VERIFY_TOKEN;

//   const copy = async (key: string, value: string) => {
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(key);
//       toast("Copiado al portapapeles", "success");
//       setTimeout(() => setCopied(null), 1400);
//     } catch {
//       toast("No se pudo copiar", "error");
//     }
//   };

//   const submit = async (data: WaConnectForm) => {
//     // TODO: reemplazar por llamada al backend
//     // POST /api/v1/whatsapp/connect  (pendiente en 01.back)
//     await new Promise((r) => setTimeout(r, 500));
//     onSave?.(data);
//     onClose();
//   };

//   return (
//     <AnimatePresence>
//       <div
//         className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4"
//         style={{
//           background: "var(--color-overlay-scrim)",
//           backdropFilter: "blur(3px)",
//         }}
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 0.96, y: 8 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.96 }}
//           transition={{ duration: 0.16 }}
//           className="w-[740px] max-w-full my-6"
//           style={{
//             background: "var(--color-surface)",
//             borderRadius: 20,
//             boxShadow: "var(--shadow-3)",
//             padding: 24,
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <img
//                 src="/socials/WhatsApp.webp"
//                 alt=""
//                 className="w-8 h-8"
//               />
//               <div>
//                 <div
//                   className="font-semibold text-[16px]"
//                   style={{ color: "var(--color-text-primary)" }}
//                 >
//                   Conectar WhatsApp Business
//                 </div>
//                 <div
//                   className="text-[12px]"
//                   style={{ color: "var(--color-text-secondary)" }}
//                 >
//                   Cloud API · Paso {step} de 2
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
//               style={{
//                 background: "var(--color-background)",
//                 color: "var(--color-text-secondary)",
//               }}
//             >
//               <Icon name="x" size={15} />
//             </button>
//           </div>

//           {/* Steps bar */}
//           <div className="flex gap-2 mb-6">
//             {[1, 2].map((n) => (
//               <div key={n} className="flex-1">
//                 <div
//                   className="h-1 rounded-full"
//                   style={{
//                     background:
//                       step >= n ? "var(--color-primary)" : "var(--color-border)",
//                   }}
//                 />
//               </div>
//             ))}
//           </div>

//           <form onSubmit={handleSubmit(submit)}>
//             <div
//               className="flex flex-col gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1"
//             >
//               {step === 1 && (
//                 <>
//                   {/* ── Paso 1: configurar webhook en Meta for Developers */}
//                   <div
//                     className="rounded-[12px] border p-4"
//                     style={{
//                       borderColor: "var(--color-border)",
//                       background: "var(--color-background)",
//                     }}
//                   >
//                     <div className="flex items-start gap-3">
//                       <div
//                         className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
//                         style={{
//                           background: "var(--color-primary-subtle)",
//                           color: "var(--color-primary-ink)",
//                         }}
//                       >
//                         1
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div
//                           className="font-semibold text-[14px]"
//                           style={{ color: "var(--color-text-primary)" }}
//                         >
//                           Configura el webhook en Meta for Developers
//                         </div>
//                         <div
//                           className="text-[12.5px] mt-1"
//                           style={{ color: "var(--color-text-secondary)" }}
//                         >
//                           Abre tu App → WhatsApp → Configuration y pega estos dos
//                           valores. Después, suscríbete a los 3 webhook fields.
//                         </div>
//                       </div>
//                       <a
//                         href="https://developers.facebook.com/apps/"
//                         target="_blank"
//                         rel="noreferrer"
//                         className="fobo-btn fobo-btn-ghost fobo-btn-sm flex items-center gap-1 whitespace-nowrap"
//                       >
//                         <Icon name="link" size={13} /> Abrir
//                       </a>
//                     </div>

//                     <div className="mt-4">
//                       <label className={_lbl} style={_lblS}>
//                         Callback URL (Webhook)
//                       </label>
//                       <div className="flex gap-2">
//                         <input
//                           readOnly
//                           className="fobo-input flex-1"
//                           value={webhookUrl}
//                         />
//                         <button
//                           type="button"
//                           className="fobo-btn fobo-btn-secondary fobo-btn-sm"
//                           onClick={() => copy("url", webhookUrl)}
//                         >
//                           <Icon
//                             name={copied === "url" ? "check" : "copy"}
//                             size={14}
//                           />
//                         </button>
//                       </div>
//                       <div className={_hlp} style={_hlpS}>
//                         Endpoint público donde Meta envía mensajes y eventos.
//                       </div>
//                     </div>

//                     <div className="mt-3">
//                       <label className={_lbl} style={_lblS}>
//                         Verify Token
//                       </label>
//                       <div className="flex gap-2">
//                         <input
//                           readOnly
//                           className="fobo-input flex-1 font-mono text-[12px]"
//                           value={vt}
//                         />
//                         <button
//                           type="button"
//                           className="fobo-btn fobo-btn-secondary fobo-btn-sm"
//                           onClick={() => copy("vt", vt)}
//                         >
//                           <Icon
//                             name={copied === "vt" ? "check" : "copy"}
//                             size={14}
//                           />
//                         </button>
//                       </div>
//                       <div className={_hlp} style={_hlpS}>
//                         String arbitrario para validar el handshake del webhook.
//                       </div>
//                     </div>

//                     <div className="mt-3">
//                       <label className={_lbl} style={_lblS}>
//                         Webhook fields (suscríbete a estos)
//                       </label>
//                       <div className="flex flex-wrap gap-1.5">
//                         {[
//                           "messages",
//                           "message_template_status_update",
//                           "messages_statuses",
//                         ].map((f) => (
//                           <span
//                             key={f}
//                             className="text-[11.5px] px-2 py-1 rounded-md"
//                             style={{
//                               background: "var(--color-surface)",
//                               color: "var(--color-text-secondary)",
//                               border: "1px solid var(--color-border)",
//                             }}
//                           >
//                             {f}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex justify-end">
//                     <button
//                       type="button"
//                       className="fobo-btn fobo-btn-primary fobo-btn-sm"
//                       onClick={() => setStep(2)}
//                     >
//                       Continuar →
//                     </button>
//                   </div>
//                 </>
//               )}

//               {step === 2 && (
//                 <>
//                   {/* ── Paso 2: credenciales Cloud API */}
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <div>
//                       <label className={_lbl} style={_lblS}>
//                         App ID *
//                       </label>
//                       <input
//                         className="fobo-input"
//                         placeholder="123456789012345"
//                         {...register("appId")}
//                       />
//                       {errors.appId && (
//                         <div className={_err} style={_errS}>
//                           {errors.appId.message}
//                         </div>
//                       )}
//                       <div className={_hlp} style={_hlpS}>
//                         App Settings → Basic
//                       </div>
//                     </div>
//                     <div>
//                       <label className={_lbl} style={_lblS}>
//                         App Secret *
//                       </label>
//                       <input
//                         type="password"
//                         className="fobo-input"
//                         placeholder="••••••••••••"
//                         {...register("appSecret")}
//                       />
//                       {errors.appSecret && (
//                         <div className={_err} style={_errS}>
//                           {errors.appSecret.message}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className={_lbl} style={_lblS}>
//                       Permanent Access Token *
//                     </label>
//                     <input
//                       type="password"
//                       className={"fobo-input font-mono text-[12px]"}
//                       placeholder="EAAX... (System User Token)"
//                       {...register("accessToken")}
//                     />
//                     {errors.accessToken && (
//                       <div className={_err} style={_errS}>
//                         {errors.accessToken.message}
//                       </div>
//                     )}
//                     <div className={_hlp} style={_hlpS}>
//                       Business Settings → System Users → Generate Token. Scopes:
//                       whatsapp_business_management,
//                       whatsapp_business_messaging
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <div>
//                       <label className={_lbl} style={_lblS}>
//                         Phone Number ID *
//                       </label>
//                       <input
//                         className={"fobo-input font-mono text-[12px]"}
//                         placeholder="10581234567890"
//                         {...register("phoneNumberId")}
//                       />
//                       {errors.phoneNumberId && (
//                         <div className={_err} style={_errS}>
//                           {errors.phoneNumberId.message}
//                         </div>
//                       )}
//                       <div className={_hlp} style={_hlpS}>
//                         WhatsApp → Phone Numbers → ID
//                       </div>
//                     </div>
//                     <div>
//                       <label className={_lbl} style={_lblS}>
//                         WABA ID *
//                       </label>
//                       <input
//                         className={"fobo-input font-mono text-[12px]"}
//                         placeholder="111222333444555"
//                         {...register("businessAccountId")}
//                       />
//                       {errors.businessAccountId && (
//                         <div className={_err} style={_errS}>
//                           {errors.businessAccountId.message}
//                         </div>
//                       )}
//                       <div className={_hlp} style={_hlpS}>
//                         WhatsApp Business Account ID
//                       </div>
//                     </div>
//                   </div>

//                   <div
//                     className="pt-2 border-t"
//                     style={{ borderColor: "var(--color-border)" }}
//                   >
//                     <div
//                       className="font-semibold text-[13.5px] mb-3"
//                       style={{ color: "var(--color-text-primary)" }}
//                     >
//                       Datos del número
//                     </div>
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                       <div>
//                         <label className={_lbl} style={_lblS}>
//                           Nombre visible *
//                         </label>
//                         <input
//                           className="fobo-input"
//                           placeholder="Mi Tienda"
//                           {...register("displayName")}
//                         />
//                         {errors.displayName && (
//                           <div className={_err} style={_errS}>
//                             {errors.displayName.message}
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <label className={_lbl} style={_lblS}>
//                           Número *
//                         </label>
//                         <input
//                           className="fobo-input"
//                           placeholder="+591 70000000"
//                           {...register("phoneNumber")}
//                         />
//                         {errors.phoneNumber && (
//                           <div className={_err} style={_errS}>
//                             {errors.phoneNumber.message}
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <label className={_lbl} style={_lblS}>
//                           Categoría *
//                         </label>
//                         <select className="fobo-input" {...register("category")}>
//                           {WA_CATEGORIES_WA.map((c) => (
//                             <option key={c} value={c}>
//                               {c}
//                             </option>
//                           ))}
//                         </select>
//                         {errors.category && (
//                           <div className={_err} style={_errS}>
//                             {errors.category.message}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 pt-2">
//                     <button
//                       type="button"
//                       className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1"
//                       onClick={() => setStep(1)}
//                     >
//                       ← Atrás
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={isSubmitting}
//                       className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1"
//                     >
//                       {isSubmitting ? "Conectando..." : "Conectar WhatsApp"}
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </form>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// }

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
    {
      key: "reports",
      label: "Reportes generados",
      sub: "Cuando un reporte esté listo",
    },
    {
      key: "connections",
      label: "Alertas de conexión",
      sub: "Tokens expirados o errores de sincronización",
    },
    {
      key: "approvals",
      label: "Aprobaciones pendientes",
      sub: "Piezas que esperan tu revisión",
    },
    {
      key: "insights",
      label: "Insights de IA",
      sub: "Nuevos hallazgos y recomendaciones",
    },
    {
      key: "digest",
      label: "Resumen semanal",
      sub: "Digest de desempeño todos los lunes",
    },
  ];

  return (
    <div className="fobo-card p-6">
      <div
        className="text-[16px] font-semibold mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        Preferencias de notificación
      </div>
      <div
        className="mb-5 px-3 py-[10px] rounded-[10px] text-[12.5px]"
        style={{
          background: "var(--color-primary-subtle)",
          color: "var(--color-primary-ink)",
        }}
      >
        <Icon name="info" size={13} /> Estas preferencias se guardan solo en
        este navegador. El backend de notificaciones es trabajo pendiente.
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
        <div
          className="text-[16px] font-semibold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Cerrar sesión
        </div>
        <p
          className="text-[13.5px] mb-4"
          style={{ color: "var(--color-text-secondary)" }}
        >
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
        <p
          className="text-[13.5px] mb-4"
          style={{ color: "var(--color-text-secondary)" }}
        >
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
        {deleteOpen && (
          <DeleteAccountModal onClose={() => setDeleteOpen(false)} />
        )}
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
        <div
          className="text-[14px] font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {label}
        </div>
        {sub && (
          <div
            className="text-[12.5px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
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
