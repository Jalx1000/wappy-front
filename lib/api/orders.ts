import { api } from "./client";

/** Kanban stages (backend tokens) and their Spanish column labels. */
export const ORDER_STAGES = [
  { status: "no_atendido", label: "No atendido" },
  { status: "contactado", label: "Cliente contactado" },
  { status: "confirmado", label: "Cliente confirmado" },
  { status: "sin_interes", label: "Cliente sin interés" },
  { status: "entregado", label: "Pedidos entregados" },
  { status: "cancelado", label: "Pedidos cancelados" },
  { status: "otros_servicios", label: "Otros Servicios" },
] as const;

export type OrderStatus = (typeof ORDER_STAGES)[number]["status"];

export interface Order {
  id: string;
  brandId: number;
  contactId: string;
  status: OrderStatus;
  total?: number;
  currency?: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  list: () => api.get<Order[]>("/orders"),

  update: (
    id: string,
    patch: { status?: OrderStatus; total?: number; notes?: string | null },
  ) => api.patch<Order>(`/orders/${id}`, patch),
};
