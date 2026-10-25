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

export interface OrderItem {
  productName: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  brandId: number;
  contactId: string;
  status: OrderStatus;
  /** lead | woocommerce | manual */
  source?: string;
  externalId?: string | null;
  orderNumber?: string | null;
  items?: OrderItem[] | null;
  total?: number;
  currency?: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  list: () => api.get<Order[]>("/orders"),

  /** A single contact's orders — used to warn with the count before deleting it. */
  listForContact: (contactId: string) =>
    api.get<Order[]>(`/orders?contactId=${encodeURIComponent(contactId)}`),

  update: (
    id: string,
    patch: {
      status?: OrderStatus;
      total?: number;
      notes?: string | null;
      items?: OrderItem[] | null;
    },
  ) => api.patch<Order>(`/orders/${id}`, patch),

  remove: (id: string) => api.delete<void>(`/orders/${id}`),
};
