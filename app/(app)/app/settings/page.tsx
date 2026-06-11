import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/SettingsView";
export const metadata: Metadata = { title: "Configuración" };
export default function Page() { return <SettingsView />; }
