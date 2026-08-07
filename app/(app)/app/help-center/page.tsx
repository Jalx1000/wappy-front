import type { Metadata } from "next";
import { HelpCenterView } from "@/components/help-center/HelpCenterView";

export const metadata: Metadata = { title: "Centro de ayuda" };

export default function Page() {
  return <HelpCenterView />;
}
