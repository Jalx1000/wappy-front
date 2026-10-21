import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersKanbanView } from "@/components/orders-kanban/OrdersKanbanView";

export const metadata: Metadata = { title: "Pedidos" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrdersKanbanView />
    </Suspense>
  );
}
