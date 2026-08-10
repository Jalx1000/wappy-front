"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamsApi, type Team, type TeamMember } from "@/lib/api/teams";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import type { BrandMember } from "@/lib/api/members";

const memberLabel = (m: TeamMember) =>
  [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || `#${m.id}`;

export function TeamsManager({
  brandId,
  members,
}: {
  brandId: string;
  members: BrandMember[];
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const key = ["teams", brandId];

  const { data: teams = [], isPending } = useQuery({
    queryKey: key,
    queryFn: () => teamsApi.list(brandId),
    enabled: !!brandId,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const [name, setName] = useState("");

  const createTeam = useMutation({
    mutationFn: () => teamsApi.create({ brandId: Number(brandId), name: name.trim() }),
    onSuccess: () => {
      setName("");
      invalidate();
      toast("Equipo creado");
    },
    onError: (e) => toast(e instanceof ApiError ? e.message : "No se pudo crear", "info"),
  });

  const removeTeam = useMutation({
    mutationFn: (id: string) => teamsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast("Equipo eliminado", "info");
    },
  });

  const addMember = useMutation({
    mutationFn: (v: { id: string; userId: number }) => teamsApi.addMember(v.id, v.userId),
    onSuccess: invalidate,
    onError: (e) => toast(e instanceof ApiError ? e.message : "No se pudo agregar", "info"),
  });

  const removeMember = useMutation({
    mutationFn: (v: { id: string; userId: number }) => teamsApi.removeMember(v.id, v.userId),
    onSuccess: invalidate,
  });

  return (
    <div className="fobo-card overflow-hidden" style={{ marginTop: 18 }}>
      <div
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div>
          <div className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Equipos
          </div>
          <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
            Agrupa miembros para asignar y organizar conversaciones
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim() && !createTeam.isPending) createTeam.mutate();
            }}
            placeholder="Nombre del equipo"
            className="h-[34px] px-3 rounded-[9px] border outline-none text-[13.5px]"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}
          />
          <button
            onClick={() => createTeam.mutate()}
            disabled={!name.trim() || createTeam.isPending}
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1"
          >
            <Icon name="plus" size={14} /> Crear
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="p-5 text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
          Cargando equipos…
        </div>
      ) : teams.length === 0 ? (
        <div className="p-6 text-center text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
          Aún no hay equipos. Crea el primero arriba.
        </div>
      ) : (
        teams.map((t: Team, i) => {
          const teamMembers = t.members ?? [];
          const inTeam = new Set(teamMembers.map((m) => m.id));
          const addable = members.filter((bm) => !inTeam.has(bm.userId));
          return (
            <div
              key={t.id}
              className="px-5 py-4"
              style={{ borderBottom: i < teams.length - 1 ? "1px solid var(--color-border)" : "none" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {t.name}{" "}
                  <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>
                    · {teamMembers.length} miembro{teamMembers.length === 1 ? "" : "s"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && window.confirm(`¿Eliminar el equipo "${t.name}"?`))
                      removeTeam.mutate(t.id);
                  }}
                  className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                  title="Eliminar equipo"
                  style={{ color: "var(--color-error)" }}
                >
                  <Icon name="trash" size={14} color="var(--color-error)" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {teamMembers.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1 rounded-full text-[12px]"
                    style={{ padding: "3px 6px 3px 9px", background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
                  >
                    {memberLabel(m)}
                    <button
                      onClick={() => removeMember.mutate({ id: t.id, userId: m.id })}
                      title="Quitar del equipo"
                      className="flex items-center justify-center rounded-full border-none cursor-pointer"
                      style={{ width: 16, height: 16, background: "transparent", color: "var(--color-text-tertiary)" }}
                    >
                      <Icon name="x" size={11} />
                    </button>
                  </span>
                ))}

                {addable.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const userId = Number(e.target.value);
                      if (userId) addMember.mutate({ id: t.id, userId });
                      e.target.value = "";
                    }}
                    className="h-[26px] px-2 rounded-full border text-[12px] cursor-pointer"
                    style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)", color: "var(--color-text-secondary)" }}
                  >
                    <option value="">+ Agregar miembro</option>
                    {addable.map((bm) => (
                      <option key={bm.userId} value={bm.userId}>
                        Usuario #{bm.userId}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
