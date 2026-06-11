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
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { usePosts } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { POST_STATUS_META, POSTS_DATA } from "@/lib/mocks/analyticsData";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { PostStatus } from "@/lib/mocks/analyticsData";
import { Skeleton } from "@/components/ui/Skeleton";

const STATUS_BADGE: Record<PostStatus, BadgeVariant> = {
  published: "success",
  scheduled: "primary",
  review:    "warning",
  draft:     "neutral",
};

const CHANNELS = ["Todos", "facebook", "instagram", "tiktok", "youtube"];

function PostsSkeleton() {
  return (
    <div className="p-7 max-w-[1440px] flex flex-col gap-4">
      <Skeleton.Table rows={8} cols={6} />
    </div>
  );
}

export function PostsView() {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: posts = [], isPending } = usePosts(brandId);

  if (isPending) return <PostsSkeleton />;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [chFilter, setChFilter] = useState("Todos");
  const [stFilter, setStFilter] = useState("Todos");

  const data = useMemo(() => {
    return posts.filter((p) => {
      const matchCh = chFilter === "Todos" || p.ch === chFilter;
      const matchSt = stFilter === "Todos" || p.status === stFilter;
      return matchCh && matchSt;
    });
  }, [posts, chFilter, stFilter]);

  const columns = useMemo<ColumnDef<typeof POSTS_DATA[0]>[]>(() => [
    {
      id: "image",
      header: "",
      cell: () => (
        <div className="rounded-[8px] overflow-hidden" style={{ width: 48, height: 48, flexShrink: 0 }}>
          <ImagePlaceholder height={48} />
        </div>
      ),
      size: 64,
    },
    {
      accessorKey: "caption",
      header: "Publicación",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <ChannelDot channel={row.original.ch} size={22} radius={6} />
          <span
            className="text-[13.5px] font-medium truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {row.original.caption}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const s = getValue<PostStatus>();
        return <Badge variant={STATUS_BADGE[s]}>{POST_STATUS_META[s].label}</Badge>;
      },
      size: 130,
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ getValue }) => (
        <span className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "reach",
      header: "Alcance",
      cell: ({ getValue }) => (
        <span className="text-[13px] font-semibold tnum" style={{ color: "var(--color-text-primary)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 90,
    },
    {
      accessorKey: "eng",
      header: "Eng.",
      cell: ({ getValue }) => (
        <span className="text-[13px] font-semibold tnum" style={{ color: "var(--color-secondary-ink)" }}>
          {getValue<string>()}
        </span>
      ),
      size: 80,
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex gap-1">
          <button className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"><Icon name="edit" size={14} /></button>
          <button className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"><Icon name="trash" size={14} /></button>
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
    <div className="p-7 overflow-y-auto h-full">
      <div className="flex items-end gap-4 mb-5 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Publicaciones
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {data.length} publicaciones
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Channel filter */}
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
                {c === "Todos" ? c : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1">
            <Icon name="plus" size={15} /> Nueva publicación
          </button>
        </div>
      </div>

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
    </div>
  );
}
