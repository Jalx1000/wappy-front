import type { Metadata } from "next";
import { BroadcastsView } from "@/components/broadcasts/BroadcastsView";

export const metadata: Metadata = { title: "Mensajes proactivos" };

export default function Page() {
  return <BroadcastsView />;
}
