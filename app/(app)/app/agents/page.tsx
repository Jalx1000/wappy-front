import type { Metadata } from "next";
import { AgentsView } from "@/components/agents/AgentsView";

export const metadata: Metadata = { title: "Agentes IA" };

export default function Page() {
  return <AgentsView />;
}
