"use client";

import { useParams } from "next/navigation";
import { ObjectRecordsView } from "@/components/objects/ObjectRecordsView";

export default function ObjectPage() {
  const params = useParams<{ moduleId: string }>();
  return <ObjectRecordsView moduleId={params.moduleId} />;
}
