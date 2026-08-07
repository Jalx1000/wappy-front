import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata: Metadata = { title: "Mi perfil" };

export default function Page() {
  return <ProfileView />;
}
