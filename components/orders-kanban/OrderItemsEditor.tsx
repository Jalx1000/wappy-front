"use client";

import { useId, useState } from "react";
import type { OrderItem } from "@/lib/api/orders";

interface Draft {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

const emptyRow: Draft = { productName: "", sku: "", quantity: 1, unitPrice: 0 };

const toDraft = (items: OrderItem[]): Draft[] =>
  items.length > 0
    ? items.map((i) => ({
        productName: i.productName,
        sku: i.sku ?? "",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }))
    : [{ ...emptyRow }];

const lineTotal = (d: Draft) =>
  Math.round(d.quantity * d.unitPrice * 100) / 100;

const cellInput: React.CSSProperties = {
  fontSize: 13,
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-text-primary)",
  width: "100%",
  minWidth: 0,
};

/**
 * Inline editor for an order's line items — the "product of interest" a human
 * fills in for a lead (S3). Keyboard-accessible: every field is labelled, rows
 * can be added/removed, and the total is derived from quantity × unit price.
 */
export function OrderItemsEditor({
  items,
  currency,
  saving,
  onSave,
  onCancel,
}: {
  items: OrderItem[];
  currency: string;
  saving: boolean;
  onSave: (items: OrderItem[], total: number) => void;
  onCancel: () => void;
}) {
  const [rows, setRows] = useState<Draft[]>(() => toDraft(items));
  const fieldId = useId();

  const patch = (idx: number, next: Partial<Draft>) =>
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...next } : r)));
  const addRow = () => setRows((rs) => [...rs, { ...emptyRow }]);
  const removeRow = (idx: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((_, i) => i !== idx) : rs));

  const total =
    Math.round(rows.reduce((sum, r) => sum + lineTotal(r), 0) * 100) / 100;

  const save = () => {
    const cleaned: OrderItem[] = rows
      .filter((r) => r.productName.trim() !== "")
      .map((r) => ({
        productName: r.productName.trim(),
        sku: r.sku.trim() || null,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        lineTotal: lineTotal(r),
      }));
    onSave(cleaned, total);
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((r, idx) => (
        <div
          key={idx}
          className="flex flex-wrap items-end gap-2"
          style={{ paddingBottom: 8, borderBottom: "1px solid var(--color-border)" }}
        >
          <div style={{ flex: "1 1 160px", minWidth: 0 }}>
            <label
              htmlFor={`${fieldId}-name-${idx}`}
              style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}
            >
              Producto
            </label>
            <input
              id={`${fieldId}-name-${idx}`}
              style={cellInput}
              value={r.productName}
              placeholder="Peluche oso"
              onChange={(e) => patch(idx, { productName: e.target.value })}
            />
          </div>
          <div style={{ flex: "0 0 64px" }}>
            <label
              htmlFor={`${fieldId}-qty-${idx}`}
              style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}
            >
              Cant.
            </label>
            <input
              id={`${fieldId}-qty-${idx}`}
              type="number"
              min={1}
              step={1}
              className="tnum"
              style={cellInput}
              value={r.quantity}
              onChange={(e) =>
                patch(idx, { quantity: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </div>
          <div style={{ flex: "0 0 92px" }}>
            <label
              htmlFor={`${fieldId}-price-${idx}`}
              style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}
            >
              Precio
            </label>
            <input
              id={`${fieldId}-price-${idx}`}
              type="number"
              min={0}
              step={0.01}
              className="tnum"
              style={cellInput}
              value={r.unitPrice}
              onChange={(e) =>
                patch(idx, { unitPrice: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </div>
          <div
            className="tnum"
            style={{
              flex: "0 0 auto",
              fontSize: 12.5,
              color: "var(--color-text-secondary)",
              padding: "7px 2px",
              minWidth: 72,
              textAlign: "right",
            }}
            aria-label={`Subtotal de línea: ${currency} ${lineTotal(r)}`}
          >
            {currency} {lineTotal(r)}
          </div>
          <button
            type="button"
            className="fobo-btn fobo-btn-ghost fobo-btn-sm"
            style={{ color: "var(--color-error)", flex: "none" }}
            aria-label={`Quitar ${r.productName || "producto"}`}
            disabled={rows.length === 1}
            onClick={() => removeRow(idx)}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        className="fobo-btn fobo-btn-ghost fobo-btn-sm"
        style={{ alignSelf: "flex-start" }}
        onClick={addRow}
      >
        + Agregar producto
      </button>

      <div
        className="flex items-center gap-2"
        style={{ marginTop: 4, paddingTop: 10, borderTop: "1px solid var(--color-border)" }}
      >
        <span style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>Total</span>
        <span
          className="tnum"
          style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}
        >
          {currency} {total}
        </span>
        <button
          type="button"
          className="fobo-btn fobo-btn-secondary fobo-btn-sm"
          style={{ marginLeft: "auto" }}
          disabled={saving}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="fobo-btn fobo-btn-primary fobo-btn-sm"
          disabled={saving}
          onClick={save}
        >
          {saving ? "Guardando…" : "Guardar productos"}
        </button>
      </div>
    </div>
  );
}
