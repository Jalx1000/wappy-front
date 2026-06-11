import type { Metadata } from "next";
import { InsightsView } from "@/components/insights/InsightsView";
export const metadata: Metadata = { title: "Insights AI" };
export default function Page() { return <InsightsView />; }
