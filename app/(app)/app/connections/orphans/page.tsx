import type { Metadata } from "next";
import { OrphansList } from "@/components/connections/OrphansList";

export const metadata: Metadata = { title: "Cuentas sin asignar" };

export default function OrphansPage() {
  return <OrphansList />;
}
