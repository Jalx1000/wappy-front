import type { Metadata } from "next";
import { PaidMedia } from "@/components/analytics/PaidMedia";
export const metadata: Metadata = { title: "Paid Media · Ads" };
export default function Page() { return <PaidMedia />; }
