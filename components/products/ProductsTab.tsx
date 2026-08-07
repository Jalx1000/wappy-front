"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useProducts, useDeleteProduct, useUpdateProduct } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BadgeVariant } from "@/components/ui/Badge";
import { ProductForm } from "./ProductForm";
import type { Product } from "@/lib/api/product";

const STATUSES = ["Todos", "Desactivado", "Activo"];

function categoryBadgeVariant(category: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Electronics: "primary",
    Apparel: "success",
    Services: "warning",
    Subscriptions: "neutral",
  };
  return map[category] ?? "neutral";
}
const PAGE_SIZE_OPTIONS = [50, 100, 200, 500, 1000];

interface ProductsTabProps {
  onViewClick?: (product: Product) => void;
}

interface PaginationControlsProps {
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  totalFilteredRows: number;
  totalPages: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: number) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
}

function PaginationControls({
  pageIndex,
  pageSize,
  totalRows,
  totalFilteredRows,
  totalPages,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
  search,
  onSearchChange,
}: PaginationControlsProps) {
  const firstRow = totalFilteredRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalFilteredRows);
  const showSearch = search !== undefined && onSearchChange;

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {showSearch && (
          <div
            className="flex h-9 w-full items-center gap-2 rounded-[8px] border px-3 sm:w-[320px]"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <Icon name="search" size={15} style={{ color: "var(--color-text-tertiary)" }} />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar producto..."
              className="min-w-0 flex-1 border-none bg-transparent text-[13px] outline-none"
              style={{ fontFamily: "var(--font-ui)", color: "var(--color-text-primary)" }}
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="flex border-none bg-transparent p-0 cursor-pointer"
                style={{ color: "var(--color-text-tertiary)" }}
                title="Limpiar búsqueda"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
        )}

        {search ? null : null}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
          Mostrando <span className="font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>{firstRow}-{lastRow}</span> de{" "}
          <span className="font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>{totalFilteredRows}</span> productos
          {totalFilteredRows !== totalRows && (
            <span style={{ color: "var(--color-text-tertiary)" }}> filtrados de {totalRows}</span>
          )}
        </div>
        <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
          Filas
        </span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          aria-label="Filas por página"
          className="h-8 rounded-[8px] border px-2 text-[12px] outline-none"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="text-[12px] min-w-[72px] text-center tnum" style={{ color: "var(--color-text-secondary)" }}>
          {totalPages === 0 ? "0 / 0" : `${pageIndex + 1} / ${totalPages}`}
        </div>

        <button
          type="button"
          className="h-8 w-8 rounded-[8px] border flex items-center justify-center disabled:opacity-40"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-primary)",
          }}
          disabled={!canPreviousPage}
          onClick={onPreviousPage}
          title="Página anterior"
        >
          <Icon name="chevronL" size={14} />
        </button>
        <button
          type="button"
          className="h-8 w-8 rounded-[8px] border flex items-center justify-center disabled:opacity-40"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-primary)",
          }}
          disabled={!canNextPage}
          onClick={onNextPage}
          title="Página siguiente"
        >
          <Icon name="chevronR" size={14} />
        </button>
      </div>
    </div>
  );
}

