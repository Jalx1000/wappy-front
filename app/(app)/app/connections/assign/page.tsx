import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectionAssignmentScreen } from "@/components/connections/ConnectionAssignmentScreen";

export const metadata: Metadata = { title: "Asignar cuentas" };

export default function AssignPage() {
  return (
    <Suspense fallback={null}>
      <ConnectionAssignmentScreen />
    </Suspense>
  );
}
