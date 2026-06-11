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
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useContracts, useDeleteContract } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { CONTRACTS_META, type Contract } from "@/lib/mocks/analyticsData";
import { Skeleton } from "@/components/ui/Skeleton";
import { ContractForm } from "./ContractForm";
import type { BadgeVariant } from "@/components/ui/Badge";

const SIGNATURE_STATUSES = ["Todos", "pendiente", "firmado", "vencido"];

interface ContractsTabProps {
  onViewClick?: (contract: Contract) => void;
}

export function ContractsTab({ onViewClick }: ContractsTabProps) {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: contracts = [], isPending } = useContracts(brandId);
  const deleteContract = useDeleteContract(brandId);
  const toast = useToast();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [sigFilter, setSigFilter] = useState("Todos");
  const [form, setForm] = useState<{ contract?: Contract } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isPending) return <Skeleton.Table rows={8} cols={6} />;

  const data = useMemo(() =>
    contracts.filter((contract) => sigFilter === "Todos" || contract.signatureStatus === sigFilter),
    [contracts, sigFilter]
  );

  const columns = useMemo<ColumnDef<Contract>[]>(() => [
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
      accessorKey: "influencerId",
      header: "Influencer",
      cell: ({ getValue }) => (
        <span className="text-[13px]" style={{ color: "var(--color-text-primary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ getValue }) => (
        <span className="text-[12px] font-medium px-2 py-1 rounded-full" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ getValue }) => (
        <span className="text-[13px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
          ${getValue<number>().toLocaleString()}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "signatureStatus",
      header: "Firma",
      cell: ({ getValue }) => {
        const st = getValue<string>();
        const meta = (CONTRACTS_META as Record<string, any>)[st] ?? { variant: "neutral", label: st };
        return <Badge variant={meta.variant as BadgeVariant}>{meta.label}</Badge>;
      },
      size: 100,
    },
    {
      accessorKey: "expiresAt",
      header: "Vence",
      cell: ({ getValue }) => (
        <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 100,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
            onClick={() => setForm({ contract: row.original })}
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
          {SIGNATURE_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setSigFilter(s)}
              className="px-3 py-[6px] rounded-full text-[12px] font-medium border-none cursor-pointer transition-colors"
              style={{
                background: sigFilter === s ? "var(--color-primary-subtle)" : "var(--color-background)",
                color: sigFilter === s ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
              }}
            >
              {s === "Todos" ? s : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1 ml-auto"
          onClick={() => setForm({})}
        >
          <Icon name="plus" size={15} /> Nuevo contrato
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon="fileText"
          title="Sin contratos"
          body="Empieza creando un contrato para tus colaboraciones."
          action={
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setForm({})}>
              <Icon name="plus" size={15} /> Nuevo contrato
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
          <ContractForm
            contract={form.contract}
            onClose={() => setForm(null)}
            onDelete={form.contract ? () => { setDeleteId(form.contract!.id); setForm(null); } : undefined}
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
                ¿Eliminar contrato?
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
                    deleteContract.mutate(deleteId);
                    setDeleteId(null);
                    toast("Contrato eliminado", "error");
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
