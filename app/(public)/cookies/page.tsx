import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Cómo Wappy usa cookies y tecnologías similares en sus sitios web y plataforma.",
};

export default function CookiesPage() {
  return <LegalPage kind="cookies" />;
}
