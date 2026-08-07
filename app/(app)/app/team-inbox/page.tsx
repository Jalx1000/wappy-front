import type { Metadata } from "next";
import { TeamInboxView } from "@/components/team-inbox/TeamInboxView";

export const metadata: Metadata = { title: "Bandeja de equipo" };

export default function Page() {
  return <TeamInboxView />;
}
