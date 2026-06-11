import type { Metadata } from "next";
import { InboxView } from "@/components/inbox/InboxView";
export const metadata: Metadata = { title: "Bandeja Social" };
export default function Page() { return <InboxView />; }
