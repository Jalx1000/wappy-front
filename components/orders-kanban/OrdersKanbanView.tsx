"use client";

import { useState, type CSSProperties, type DragEvent } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { ORDER_STAGES, type Order, type OrderStatus } from "@/lib/api/orders";
import { useOrders, useContactNames, useUpdateOrder } from "@/lib/hooks/orders";

const column: CSSProperties = {
  flex: "0 0 280px",
  background: "var(--color-surface)",
  borderRadius: 14,
  border: "1px solid var(--color-border)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
};

function money(total?: number, currency?: string) {
  if (!total) return null;
  return `${currency ?? "USD"} ${total}`;
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Read-only detail of an order + a stage selector (keyboard-accessible move). */
function OrderDetailModal({
  order,
  contactName,
  onClose,
  onMove,
  moving,
}: {
  order: Order;
  contactName: string;
  onClose: () => void;
  onMove: (status: OrderStatus) => void;
  moving: boolean;
}) {
  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-start gap-3" style={{ padding: "8px 0" }}>
      <span style={{ width: 110, flex: "none", fontSize: 12.5, color: "var(--color-text-tertiary)" }}>
        {label}
      </span>
      <span style={{ fontSize: 13.5, color: "var(--color-text-primary)", minWidth: 0 }}>{value}</span>
    </div>
  );
  return (
    <Modal onClose={onClose} width={480}>
      <ModalHeader title={contactName} subtitle="Detalle del pedido" onClose={onClose} />
      <div style={{ padding: "16px 22px 22px" }}>
        <div>
          <label
            htmlFor="order-stage"
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-secondary)" }}
          >
            Etapa
          </label>
          <select
            id="order-stage"
            value={order.status}
            disabled={moving}
            onChange={(e) => onMove(e.target.value as OrderStatus)}
            style={{
              marginTop: 6,
              width: "100%",
              fontSize: 13,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
            }}
          >
            {ORDER_STAGES.map((s) => (
              <option key={s.status} value={s.status}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 14, borderTop: "1px solid var(--color-border)" }}>
          {row("Cliente", contactName)}
          {row("Total", money(order.total, order.currency) ?? "Sin monto")}
          {row("Notas", order.notes || "—")}
          {row("Creado", fmtDate(order.createdAt))}
          {row("Actualizado", fmtDate(order.updatedAt))}
          {row(
            "ID",
            <code style={{ fontSize: 11.5, color: "var(--color-text-tertiary)" }}>{order.id}</code>,
          )}
        </div>
      </div>
    </Modal>
  );
}

export function OrdersKanbanView() {
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const { data: names = {} } = useContactNames();
  const updateOrder = useUpdateOrder();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<OrderStatus | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);

  const byStatus = (status: OrderStatus): Order[] =>
    (orders ?? []).filter((o) => o.status === status);

  const nameOf = (o: Order) => names[o.contactId] ?? "Contacto";

  const move = (id: string, status: OrderStatus, current: OrderStatus) => {
    if (status !== current) updateOrder.mutate({ id, status });
  };

  const onDrop = (e: DragEvent, status: OrderStatus) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    const order = (orders ?? []).find((o) => o.id === id);
    setDraggingId(null);
    if (order) move(order.id, status, order.status);
  };

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--color-background)",
      }}
    >
      <div
        className="flex items-center gap-3"
        style={{
          padding: "18px 28px",
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          Pedidos
        </h1>
        {orders && (
          <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>
            {orders.length} en total
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-tertiary)" }}>
          Arrastrá una tarjeta para moverla · clic para ver el detalle
        </span>
      </div>

      {isLoading && (
        <div
          className="flex items-center justify-center"
          style={{ height: 240, color: "var(--color-text-tertiary)", fontSize: 14 }}
        >
          Cargando pedidos…
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-3" style={{ height: 240 }}>
          <span style={{ color: "var(--color-error)", fontSize: 14 }}>
            No se pudieron cargar los pedidos.
          </span>
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {orders && (
        <div className="flex gap-4" style={{ flex: 1, overflowX: "auto", padding: "20px 28px" }}>
          {ORDER_STAGES.map((stage) => {
            const cards = byStatus(stage.status);
            const isOver = dragOver === stage.status;
            return (
              <div
                key={stage.status}
                style={{
                  ...column,
                  outline: isOver ? "2px solid var(--color-primary)" : "none",
                  outlineOffset: -2,
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOver !== stage.status) setDragOver(stage.status);
                }}
                onDragLeave={(e) => {
                  // Only clear when leaving the column, not when entering a child.
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOver((s) => (s === stage.status ? null : s));
                  }
                }}
                onDrop={(e) => onDrop(e, stage.status)}
              >
                <div
                  className="flex items-center gap-2"
                  style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-border)" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {stage.label}
                  </span>
                  <span
                    className="tnum"
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-tertiary)",
                      background: "var(--color-background)",
                      borderRadius: 9999,
                      padding: "1px 8px",
                    }}
                  >
                    {cards.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2" style={{ padding: 10, overflowY: "auto" }}>
                  {cards.length === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-tertiary)",
                        textAlign: "center",
                        padding: "16px 0",
                      }}
                    >
                      Sin pedidos
                    </div>
                  )}
                  {cards.map((order) => (
                    <div
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Pedido de ${nameOf(order)} — ver detalle`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", order.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(order.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOver(null);
                      }}
                      onClick={() => setDetail(order)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDetail(order);
                        }
                      }}
                      style={{
                        background: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        padding: 12,
                        cursor: "grab",
                        opacity: draggingId === order.id ? 0.5 : 1,
                      }}
                    >
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>
                        {nameOf(order)}
                      </div>
                      {money(order.total, order.currency) && (
                        <div
                          className="tnum"
                          style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}
                        >
                          {money(order.total, order.currency)}
                        </div>
                      )}
                      {order.notes && (
                        <div
                          className="truncate"
                          style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}
                        >
                          {order.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <OrderDetailModal
          order={detail}
          contactName={nameOf(detail)}
          moving={updateOrder.isPending}
          onClose={() => setDetail(null)}
          onMove={(status) => {
            move(detail.id, status, detail.status);
            setDetail({ ...detail, status });
          }}
        />
      )}
    </div>
  );
}
