"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Pill switch. Track carries the state color; styled in globals.css (.fobo-toggle). */
export function Toggle({ checked, onChange, disabled, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className="fobo-toggle"
      onClick={() => onChange(!checked)}
      {...rest}
    />
  );
}
