import type { Metadata } from "next";
import { BotBuilderView } from "@/components/bot-builder/BotBuilderView";

export const metadata: Metadata = { title: "Bot Builder" };

export default function Page() {
  return <BotBuilderView />;
}
