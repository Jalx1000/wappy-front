import type { CSSProperties } from "react";

type IconProps = { size?: number; style?: CSSProperties };

export function ArrowRight({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E1300" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function Check({ size = 13, strokeWidth = 3 }: IconProps & { strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E1300" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function Spark({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E1300" strokeWidth="2">
      <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
    </svg>
  );
}

export function Send({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E1300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function Play({ size = 30 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0E1300">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}

export function Apple({ size = 22, fill = "#fff" }: IconProps & { fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M16 1.6c.06.9-.3 1.8-.86 2.43-.6.66-1.55 1.17-2.48 1.1-.07-.88.35-1.8.88-2.36C14.08 2.1 15.1 1.64 16 1.6zM18.9 8.5c-.8.5-1.3 1.4-1.3 2.4 0 1.2.7 2.2 1.7 2.6-.2.6-.5 1.3-.9 1.9-.6.9-1.2 1.8-2.1 1.8-.9 0-1.2-.5-2.2-.5s-1.4.5-2.2.5c-.9 0-1.6-1-2.2-1.9-1.3-1.9-2.3-5.3-1-7.6.7-1.2 1.8-1.9 3-1.9.9 0 1.7.6 2.2.6.5 0 1.5-.7 2.6-.6.5 0 1.8.2 2.7 1.2z" />
    </svg>
  );
}

export function GooglePlay({ size = 22, fill = "#fff" }: IconProps & { fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M3.6 2.4 13 12 3.6 21.6c-.3-.3-.5-.7-.5-1.3V3.7c0-.6.2-1 .5-1.3zM14.3 13.3l2.5 2.5-9.6 5.5 7.1-8zM17.9 9.8l3 1.7c.9.5.9 1.5 0 2l-3 1.7-2.7-2.7 2.7-2.7zM7.2 2.7l9.6 5.5-2.5 2.5-7.1-8z" />
    </svg>
  );
}

/** Channel glyphs for the omnichannel bento cards. */
export function ChannelIcon({ name, size = 17 }: { name: string; size?: number }) {
  switch (name) {
    case "WhatsApp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
          <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.3-1.2l-.3-.2-2.9.9.9-2.8-.2-.3A8 8 0 1 1 12 20z" />
        </svg>
      );
    case "Messenger":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
          <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.3S17.5 2 12 2zm1 12.5-2.5-2.7-4.9 2.7 5.4-5.7 2.6 2.7 4.8-2.7-5.4 5.7z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="#fff" />
        </svg>
      );
    case "Email":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 7 10 6 10-6" />
        </svg>
      );
    default: // Web widget
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E1300" strokeWidth="2">
          <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1 0-18 9 9 0 0 1 9 9z" />
          <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18" />
        </svg>
      );
  }
}
