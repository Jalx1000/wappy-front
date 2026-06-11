import type { Metadata } from "next";
import { InfluencersView } from "@/components/influencers/InfluencersView";
export const metadata: Metadata = { title: "Influencers" };
export default function Page() { return <InfluencersView />; }
