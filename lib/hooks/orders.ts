"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type Order, type OrderStatus } from "@/lib/api/orders";
import { contactsApi } from "@/lib/api/contacts";

/** All orders of the active brand (the kanban board). */
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list(),
  });
}

/** Contact id → display name, for labelling kanban cards. */
export function useContactNames() {
  return useQuery({
    queryKey: ["orders", "contact-names"],
    queryFn: async () => {
      const page = await contactsApi.list({ page: 1, limit: 200 });
      const map: Record<string, string> = {};
      for (const { contact } of page.data) {
        map[contact.id] = contact.displayName ?? contact.phone ?? contact.id;
      }
      return map;
    },
  });
}

/**
 * Move a card (status) / edit an order. Optimistic: the card jumps to the new
 * column instantly (so a drag feels responsive), rolling back on error and
 * reconciling with the server on settle.
 */
export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["orders"] });
      const previous = qc.getQueryData<Order[]>(["orders"]);
      qc.setQueryData<Order[]>(["orders"], (old) =>
        (old ?? []).map((o) => (o.id === id ? { ...o, status } : o)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(["orders"], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

/**
 * Delete a single order (one card), leaving the contact's other orders intact.
 * Optimistic: the card disappears immediately, rolling back on error.
 */
export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["orders"] });
      const previous = qc.getQueryData<Order[]>(["orders"]);
      qc.setQueryData<Order[]>(["orders"], (old) =>
        (old ?? []).filter((o) => o.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(["orders"], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
