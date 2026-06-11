import type { Metadata } from "next";
import { ConnectionsHub } from "@/components/connections/ConnectionsHub";

export const metadata: Metadata = { title: "Conexiones" };

export default function ConnectionsPage() {
  return <ConnectionsHub />;
}
