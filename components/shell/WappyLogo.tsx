interface WappyLogoProps {
  collapsed?: boolean;
  size?: "sm" | "md";
}

export function WappyLogo({ collapsed, size = "md" }: WappyLogoProps) {
  const iconSize = size === "sm" ? 30 : 34;
  const fontSize = size === "sm" ? 16 : 20;

  return (
    <div className="flex items-center gap-[10px]">
      <img className="flex items-center justify-center text-white flex-shrink-0 rounded-[6px]" src="/wappy-logotipo.jpg" alt="wappy" style={{
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
          Wappy
        </span>
      )}
    </div>
  );
}
