import type { Metadata } from "next";
import { ReportsView } from "@/components/reports-scheduled/ReportsView";

export const metadata: Metadata = { title: "Reportes programados" };

export default function Page() {
  return <ReportsView />;
}
