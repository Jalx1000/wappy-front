import type { Metadata } from "next";
import { TagsView } from "@/components/tags/TagsView";

export const metadata: Metadata = { title: "Etiquetas" };

export default function Page() {
  return <TagsView />;
}
