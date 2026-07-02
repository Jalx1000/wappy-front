"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { useCreateBrand, useUpdateBrand } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { filesApi, UploadError } from "@/lib/api/files";
import { useUIStore } from "@/store/ui";
import type { Brand } from "@/store/ui";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

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
  /** Si viene, el modal edita esta marca en vez de crear una nueva. */
  brand?: Brand;
}

export function AddBrandModal({ onClose, brand }: Props) {
  const isEdit = !!brand;
  const toast = useToast();
  const create = useCreateBrand();
  const update = useUpdateBrand();
  const { activeBrand, setActiveBrand } = useUIStore();
  // En edición el slug ya existe: nunca lo regeneramos desde el nombre.
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    brand?.logoUrl ?? null,
  );
  const [logoRemoved, setLogoRemoved] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: brand?.name ?? "",
      slug: brand?.slug ?? (brand ? slugify(brand.name) : ""),
      description:
        brand && brand.industry !== "—" ? brand.industry : "",
    },
  });

  const onPickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
      setServerErr("Formato no permitido. Usa JPG, PNG, GIF o WEBP.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setServerErr("La imagen supera los 5MB.");
      return;
    }
    setServerErr(null);
    setLogoFile(file);
    setLogoRemoved(false);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoRemoved(true);
  };

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
      // El logo se sube primero a /files/upload; el PATCH/POST de la marca
      // solo guarda la ruta resultante. undefined = no tocar el logo actual.
      let logoPath: string | null | undefined = undefined;
      if (logoFile) {
        logoPath = (await filesApi.upload(logoFile)).path;
      } else if (logoRemoved) {
        logoPath = null;
      }

      if (isEdit && brand) {
        const desc = data.description?.trim();
        const updated = await update.mutateAsync({
          id: brand.id,
          data: {
            name: data.name.trim(),
            slug: data.slug.trim(),
            description: desc || null,
            ...(logoPath !== undefined ? { logoPath } : {}),
          },
        });
        // La marca activa vive en el store persistido: sincronizarla para que
        // el switcher no muestre el nombre/logo viejos.
        if (activeBrand?.id === brand.id) {
          // Solo los campos editados: updated viene de mapBackendBrand y
          // trae tint/short recalculados que no queremos pisar en el store.
          setActiveBrand({
            ...activeBrand,
            name: updated.name,
            industry: updated.industry,
            slug: updated.slug,
            logoUrl: updated.logoUrl,
          });
        }
        toast(`Marca "${updated.name}" actualizada`);
      } else {
        const created = await create.mutateAsync({
          name: data.name.trim(),
          slug: data.slug.trim(),
          description: data.description?.trim() || undefined,
          ...(logoPath !== undefined ? { logoPath } : {}),
        });
        toast(`Marca "${created.name}" creada`);
      }
      onClose();
    } catch (e) {
      if (e instanceof UploadError) {
        setServerErr(e.message);
        return;
      }
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
        setServerErr(
          e.message ||
            (isEdit ? "Error al actualizar la marca" : "Error al crear la marca"),
        );
        return;
      }
      setServerErr(
        isEdit
          ? "Error inesperado al actualizar la marca"
          : "Error inesperado al crear la marca",
      );
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
            <Icon name={isEdit ? "edit" : "plus"} size={18} />
          </div>
          <div className="flex-1">
            <div
              className="font-bold text-[16px]"
              style={{ color: "var(--color-text-primary)" }}
            >
              {isEdit ? "Editar marca" : "Nueva marca"}
            </div>
            <div
              className="text-[12px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {isEdit
                ? "Actualiza los datos y el logo de la marca"
                : "Agrega una marca a tu cartera"}
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

          <Field label="Logo" hint="JPG, PNG, GIF o WEBP — máx. 5MB, opcional">
            <div className="flex items-center gap-3">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Logo de la marca"
                  className="object-cover flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    border: "1px solid var(--color-border)",
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--color-background)",
                    border: "1px dashed var(--color-border)",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  <Icon name="image" size={18} />
                </div>
              )}
              <label className="fobo-btn fobo-btn-secondary fobo-btn-sm cursor-pointer">
                {logoPreview ? "Cambiar" : "Subir imagen"}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  className="hidden"
                  onChange={onPickLogo}
                  disabled={isSubmitting}
                />
              </label>
              {logoPreview && (
                <button
                  type="button"
                  onClick={onRemoveLogo}
                  disabled={isSubmitting}
                  className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                >
                  Quitar
                </button>
              )}
            </div>
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
              {isSubmitting
                ? isEdit
                  ? "Guardando…"
                  : "Creando…"
                : isEdit
                  ? "Guardar cambios"
                  : "Crear marca"}
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
