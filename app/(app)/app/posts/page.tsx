import type { Metadata } from "next";
import { PostsView } from "@/components/posts/PostsView";
export const metadata: Metadata = { title: "Publicaciones" };
export default function Page() { return <PostsView />; }
