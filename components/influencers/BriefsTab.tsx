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
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useBriefs, useDeleteBrief } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { BRIEFS_META, type Brief } from "@/lib/mocks/analyticsData";
import { Skeleton } from "@/components/ui/Skeleton";
import { BriefForm } from "./BriefForm";
import type { BadgeVariant } from "@/components/ui/Badge";

const STATUSES = ["Todos", "borrador", "enviado", "firmado", "activo"];

interface BriefsTabProps {
  onViewClick?: (brief: Brief) => void;
}

export function BriefsTab({ onViewClick }: BriefsTabProps) {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: briefs = [], isPending } = useBriefs(brandId);
  const deleteBrief = useDeleteBrief(brandId);
  const toast = useToast();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [stFilter, setStFilter] = useState("Todos");
  const [form, setForm] = useState<{ brief?: Brief } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isPending) return <Skeleton.Table rows={8} cols={6} />;

  const data = useMemo(() =>
    briefs.filter((brief) => stFilter === "Todos" || brief.status === stFilter),
    [briefs, stFilter]
  );

  const columns = useMemo<ColumnDef<Brief>[]>(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ getValue }) => (
        <span className="text-[12px] font-mono" style={{ color: "var(--color-text-tertiary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {row.original.title}
          </div>
          <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
            {row.original.influencerId}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const st = getValue<string>();
        const meta = (BRIEFS_META as Record<string, any>)[st] ?? { variant: "neutral", label: st };
        return <Badge variant={meta.variant as BadgeVariant}>{meta.label}</Badge>;
      },
      size: 100,
    },
    {
      accessorKey: "startDate",
      header: "Inicio",
      cell: ({ getValue }) => (
        <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: "endDate",
      header: "Fin",
      cell: ({ getValue }) => (
        <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: "createdAt",
      header: "Creado",
      cell: ({ getValue }) => (
        <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 80,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
            onClick={() => setForm({ brief: row.original })}
            title="Editar"
          >
            <Icon name="edit" size={14} />
          </button>
          <button
            className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
            onClick={() => onViewClick?.(row.original)}
            title="Ver PDF"
          >
            <Icon name="file" size={14} />
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
      size: 100,
    },
  ], [onViewClick]);

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
              {s === "Todos" ? s : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          className="fobo-btn fobo-btn-primary fofo-btn-sm flex items-center gap-1 ml-auto"
          onClick={() => setForm({})}
        >
          <Icon name="plus" size={15} /> Nuevo brief
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon="fileText"
          title="Sin briefs"
          body="Empieza creando un brief para tus colaboraciones."
          action={
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setForm({})}>
              <Icon name="plus" size={15} /> Nuevo brief
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
          <BriefForm
            brief={form.brief}
            onClose={() => setForm(null)}
            onDelete={form.brief ? () => { setDeleteId(form.brief!.id); setForm(null); } : undefined}
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
                ¿Eliminar brief?
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
                    deleteBrief.mutate(deleteId);
                    setDeleteId(null);
                    toast("Brief eliminado", "error");
                  }}
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
