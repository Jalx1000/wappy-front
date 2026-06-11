"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useInfluencers, useDeleteInflencer } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { INF_STATUS_META, type InfluencerItem } from "@/lib/mocks/analyticsData";
import { Skeleton } from "@/components/ui/Skeleton";
import { InfluencerForm } from "./InfluencerForm";
import { InfluencerProfile } from "./InfluencerProfile";
import type { BadgeVariant } from "@/components/ui/Badge";

const CHANNELS = ["Todos", "instagram", "tiktok", "youtube"];
const STATUSES = ["Todos", "active", "negotiation", "prospect"];

interface RosterTabProps {
  onBriefClick: () => void;
}

export function RosterTab({ onBriefClick }: RosterTabProps) {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: influencers = [], isPending } = useInfluencers(brandId);
  const deleteInfluencer = useDeleteInflencer(brandId);
  const toast = useToast();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [chFilter, setChFilter] = useState("Todos");
  const [stFilter, setStFilter] = useState("Todos");
  const [form, setForm] = useState<{ inf?: InfluencerItem } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  if (isPending) return <Skeleton.Table rows={8} cols={6} />;

  const data = useMemo(() =>
    influencers.filter((inf) => {
      const okCh = chFilter === "Todos" || inf.ch === chFilter;
      const okSt = stFilter === "Todos" || inf.status === stFilter;
      return okCh && okSt;
    }), [influencers, chFilter, stFilter]);

  const columns = useMemo<ColumnDef<InfluencerItem>[]>(() => [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const color = `hsl(${row.original.name.charCodeAt(0) * 17 % 360}, 55%, 45%)`;
        return (
          <span
            className="flex items-center justify-center text-white font-bold text-[11px] rounded-full flex-shrink-0"
            style={{ width: 32, height: 32, background: color }}
          >
            {row.original.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
          </span>
        );
      },
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Influencer",
      cell: ({ row }) => (
        <button
          onClick={() => setProfileId(row.original.id)}
          className="min-w-0 text-left hover:opacity-75 transition-opacity"
          style={{ cursor: "pointer" }}
        >
          <div className="text-[13.5px] font-semibold" style={{ color: "var(--color-primary)" }}>
            {row.original.name}
          </div>
          <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
            {row.original.handle}
          </div>
        </button>
      ),
    },
    {
      accessorKey: "ch",
      header: "Red",
      cell: ({ row }) => <ChannelDot channel={row.original.ch} size={26} radius={7} />,
      size: 50,
    },
    {
      accessorKey: "followers",
      header: "Seguidores",
      cell: ({ getValue }) => (
        <span className="text-[13px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "eng",
      header: "Eng%",
      cell: ({ getValue }) => (
        <span className="text-[13px] font-semibold tnum" style={{ color: "var(--color-secondary-ink)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 70,
    },
    {
      accessorKey: "tier",
      header: "Tier",
      cell: ({ getValue }) => (
        <span className="text-[11.5px] font-semibold px-2 py-[2px] rounded-full" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 70,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const st = getValue<string>();
        const meta = (INF_STATUS_META as Record<string, any>)[st] ?? { variant: "neutral", label: st };
        return <Badge variant={meta.variant as BadgeVariant}>{meta.label}</Badge>;
      },
      size: 100,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
            onClick={() => setForm({ inf: row.original })}
            title="Editar"
          >
            <Icon name="edit" size={14} />
          </button>
          <button
            className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
            onClick={() => setDeleteId(row.original.id)}
            title="Eliminar"
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      ),
      size: 80,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1">
          {CHANNELS.map((c) => (
            <button
              key={c}
              onClick={() => setChFilter(c)}
              className="flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[12px] font-medium border-none cursor-pointer transition-colors"
              style={{
                background: chFilter === c ? "var(--color-primary-subtle)" : "var(--color-background)",
                color: chFilter === c ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
              }}
            >
              {c !== "Todos" ? <ChannelDot channel={c} size={14} radius={3} /> : null}
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStFilter(s)}
              className="px-3 py-[6px] rounded-full text-[12px] font-medium border-none cursor-pointer transition-colors"
              style={{
                background: stFilter === s ? "var(--color-primary-subtle)" : "var(--color-background)",
                color: stFilter === s ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1 ml-auto"
          onClick={() => setForm({})}
        >
          <Icon name="plus" size={15} /> Añadir influencer
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon="users"
          title="Sin influencers"
          body="Empieza agregando influencers a tu roster."
          action={
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setForm({})}>
              <Icon name="plus" size={15} /> Añadir influencer
            </button>
          }
        />
      ) : (
        <div className="fobo-card overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className="px-4 py-3 text-left text-[10.5px] font-bold uppercase"
                      style={{
                        letterSpacing: "0.05em",
                        color: "var(--color-text-tertiary)",
                        cursor: h.column.getCanSort() ? "pointer" : "default",
                        width: h.column.getSize(),
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === "asc" && <Icon name="arrowUp" size={11} />}
                        {h.column.getIsSorted() === "desc" && <Icon name="arrowDown" size={11} />}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: i < table.getRowModel().rows.length - 1 ? "1px solid var(--color-border)" : "none" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-background)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {form && (
          <InfluencerForm
            influencer={form.inf}
            onClose={() => setForm(null)}
            onDelete={form.inf ? () => { setDeleteId(form.inf!.id); setForm(null); } : undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center"
            style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[var(--color-surface)] rounded-[16px] p-6 max-w-[360px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[16px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                ¿Eliminar influencer?
              </div>
              <div className="text-[14px] mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Esta acción no se puede deshacer.
              </div>
              <div className="flex gap-3">
                <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1" onClick={() => setDeleteId(null)}>
                  Cancelar
                </button>
                <button
                  className="fobo-btn fobo-btn-sm flex-1"
                  style={{ background: "var(--color-error)", color: "#fff" }}
                  onClick={() => {
                    deleteInfluencer.mutate(deleteId);
                    setDeleteId(null);
                    toast("Influencer eliminado", "error");
                  }}
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileId && influencers.find((i) => i.id === profileId) && (
          <InfluencerProfile
            influencer={influencers.find((i) => i.id === profileId)!}
            onClose={() => setProfileId(null)}
            onEdit={(inf) => setForm({ inf })}
          />
        )}
      </AnimatePresence>
    </>
  );
}
