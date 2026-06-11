import type { Metadata } from "next";
import { SocialAnalytics } from "@/components/analytics/SocialAnalytics";
export const metadata: Metadata = { title: "Social Analytics" };
export default function Page() { return <SocialAnalytics />; }
