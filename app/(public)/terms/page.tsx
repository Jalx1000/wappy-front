import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de la plataforma de soporte al cliente Wappy.",
};

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
