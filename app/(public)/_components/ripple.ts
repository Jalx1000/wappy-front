import type { MouseEvent } from "react";

/** Material-ish ripple used by the marketing `.btn` elements. */
export function ripple(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const span = document.createElement("span");
  span.className = "ripple";
  const d = Math.max(el.offsetWidth, el.offsetHeight);
  const rect = el.getBoundingClientRect();
  span.style.width = span.style.height = `${d}px`;
  span.style.left = `${e.clientX - rect.left - d / 2}px`;
  span.style.top = `${e.clientY - rect.top - d / 2}px`;
  el.appendChild(span);
  setTimeout(() => span.remove(), 600);
}
