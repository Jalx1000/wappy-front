import type { Metadata } from "next";
import { AssetsView } from "@/components/assets/AssetsView";

export const metadata: Metadata = { title: "Artes (DAM)" };

export default function Page() {
  return <AssetsView />;
}
