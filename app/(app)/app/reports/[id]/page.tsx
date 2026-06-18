"use client";

import { useParams } from "next/navigation";
import { ReportDocument } from "@/components/reports/ReportDocument";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  if (!Number.isFinite(id)) return null;
  return <ReportDocument id={id} />;
}
