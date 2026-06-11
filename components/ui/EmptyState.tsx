import { Icon } from "./Icon";
import type { IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "spark", title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-4">
      <span
        className="flex items-center justify-center rounded-[16px]"
        style={{
          width: 64,
          height: 64,
          background: "var(--color-primary-subtle)",
          color: "var(--color-primary-ink)",
        }}
      >
        <Icon name={icon} size={28} color="var(--color-primary-ink)" />
      </span>
      <div>
        <div
          className="text-[18px] font-semibold tracking-[-0.015em]"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        >
          {title}
        </div>
        {body && (
          <div
            className="text-[14px] mt-2 max-w-[360px] leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {body}
          </div>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
