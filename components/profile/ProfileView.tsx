"use client";

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useMe, useUpdateMe } from "@/lib/hooks";
import { ApiError } from "@/lib/api/client";
import { filesApi } from "@/lib/api/files";
import type { AuthMe, Availability } from "@/lib/api/auth";

const card: CSSProperties = { background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", marginBottom: 18 };
const cardHead: CSSProperties = { padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center" };
const fieldLabel: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };
const valRow: CSSProperties = { display: "flex", alignItems: "center", padding: "13px 20px", borderBottom: "1px solid var(--color-border)" };
const errText: CSSProperties = { fontSize: 12, color: "var(--color-error)", marginTop: 5 };
const banner: CSSProperties = { height: 120, background: "linear-gradient(110deg, var(--color-primary) 0%, var(--color-primary-bright) 100%)" };

const initialsOf = (name: string) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

const accountSchema = z.object({
  firstName: z.string().min(1, "Requerido").max(80),
  lastName: z.string().min(1, "Requerido").max(80),
  email: z.string().email("Email inválido"),
});
type AccountForm = z.infer<typeof accountSchema>;

const securitySchema = z
  .object({
    oldPassword: z.string().min(4, "Mínimo 4 caracteres"),
    password: z.string().min(4, "Mínimo 4 caracteres"),
    confirm: z.string().min(4, "Mínimo 4 caracteres"),
  })
  .refine((v) => v.password === v.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });
type SecurityForm = z.infer<typeof securitySchema>;

/** Extracts a human message from a NestJS validation/error response. */
function serverErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 422 && e.details && typeof e.details === "object") {
      const det = e.details as { errors?: Record<string, string> };
      const first = det.errors ? Object.values(det.errors)[0] : undefined;
      return first ?? e.message;
    }
    return e.message;
  }
  return "Error inesperado";
}

export function ProfileView() {
  const { data: me, isPending, isError } = useMe();

  if (isPending) return <ProfileSkeleton />;
  if (isError || !me) return <ProfileError />;

  const fullName = [me.firstName, me.lastName].filter(Boolean).join(" ") || me.email;

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--color-background)" }}>
      <div style={banner} />
      <div className="mx-auto" style={{ maxWidth: 720, padding: "0 24px 40px" }}>
        <div className="flex items-end gap-[18px]" style={{ marginTop: -40, marginBottom: 24 }}>
          <AvatarUploader me={me} />
          <div className="flex-1" style={{ paddingBottom: 6 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>{fullName}</div>
            <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)" }}>{me.role.name} · {me.email}</div>
          </div>
        </div>

        <AvailabilityCard me={me} />
        <AccountCard me={me} />
        <AccountMetaCard me={me} />
        <SecurityCard />
      </div>
    </div>
  );
}

// ── Disponibilidad (presencia manual → PATCH /auth/me {availability}) ────────
const AVAIL_OPTIONS: { value: Availability; label: string; color: string }[] = [
  { value: "online", label: "Disponible", color: "var(--color-success)" },
  { value: "away", label: "Ausente", color: "var(--color-warning)" },
  { value: "busy", label: "Ocupado", color: "var(--color-error)" },
  { value: "offline", label: "Desconectado", color: "var(--neutral-400)" },
];

