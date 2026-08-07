import type { Metadata } from "next";
import { IntegrationsView } from "@/components/integrations/IntegrationsView";

export const metadata: Metadata = { title: "Integraciones" };

export default function Page() {
  return <IntegrationsView />;
}
