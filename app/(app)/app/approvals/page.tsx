import type { Metadata } from "next";
import { ApprovalsView } from "@/components/approvals/ApprovalsView";
export const metadata: Metadata = { title: "Aprobaciones" };
export default function Page() { return <ApprovalsView />; }
