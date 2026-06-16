"use client";

const PRESET_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

// Resolve the effective from/to for the current range value (preset or custom),
// so the inputs always reflect the active window without local state.
function effectiveDates(value: string): { from: string; to: string } {
  if (value.startsWith("custom:")) {
    const [, from, to] = value.split(":");
    return { from: from ?? "", to: to ?? "" };
  }
  const days = PRESET_DAYS[value] ?? 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

// Emits range as "custom:YYYY-MM-DD:YYYY-MM-DD" when either date changes.
export function DateRangeInputs({
  value,
  onChange,
}: {
  value: string;
  onChange: (range: string) => void;
}) {
  const { from, to } = effectiveDates(value);
  const today = new Date().toISOString().slice(0, 10);

  const inputStyle = {
    fontSize: 12,
    padding: "5px 8px",
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--ff-sans, Inter, sans-serif)",
  } as const;

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="date"
        value={from}
        max={to || today}
        onChange={(e) => e.target.value && onChange(`custom:${e.target.value}:${to}`)}
        style={inputStyle}
        title="Desde"
        aria-label="Fecha inicio"
      />
      <span style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}>→</span>
      <input
        type="date"
        value={to}
        min={from || undefined}
        max={today}
        onChange={(e) => e.target.value && onChange(`custom:${from}:${e.target.value}`)}
        style={inputStyle}
        title="Hasta"
        aria-label="Fecha fin"
      />
    </div>
  );
}
