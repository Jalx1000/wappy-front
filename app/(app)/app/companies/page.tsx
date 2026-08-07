import type { Metadata } from "next";
import { CompaniesView } from "@/components/companies/CompaniesView";

export const metadata: Metadata = { title: "Empresas" };

export default function Page() {
  return <CompaniesView />;
}
