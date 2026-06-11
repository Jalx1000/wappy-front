interface PanelProps {
  title?: string;
  sub?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  pad?: string;
  className?: string;
}

export function Panel({ title, sub, right, children, pad = "16px 20px", className }: PanelProps) {
  return (
    <div className={`fobo-card overflow-hidden ${className ?? ""}`}>
      {(title || right) && (
        <div
          className="flex items-center gap-3 px-5 py-4 flex-none"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          {title && (
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {title}
              </div>
              {sub && (
                <div className="text-[12px] mt-[2px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {sub}
                </div>
              )}
            </div>
          )}
          {right && <div className="flex-shrink-0">{right}</div>}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}
