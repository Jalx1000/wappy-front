import { Icon } from "./Icon";

interface ImagePlaceholderProps {
  label?: string;
  height?: number;
  ratio?: string;
  className?: string;
}

export function ImagePlaceholder({ label, height = 140, ratio, className }: ImagePlaceholderProps) {
  return (
    <div
      className={className}
      style={{
        height: ratio ? undefined : height,
        aspectRatio: ratio ? ratio.replace("/", " / ") : undefined,
        background: "repeating-linear-gradient(135deg, var(--color-background) 0px, var(--color-background) 10px, var(--neutral-100) 10px, var(--neutral-100) 20px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <Icon name="image" size={22} style={{ color: "var(--color-text-disabled)" }} />
      {label && (
        <span className="text-[10.5px] font-medium" style={{ color: "var(--color-text-disabled)" }}>
          {label}
        </span>
      )}
    </div>
  );
}
