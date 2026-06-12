"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { useAddMember } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "Debe ser un ID numérico")
    .refine((s) => parseInt(s, 10) > 0, "ID inválido"),
  role: z.enum(["admin", "member", "client"]),
});

type FormData = z.infer<typeof schema>;

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-ui)",
};

interface Props {
  brandId: string;
  brandName: string;
  onClose: () => void;
}

export function InviteMemberModal({ brandId, brandName, onClose }: Props) {
  const toast = useToast();
  const add = useAddMember(brandId);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { userId: "", role: "member" },
  });

  const submit = async (data: FormData) => {
    setServerErr(null);
    try {
      await add.mutateAsync({
        userId: Number(data.userId),
        role: data.role,
      });
      toast(`Usuario #${data.userId} agregado a ${brandName}`);
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 404) {
          setServerErr(`Usuario #${data.userId} no existe`);
          return;
        }
        if (e.status === 409) {
          setServerErr(`Usuario #${data.userId} ya es miembro`);
          return;
        }
        setServerErr(e.message || "No se pudo agregar el miembro");
        return;
      }
      setServerErr("Error inesperado");
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
        className="w-[440px] max-w-[92vw] overflow-hidden"
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
              Invitar miembro
            </div>
            <div
              className="text-[12px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Agregar usuario a <strong>{brandName}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[8px] border-none cursor-pointer"
            style={{ background: "transparent", color: "var(--color-text-tertiary)" }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-[22px]">
          <div
            className="mb-4 px-3 py-[10px] rounded-[10px] text-[12px]"
            style={{
              background: "var(--color-background)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Icon name="info" size={13} /> El backend no expone búsqueda de
            usuarios por email a Agency Admin. Por ahora invita pegando el ID
            numérico del usuario.
          </div>

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

          <div className="mb-3">
            <label
              className="block text-[12.5px] font-semibold mb-[6px]"
              style={{ color: "var(--color-text-primary)" }}
            >
              User ID
            </label>
            <input
              {...register("userId")}
              type="text"
              inputMode="numeric"
              placeholder="Ej: 4"
              autoFocus
              disabled={isSubmitting}
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
            />
            {errors.userId && (
              <div
                className="text-[11.5px] mt-[5px]"
                style={{ color: "var(--color-error)" }}
              >
                {errors.userId.message}
              </div>
            )}
          </div>

          <div className="mb-5">
            <label
              className="block text-[12.5px] font-semibold mb-[6px]"
              style={{ color: "var(--color-text-primary)" }}
            >
              Rol
            </label>
            <select
              {...register("role")}
              disabled={isSubmitting}
              className="w-full h-[38px] px-3 rounded-[10px] border outline-none text-[14px]"
              style={inputStyle}
            >
              <option value="admin">Admin del brand</option>
              <option value="member">Miembro</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          <div className="flex gap-2">
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
              {isSubmitting ? "Agregando…" : "Agregar miembro"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
