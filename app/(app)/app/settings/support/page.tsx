import type { Metadata } from "next";
import { SupportSettingsView } from "@/components/settings-support/SupportSettingsView";

export const metadata: Metadata = { title: "Ajustes de soporte" };

export default function Page() {
  return <SupportSettingsView />;
}
