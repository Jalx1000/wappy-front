"use client";

import { Icon } from "./Icon";

interface Props {
  module: string;
  reason?: string;
  brandName?: string;
}

export function DemoBanner({ module, reason, brandName }: Props) {
  const defaultReason = `Aún no hay endpoint de backend para ${module}.`;
  const tail = brandName
    ? ` Cuando se integre, esta vista mostrará datos reales de ${brandName}.`
    : ` Cuando se integre, esta vista mostrará datos reales.`;
  return (
    <div
      className="flex items-center gap-2 px-4 py-[10px] rounded-[12px] mb-5"
      style={{
        background: "var(--color-warning-bg)",
        color: "var(--color-warning)",
        fontSize: 13,
        border: "1px solid var(--color-warning)",
      }}
    >
      <Icon name="warning" size={15} color="var(--color-warning)" />
      <span>
        <strong>Datos de demostración.</strong> {reason ?? defaultReason}
        {tail}
      </span>
    </div>
  );
}
