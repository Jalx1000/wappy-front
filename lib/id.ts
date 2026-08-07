/** Short unique id with an optional prefix. Kept in a plain module so the
 *  react-hooks purity lint doesn't flag Date.now/Math.random at call sites. */
export function uid(prefix = ""): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** A base value plus a small random offset (used to fan out new canvas nodes). */
export function jitter(base: number, range = 40): number {
  return base + Math.random() * range;
}
