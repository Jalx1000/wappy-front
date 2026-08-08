"use client";

/** Bottom-centered toast. Purely presentational: the parent keeps `text`
    populated while it toggles `show`, so the fade-out transition can play. */
export function Toast({ text, show }: { text: string; show: boolean }) {
  return (
    <div className={`mkt-toast${show ? " show" : ""}`} role="status" aria-live="polite">
      {text}
    </div>
  );
}
