"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useUIStore } from "@/store/ui";
import { useBrands, useBrandsOverview, useDeleteBrand } from "@/lib/hooks";
import type { BrandOverview } from "@/lib/api/brands";
import type { Brand } from "@/store/ui";
import { AddBrandModal } from "./AddBrandModal";

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(Math.round(n));
}

const DELTA_LABEL: Record<string, string> = {
  reach: "alcance",
  interactions: "interacciones",
  spend: "inversión",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function BrandsGrid() {
  const { activeBrand, setActiveBrand } = useUIStore();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const { data: brands = [] } = useBrands();
  const { data: overview = [] } = useBrandsOverview();
  const deleteBrand = useDeleteBrand();

  const ovById = new Map<string, BrandOverview>(overview.map((o) => [o.id, o]));

  const shown = brands.filter((b) => {
    const q = search.trim().toLowerCase();
    return !q || (b.name + " " + b.industry).toLowerCase().includes(q);
  });

  const handleOpen = (b: Brand) => {
    setActiveBrand(b);
    router.push("/app/connections");
  };

  const handleDelete = (b: Brand) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(`¿Eliminar la marca "${b.name}"? Esta acción no se puede deshacer.`);
      if (!ok) return;
    }
    deleteBrand.mutate(b.id, {
      onSuccess: () => {
        if (activeBrand?.id === b.id) {
          const next = brands.find((x) => x.id !== b.id);
          if (next) setActiveBrand(next);
        }
        toast(`Marca "${b.name}" eliminada`, "info");
      },
      onError: () => toast("No se pudo eliminar la marca", "info"),
    });
    setMenuOpenId(null);
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            Marcas
          </h1>
          <p className="text-[14px] mt-[5px]" style={{ color: "var(--color-text-secondary)" }}>
            {brands.length} marcas activas en tu cartera
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div
            className="flex items-center gap-2 h-[36px] px-3 rounded-[10px] border w-[220px]"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Icon name="search" size={15} style={{ color: "var(--color-text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar marca…"
              className="flex-1 border-none outline-none bg-transparent text-[13px]"
              style={{ fontFamily: "var(--font-ui)", color: "var(--color-text-primary)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="border-none bg-transparent cursor-pointer flex p-0"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1"
          >
            <Icon name="plus" size={16} /> Añadir marca
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon="brands"
          title={search ? "Sin resultados" : "Aún no hay marcas"}
          body={
            search
              ? `Ninguna marca coincide con "${search}". Prueba con otro nombre o industria.`
              : "Crea tu primera marca para empezar a conectar sus cuentas."
          }
          action={
            search ? (
              <button
                className="fobo-btn fobo-btn-secondary fobo-btn-sm"
                onClick={() => setSearch("")}
              >
                Limpiar filtros
              </button>
            ) : (
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1">
                <Icon name="plus" size={16} /> Añadir marca
              </button>
            )
          }
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
        >
          {shown.map((b) => {
            const isActive = b.id === activeBrand?.id;
            const ov = ovById.get(b.id);
            const logoUrl = ov?.logoUrl ?? b.logoUrl ?? null;
            const channels = ov?.channels ?? b.channels;
            const metricCells = ov
              ? [
                  { l: "Seguidores", v: fmtNum(ov.metrics.followers) },
                  { l: "Alcance", v: fmtNum(ov.metrics.reach) },
                  { l: "Engagement", v: `${ov.metrics.engagementRate.toFixed(1)}%` },
                  { l: "Inversión", v: `$${fmtNum(ov.metrics.spend)}` },
                ]
              : [
                  { l: "Seguidores", v: "—" },
                  { l: "Alcance", v: "—" },
                  { l: "Engagement", v: "—" },
                  { l: "Inversión", v: "—" },
                ];
            return (
              <motion.div key={b.id} variants={item}>
                <div
                  className="fobo-card p-5 cursor-pointer transition-all duration-150"
                  style={{
                    border: isActive ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)",
                  }}
                  onClick={() => handleOpen(b)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-center gap-3 mb-4">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt={b.name}
                        className="flex-shrink-0 object-cover"
                        style={{
                          width: 48, height: 48, borderRadius: 12,
                          border: "1px solid var(--color-border)",
                        }}
                      />
                    ) : (
                      <span
                        className="flex items-center justify-center text-white font-bold text-[17px] flex-shrink-0"
                        style={{ width: 48, height: 48, borderRadius: 12, background: b.tint }}
                      >
                        {b.short}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[16px] font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {b.name}
                        </span>
                        {isActive && <Badge variant="primary">Activa</Badge>}
                      </div>
                      <div className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                        {b.industry}
                        {ov && ` · ${ov.connectionsCount} ${ov.connectionsCount === 1 ? "conexión" : "conexiones"}`}
                        {ov && ` · ${ov.membersCount} en el equipo`}
                      </div>
                    </div>
                    {/* Channel pills */}
                    <div className="flex items-center flex-shrink-0">
                      {channels.slice(0, 4).map((ch, i) => (
                        <span key={ch} style={{ marginLeft: i ? -7 : 0, zIndex: 4 - i }}>
                          <ChannelDot channel={ch} size={26} radius={9999} />
                        </span>
                      ))}
                      {channels.length > 4 && (
                        <span
                          className="flex items-center justify-center text-[10px] font-bold"
                          style={{
                            width: 26, height: 26, borderRadius: 9999,
                            background: "var(--color-background)",
                            color: "var(--color-text-secondary)",
                            border: "2px solid var(--color-surface)",
                            marginLeft: -7,
                          }}
                        >
                          +{channels.length - 4}
                        </span>
                      )}
                    </div>
                    {/* Row menu */}
                    <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-[8px] border-none cursor-pointer"
                        style={{ background: "transparent", color: "var(--color-text-tertiary)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId((prev) => (prev === b.id ? null : b.id));
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-background)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                      >
                        <Icon name="dots" size={17} />
                      </button>
                      {menuOpenId === b.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(null);
                            }}
                          />
                          <div
                            className="absolute right-0 top-[36px] min-w-[160px] rounded-[10px] p-1 z-40"
                            style={{
                              background: "var(--color-surface)",
                              border: "1px solid var(--color-border)",
                              boxShadow: "var(--shadow-3)",
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditBrand({ ...b, logoUrl });
                                setMenuOpenId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-[9px] rounded-[8px] text-[13px] font-medium border-none cursor-pointer text-left"
                              style={{
                                background: "transparent",
                                color: "var(--color-text-primary)",
                                fontFamily: "var(--font-ui)",
                              }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-background)")}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                            >
                              <Icon name="edit" size={14} /> Editar marca
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(b);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-[9px] rounded-[8px] text-[13px] font-medium border-none cursor-pointer text-left"
                              style={{
                                background: "transparent",
                                color: "var(--color-error)",
                                fontFamily: "var(--font-ui)",
                              }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-error-bg)")}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                            >
                              <Icon name="x" size={14} color="var(--color-error)" /> Eliminar marca
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Metrics band */}
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {metricCells.map(({ l, v }) => (
                      <div
                        key={l}
                        className="rounded-[10px] px-3 py-[10px]"
                        style={{ background: "var(--color-background)" }}
                      >
                        <div
                          className="tnum font-bold leading-none"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 16,
                            letterSpacing: "-0.02em",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {v}
                        </div>
                        <div className="text-[11px] mt-[4px]" style={{ color: "var(--color-text-tertiary)" }}>
                          {l}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between mt-4 pt-3"
                    style={{ borderTop: "1px solid var(--color-border)" }}
                  >
                    {ov?.delta ? (
                      <div
                        className="inline-flex items-center gap-[5px] text-[12px] font-semibold"
                        style={{
                          color: ov.delta.pct >= 0 ? "var(--color-success)" : "var(--color-error)",
                        }}
                      >
                        <Icon
                          name={ov.delta.pct >= 0 ? "arrowUp" : "arrowDown"}
                          size={12}
                          color={ov.delta.pct >= 0 ? "var(--color-success)" : "var(--color-error)"}
                        />
                        {ov.delta.pct}% {DELTA_LABEL[ov.delta.metric]} vs. mes anterior
                      </div>
                    ) : (
                      <div
                        className="text-[12px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        Sin datos del mes anterior
                      </div>
                    )}
                    <button
                      className="fobo-btn fobo-btn-ghost fobo-btn-sm gap-1"
                      onClick={(e) => { e.stopPropagation(); handleOpen(b); }}
                    >
                      <Icon name="plug" size={14} /> Conexiones
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {addOpen && <AddBrandModal onClose={() => setAddOpen(false)} />}
        {editBrand && (
          <AddBrandModal
            brand={editBrand}
            onClose={() => setEditBrand(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
