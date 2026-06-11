import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "error" | "warning" | "neutral" | "primary";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-[var(--color-success-bg)] text-[var(--color-success-dark)]",
  error:   "bg-[var(--color-error-bg)] text-[var(--color-error)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  neutral: "bg-[var(--neutral-200)] text-[var(--color-text-secondary)]",
  primary: "bg-[var(--color-primary-subtle)] text-[var(--color-primary-ink)]",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "fobo-badge",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
