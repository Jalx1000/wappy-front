import type { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics-support/AnalyticsView";

export const metadata: Metadata = { title: "Analytics de soporte" };

export default function Page() {
  return <AnalyticsView />;
}
