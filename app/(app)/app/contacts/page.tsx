import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactsView } from "@/components/contacts/ContactsView";
export const metadata: Metadata = { title: "Contactos" };
export default function Page() {
  return (
    <Suspense fallback={null}>
      <ContactsView />
    </Suspense>
  );
}
