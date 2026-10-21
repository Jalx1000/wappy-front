"use client";

import { type CSSProperties } from "react";
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

export function OrdersKanbanView() {
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const { data: names = {} } = useContactNames();
  const updateOrder = useUpdateOrder();

  const byStatus = (status: OrderStatus): Order[] =>
    (orders ?? []).filter((o) => o.status === status);

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
        <div
          className="flex flex-col items-center justify-center gap-3"
          style={{ height: 240 }}
        >
          <span style={{ color: "var(--color-error)", fontSize: 14 }}>
            No se pudieron cargar los pedidos.
          </span>
          <button
            className="fobo-btn fobo-btn-secondary fobo-btn-sm"
            onClick={() => refetch()}
          >
            Reintentar
          </button>
        </div>
      )}

      {orders && (
        <div
          className="flex gap-4"
          style={{ flex: 1, overflowX: "auto", padding: "20px 28px" }}
        >
          {ORDER_STAGES.map((stage) => {
            const cards = byStatus(stage.status);
            return (
              <div key={stage.status} style={column}>
                <div
                  className="flex items-center gap-2"
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
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

                <div
                  className="flex flex-col gap-2"
                  style={{ padding: 10, overflowY: "auto" }}
                >
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
                      style={{
                        background: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {names[order.contactId] ?? "Contacto"}
                      </div>
                      {money(order.total, order.currency) && (
                        <div
                          className="tnum"
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-secondary)",
                            marginTop: 2,
                          }}
                        >
                          {money(order.total, order.currency)}
                        </div>
                      )}
                      {order.notes && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-tertiary)",
                            marginTop: 4,
                          }}
                        >
                          {order.notes}
                        </div>
                      )}
                      <select
                        aria-label="Mover a etapa"
                        value={order.status}
                        disabled={updateOrder.isPending}
                        onChange={(e) =>
                          updateOrder.mutate({
                            id: order.id,
                            status: e.target.value as OrderStatus,
                          })
                        }
                        style={{
                          marginTop: 8,
                          width: "100%",
                          fontSize: 12,
                          padding: "4px 6px",
                          borderRadius: 7,
                          border: "1px solid var(--color-border)",
                          background: "var(--color-surface)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {ORDER_STAGES.map((s) => (
                          <option key={s.status} value={s.status}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
