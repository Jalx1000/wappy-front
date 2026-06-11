import { CHANNEL_META } from "@/lib/mocks/data";

interface ChannelDotProps {
  channel: string;
  size?: number;
  radius?: number;
  className?: string;
}

export function ChannelDot({ channel, size = 28, radius = 8, className }: ChannelDotProps) {
  const meta = CHANNEL_META[channel];
  if (!meta) return null;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: radius,
        background: meta.color,
        color: "#fff",
        fontSize: size * 0.42,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      }}
      title={meta.label}
    >
      {meta.letter}
    </span>
  );
}