function AvailabilityCard({ me }: { me: AuthMe }) {
  const toast = useToast();
  const updateMe = useUpdateMe();
  const current: Availability = me.availability ?? "offline";

  const set = async (value: Availability) => {
    if (value === current || updateMe.isPending) return;
    try {
      await updateMe.mutateAsync({ availability: value });
      toast("Disponibilidad actualizada ✓");
    } catch (e) {
      toast(serverErrorMessage(e), "error");
    }
  };

  return (
    <div style={card}>
      <div style={cardHead}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Disponibilidad</div></div>
      <div className="flex gap-2 flex-wrap" style={{ padding: 16 }}>
        {AVAIL_OPTIONS.map((o) => {
          const on = current === o.value;
          return (
            <button
              key={o.value}
              onClick={() => set(o.value)}
              disabled={updateMe.isPending}
              className="flex items-center gap-2 cursor-pointer"
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 9999,
                fontSize: 13.5,
                fontWeight: 600,
                background: on ? "var(--color-primary-subtle)" : "var(--color-surface)",
                color: on ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
                border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)",
              }}
            >
              <span className="rounded-full flex-none" style={{ width: 9, height: 9, background: o.color }} /> {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Avatar (subida real → /files/upload + PATCH /auth/me {photo}) ────────────
function AvatarUploader({ me }: { me: AuthMe }) {
  const toast = useToast();
  const updateMe = useUpdateMe();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);
  const fullName = [me.firstName, me.lastName].filter(Boolean).join(" ") || me.email;

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await filesApi.upload(file);
      await updateMe.mutateAsync({ photo: { id: uploaded.id } });
      setBroken(false);
      toast("Foto de perfil actualizada ✓");
    } catch (err) {
      toast(err instanceof Error ? err.message : "No se pudo subir la foto", "error");
    } finally {
      setUploading(false);
    }
  };

  const showImg = !!me.photo?.path && !broken;
  return (
    <div className="relative flex-none" style={{ width: 96, height: 96 }}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={me.photo!.path}
          alt={fullName}
          onError={() => setBroken(true)}
          className="rounded-full object-cover"
          style={{ width: 96, height: 96, border: "4px solid var(--color-background)" }}
        />
      ) : (
        <span
          className="flex items-center justify-center rounded-full"
          style={{ width: 96, height: 96, fontSize: 34, fontWeight: 700, background: "var(--color-primary)", color: "var(--color-on-primary)", border: "4px solid var(--color-background)" }}
        >
          {initialsOf(fullName)}
        </span>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Cambiar foto de perfil"
        title="Cambiar foto"
        className="absolute flex items-center justify-center rounded-full cursor-pointer"
        style={{ right: -2, bottom: 2, width: 30, height: 30, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", boxShadow: "var(--shadow-2)" }}
      >
        <Icon name={uploading ? "refresh" : "edit"} size={14} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} style={{ display: "none" }} />
    </div>
  );
}

// ── Datos personales (editable → PATCH /auth/me) ─────────────────────────────
function AccountCard({ me }: { me: AuthMe }) {
  const toast = useToast();
  const updateMe = useUpdateMe();
  const [serverErr, setServerErr] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { firstName: me.firstName ?? "", lastName: me.lastName ?? "", email: me.email },
  });

  useEffect(() => {
    reset({ firstName: me.firstName ?? "", lastName: me.lastName ?? "", email: me.email });
  }, [me, reset]);

  const submit = async (data: AccountForm) => {
    setServerErr(null);
    try {
      await updateMe.mutateAsync(data);
      toast("Perfil actualizado ✓");
    } catch (e) {
      setServerErr(serverErrorMessage(e));
    }
  };

  return (
    <div style={card}>
      <div style={cardHead}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Datos personales</div></div>
      <form onSubmit={handleSubmit(submit)} style={{ padding: 20 }}>
        {serverErr && (
          <div className="mb-4 px-3 py-2 rounded-[10px] text-[13px]" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>{serverErr}</div>
        )}
        <div className="flex gap-3" style={{ marginBottom: 16 }}>
          <div className="flex-1">
            <label style={fieldLabel}>Nombre</label>
            <input className="fobo-input" disabled={isSubmitting} {...register("firstName")} />
            {errors.firstName && <div style={errText}>{errors.firstName.message}</div>}
          </div>
          <div className="flex-1">
            <label style={fieldLabel}>Apellido</label>
            <input className="fobo-input" disabled={isSubmitting} {...register("lastName")} />
            {errors.lastName && <div style={errText}>{errors.lastName.message}</div>}
          </div>
        </div>
        <div>
          <label style={fieldLabel}>Email</label>
          <input className="fobo-input" type="email" disabled={isSubmitting} {...register("email")} />
          {errors.email && <div style={errText}>{errors.email.message}</div>}
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 6 }}>Cambiar el email no actualiza tu sesión actual — vuelve a iniciar sesión después.</div>
        </div>
        <div className="flex justify-end" style={{ marginTop: 18 }}>
          <button type="submit" disabled={isSubmitting || !isDirty} className="fobo-btn fobo-btn-primary fobo-btn-sm">
            <Icon name="check2" size={16} /> {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Cuenta (solo lectura, real) ──────────────────────────────────────────────
function AccountMetaCard({ me }: { me: AuthMe }) {
  const rows: [string, string][] = [
    ["Rol", me.role.name],
    ["Estado", me.status?.name ?? "—"],
    ["ID de usuario", `#${me.id}`],
    ["Miembro desde", new Date(me.createdAt).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })],
  ];
  return (
    <div style={card}>
      <div style={cardHead}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Cuenta</div></div>
      <div>
        {rows.map(([k, v], i, a) => (
          <div key={k} style={{ ...valRow, borderBottom: i < a.length - 1 ? valRow.borderBottom : "none" }}>
            <span style={{ width: 140, fontSize: 13, color: "var(--color-text-tertiary)" }}>{k}</span>
            <span style={{ fontSize: 13.5, color: "var(--color-text-primary)", fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Seguridad (cambio de contraseña real → PATCH /auth/me) ───────────────────
function SecurityCard() {
  const toast = useToast();
  const updateMe = useUpdateMe();
  const [serverErr, setServerErr] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SecurityForm>({
    resolver: zodResolver(securitySchema),
    defaultValues: { oldPassword: "", password: "", confirm: "" },
  });

  const submit = async (data: SecurityForm) => {
    setServerErr(null);
    try {
      await updateMe.mutateAsync({ oldPassword: data.oldPassword, password: data.password });
      toast("Contraseña actualizada ✓");
      reset();
    } catch (e) {
      if (e instanceof ApiError && e.status === 422 && e.details && typeof e.details === "object") {
        const det = e.details as { errors?: Record<string, string> };
        if (det.errors?.oldPassword) {
          setServerErr("La contraseña actual no es correcta");
          return;
        }
      }
      setServerErr(serverErrorMessage(e));
    }
  };

  return (
    <div style={card}>
      <div style={cardHead}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Seguridad</div></div>
      <form onSubmit={handleSubmit(submit)} style={{ padding: 20 }}>
        {serverErr && (
          <div className="mb-4 px-3 py-2 rounded-[10px] text-[13px]" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>{serverErr}</div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={fieldLabel}>Contraseña actual</label>
          <input className="fobo-input" type="password" autoComplete="current-password" disabled={isSubmitting} {...register("oldPassword")} />
          {errors.oldPassword && <div style={errText}>{errors.oldPassword.message}</div>}
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label style={fieldLabel}>Nueva contraseña</label>
            <input className="fobo-input" type="password" autoComplete="new-password" disabled={isSubmitting} {...register("password")} />
            {errors.password && <div style={errText}>{errors.password.message}</div>}
          </div>
          <div className="flex-1">
            <label style={fieldLabel}>Confirmar</label>
            <input className="fobo-input" type="password" autoComplete="new-password" disabled={isSubmitting} {...register("confirm")} />
            {errors.confirm && <div style={errText}>{errors.confirm.message}</div>}
          </div>
        </div>
        <div className="flex justify-end" style={{ marginTop: 18 }}>
          <button type="submit" disabled={isSubmitting} className="fobo-btn fobo-btn-secondary fobo-btn-sm">
            {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Loading / error ──────────────────────────────────────────────────────────
function ProfileSkeleton() {
  const block = (w: number | string, h: number): CSSProperties => ({ width: w, height: h, borderRadius: 6, background: "var(--color-border)" });
  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--color-background)" }}>
      <div style={{ height: 120, background: "var(--color-surface)" }} />
      <div className="mx-auto" style={{ maxWidth: 720, padding: "0 24px 40px" }}>
        <div className="flex items-end gap-[18px]" style={{ marginTop: -40, marginBottom: 24 }}>
          <div className="rounded-full flex-none" style={{ width: 96, height: 96, background: "var(--color-border)", border: "4px solid var(--color-background)" }} />
          <div className="flex-1" style={{ paddingBottom: 6 }}>
            <div style={{ ...block(180, 20), marginBottom: 8 }} />
            <div style={block(240, 14)} />
          </div>
        </div>
        <div style={{ ...card, height: 190 }} />
        <div style={{ ...card, height: 190 }} />
      </div>
    </div>
  );
}

function ProfileError() {
  return (
    <div className="flex items-center justify-center" style={{ flex: 1, minHeight: 320, background: "var(--color-background)" }}>
      <div className="text-center" style={{ padding: 40 }}>
        <Icon name="alert" size={28} style={{ color: "var(--color-error)" }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", marginTop: 12 }}>No se pudo cargar tu perfil</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>Revisa tu conexión e inténtalo de nuevo.</div>
      </div>
    </div>
  );
}
