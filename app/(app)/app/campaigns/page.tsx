import type { Metadata } from "next";
import { CampaignsView } from "@/components/campaigns/CampaignsView";
export const metadata: Metadata = { title: "Campañas" };
export default function Page() { return <CampaignsView />; }