export function ProductsTab({ onViewClick }: ProductsTabProps) {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: products = [], isPending } = useProducts(brandId);
  const [search, setSearch] = useState("");
  const deleteProduct = useDeleteProduct(brandId);
  const updateProduct = useUpdateProduct(brandId);
  const toast = useToast();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE_OPTIONS[0] });
  const [stFilter, setStFilter] = useState("Todos");
  const [form, setForm] = useState<{ product?: Product } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const data = useMemo(() => {
    // 🔒 AISLAMIENTO POR MARCA (defense-in-depth):
    // Remover cualquier producto que no pertenezca a la marca activa,
    // incluso si el backend o la caché de React Query los devolviera.
    const currentBrandId = Number(brandId);
    const onlyCurrentBrand = products.filter(
      (product: any) => !currentBrandId || Number(product.brandId) === currentBrandId,
    );

    const query = search.trim().toLowerCase();

    return onlyCurrentBrand.filter((product: any) => {
      const isActive = Boolean(product.isActive);
      const statusMatches =
        stFilter === "Todos" ||
        (stFilter === "Activo" && isActive) ||
        (stFilter === "Desactivado" && !isActive);
      const queryMatches =
        !query ||
        [product.id, product.sku, product.name, product.description, product.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      return statusMatches && queryMatches;
    });
  }, [products, brandId, search, stFilter]);

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ getValue }) => (
        <span className="text-[12px] font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }) => (
        <div className="min-w-[220px]">
          <div className="text-[13.5px] font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
            {row.original.name}
          </div>
          <div className="text-[11.5px] mt-1 line-clamp-1" style={{ color: "var(--color-text-tertiary)" }}>
            {row.original.description ?? "—"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ getValue }) => {
        const c = getValue<string>();
        return <Badge variant={categoryBadgeVariant(c)}>{c ?? "—"}</Badge>;
      },
      size: 120,
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ getValue }) => {
        const v = getValue<number>();
        return (
          <span className="text-[12.5px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
            ${typeof v === "number" ? v.toFixed(2) : "0.00"}
          </span>
        );
      },
      size: 90,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ getValue }) => {
        const v = getValue<number>();
        const low = typeof v === "number" && v <= 5;
        return (
          <Badge variant={low ? "error" : "neutral"}>
            {typeof v === "number" ? v.toString() : "0"}
          </Badge>
        );
      },
      size: 80,
    },
    {
      id: "active",
      header: "Activo",
      cell: ({ row }) => {
        const isActive = Boolean(row.original.isActive);

        return (
          <button
            type="button"
            onClick={() => {
              updateProduct.mutate({
                id: row.original.id,
                data: { isActive: !isActive },
              });
              toast(isActive ? "Producto desactivado" : "Producto activado", "success");
            }}
            className="inline-flex h-7 w-[52px] items-center rounded-full border p-[3px] transition-colors"
            style={{
              background: isActive ? "var(--color-success-bg)" : "var(--neutral-200)",
              borderColor: isActive ? "var(--color-success)" : "var(--color-border)",
            }}
            aria-pressed={isActive}
            title={isActive ? "Desactivar producto" : "Activar producto"}
          >
            <span
              className="h-5 w-5 rounded-full transition-transform"
              style={{
                background: isActive ? "var(--color-success-dark)" : "var(--color-text-tertiary)",
                transform: isActive ? "translateX(24px)" : "translateX(0)",
              }}
            />
          </button>
        );
      },
      size: 80,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
            onClick={() => setForm({ product: row.original })}
            title="Editar"
          >
            <Icon name="edit" size={14} />
          </button>
          <button
            className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
            onClick={() => onViewClick?.(row.original)}
            title="Ver detalle"
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
  ], [onViewClick, toast, updateProduct]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isPending) return <Skeleton.Table rows={8} cols={7} />;

  const paginationProps = {
    pageIndex: table.getState().pagination.pageIndex,
    pageSize: table.getState().pagination.pageSize,
    totalRows: products.length,
    totalFilteredRows: data.length,
    totalPages: table.getPageCount(),
    canPreviousPage: table.getCanPreviousPage(),
    canNextPage: table.getCanNextPage(),
    onPreviousPage: table.previousPage,
    onNextPage: table.nextPage,
    onPageSizeChange: (size: number) => {
      table.setPageIndex(0);
      table.setPageSize(size);
    },
  };

  return (
    <>
      <div className="fobo-card overflow-hidden overflow-x-auto">
        {/* <div className="flex gap-1 overflow-x-auto border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
          {STATUSES.map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => {
                setPagination((current) => ({ ...current, pageIndex: 0 }));
                setStFilter(statusOption);
              }}
              className="px-3 py-[7px] rounded-[8px] text-[12px] font-medium border-none cursor-pointer transition-colors whitespace-nowrap"
              style={{
                background: stFilter === statusOption ? "var(--color-primary-subtle)" : "var(--color-background)",
                color: stFilter === statusOption ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
              }}
            >
              {statusOption}
            </button>
          ))}
        </div> */}

        <div style={{ borderBottom: "1px solid var(--color-border)" }}>
          <PaginationControls
            {...paginationProps}
            search={search}
            onSearchChange={(value) => {
              setPagination((current) => ({ ...current, pageIndex: 0 }));
              setSearch(value);
            }}
          />
        </div>

        {data.length === 0 ? (
          <div className="px-4 py-8">
            <EmptyState
              icon="products"
              title="Sin productos"
              body="Ajusta la búsqueda o crea un producto para empezar a operar el catálogo."
              action={
                <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setForm({})}>
                  <Icon name="plus" size={15} /> Nuevo producto
                </button>
              }
            />
          </div>
        ) : (
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
        )}

        <div style={{ borderTop: "1px solid var(--color-border)" }}>
          <PaginationControls {...paginationProps} />
        </div>
      </div>

      <AnimatePresence>
        {form && (
          <ProductForm
            // ProductForm espera el Product de mocks/analyticsData (campo `title`),
            // mientras aquí manejamos el Product de api/product (`name`/`sku`). Cast
            // localizado: la inconsistencia es pre-existente y ya corre degradada.
            product={form.product as unknown as import("@/lib/mocks/analyticsData").Product}
            onClose={() => setForm(null)}
            onDelete={form.product ? () => { setDeleteId(form.product!.id); setForm(null); } : undefined}
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
                ¿Eliminar producto?
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
                    deleteProduct.mutate(deleteId);
                    setDeleteId(null);
                    toast("Producto eliminado", "error");
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
