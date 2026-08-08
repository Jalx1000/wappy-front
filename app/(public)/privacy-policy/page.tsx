import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad de Wappy — datos que recopilamos, cómo los usamos y tus derechos.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage kind="privacy" />;
}
