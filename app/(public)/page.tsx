import type { Metadata } from "next";
import { Landing } from "./_components/Landing";

export const metadata: Metadata = {
  title: { absolute: "Wappy — Habla con cada cliente, desde una bandeja veloz" },
  description:
    "Wappy unifica WhatsApp, Instagram, email y chat web en una sola bandeja — con IA, automatizaciones y un centro de ayuda integrado.",
};

export default function HomePage() {
  return <Landing />;
}
