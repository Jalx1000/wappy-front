"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type OrderStatus } from "@/lib/api/orders";
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

/** Move a card (status) / edit an order; refreshes the board on success. */
export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
