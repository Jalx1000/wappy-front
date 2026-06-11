interface FoboLogoProps {
  collapsed?: boolean;
  size?: "sm" | "md";
}

export function FoboLogo({ collapsed, size = "md" }: FoboLogoProps) {
  const iconSize = size === "sm" ? 30 : 34;
  const fontSize = size === "sm" ? 16 : 20;

  return (
    <div className="flex items-center gap-[10px]">
      <img className="flex items-center justify-center text-white flex-shrink-0 rounded-[6px]" src="/fobo-logotipo.png" alt="fobo" style={{
          width: iconSize,
          height: iconSize,
                 }}
      />
      {!collapsed && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize,
            letterSpacing: "-0.04em",
            color: "var(--color-text-primary)",
          }}
        >
          fobo
        </span>
      )}
    </div>
  );
}
