"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { useCreateBrand } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(60, "Máximo 60 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
});

type FormData = z.infer<typeof schema>;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-ui)",
};

interface Props {
  onClose: () => void;
}

export function AddBrandModal({ onClose }: Props) {
  const toast = useToast();
  const create = useCreateBrand();
  const [slugTouched, setSlugTouched] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  const nameReg = register("name");
  const slugReg = register("slug");
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    nameReg.onChange(e);
    if (!slugTouched) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  };

  const submit = async (data: FormData) => {
    setServerErr(null);
    try {
      const brand = await create.mutateAsync({
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description?.trim() || undefined,
      });
      toast(`Marca "${brand.name}" creada`);
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setServerErr(`El slug "${data.slug}" ya existe.`);
          return;
        }
        if (e.status === 422 && e.details && typeof e.details === "object") {
          const det = e.details as { errors?: Record<string, string> };
          const first = det.errors ? Object.values(det.errors)[0] : undefined;
          setServerErr(first ?? e.message);
          return;
        }
        setServerErr(e.message || "Error al crear la marca");
        return;
      }
      setServerErr("Error inesperado al crear la marca");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{
        background: "var(--color-overlay-scrim)",
        backdropFilter: "blur(3px)",
      }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-[480px] max-w-[92vw] overflow-hidden"
        style={{
          background: "var(--color-surface)",
          borderRadius: 20,
          boxShadow: "var(--shadow-3)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 h-[64px] px-[22px]"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-[10px]"
            style={{
              background: "var(--color-primary-subtle)",
              color: "var(--color-primary-ink)",
            }}
          >
            <Icon name="plus" size={18} />
          </div>
          <div className="flex-1">
            <div
              className="font-bold text-[16px]"
              style={{ color: "var(--color-text-primary)" }}
            >
              Nueva marca
            </div>
            <div
              className="text-[12px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Agrega una marca a tu cartera
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[8px] border-none cursor-pointer"
            style={{
              background: "transparent",
              color: "var(--color-text-tertiary)",
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-[22px]">
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

          <Field label="Nombre" error={errors.name?.message}>
            <input
              {...nameReg}
              onChange={onNameChange}
              placeholder="Ej: Acme Bolivia"
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
              autoFocus
              disabled={isSubmitting}
            />
          </Field>

          <Field
            label="Slug"
            hint="Identificador en URL (solo minúsculas, números y guiones)"
            error={errors.slug?.message}
          >
            <input
              {...slugReg}
              onChange={(e) => {
                setSlugTouched(true);
                slugReg.onChange(e);
              }}
              placeholder="acme-bolivia"
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
              disabled={isSubmitting}
            />
          </Field>

          <Field
            label="Descripción"
            hint="Opcional — industria o categoría"
            error={errors.description?.message}
          >
            <textarea
              {...register("description")}
              placeholder="Ej: Empresa líder en alimentos"
              rows={2}
              className="w-full px-3 py-2 rounded-[10px] border outline-none text-[14px] resize-none"
              style={inputStyle}
              disabled={isSubmitting}
            />
          </Field>

          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1"
            >
              {isSubmitting ? "Creando…" : "Crear marca"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

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
    <div className="mb-3">
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
