import type { Metadata } from "next";
import { WebGA4 } from "@/components/analytics/WebGA4";
export const metadata: Metadata = { title: "Web · GA4" };
export default function Page() { return <WebGA4 />; }
