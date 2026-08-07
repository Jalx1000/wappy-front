import type { Metadata } from "next";
import { AutomationsView } from "@/components/automations/AutomationsView";

export const metadata: Metadata = { title: "Automatizaciones" };

export default function Page() {
  return <AutomationsView />;
}
