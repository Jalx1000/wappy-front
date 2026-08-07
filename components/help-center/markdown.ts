// Minimal, safe Markdown → HTML for the article preview (token-styled inline).
export function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = (md || "").split("\n");
  let html = "", inCode = false, inList = false, code = "";
  const inline = (t: string) =>
    esc(t)
      .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);background:var(--neutral-100);padding:1px 5px;border-radius:5px;font-size:0.9em">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--color-primary-ink);text-decoration:underline">$1</a>');
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) { html += `<pre style="background:var(--color-surface-dark);color:#d7f56b;padding:12px 14px;border-radius:10px;overflow:auto;font-family:var(--font-mono);font-size:12.5px;line-height:1.5"><code>${esc(code)}</code></pre>`; code = ""; inCode = false; }
      else { closeList(); inCode = true; }
      continue;
    }
    if (inCode) { code += (code ? "\n" : "") + line; continue; }
    if (/^###\s/.test(line)) { closeList(); html += `<h3 style="font-size:16px;font-weight:600;margin:16px 0 6px;color:var(--color-text-primary)">${inline(line.replace(/^###\s/, ""))}</h3>`; }
    else if (/^##\s/.test(line)) { closeList(); html += `<h2 style="font-size:19px;font-weight:700;margin:18px 0 8px;color:var(--color-text-primary)">${inline(line.replace(/^##\s/, ""))}</h2>`; }
    else if (/^#\s/.test(line)) { closeList(); html += `<h1 style="font-size:23px;font-weight:700;margin:8px 0 10px;color:var(--color-text-primary)">${inline(line.replace(/^#\s/, ""))}</h1>`; }
    else if (/^>\s/.test(line)) { closeList(); html += `<blockquote style="border-left:3px solid var(--color-primary);padding:6px 14px;margin:10px 0;color:var(--color-text-secondary);background:var(--color-primary-subtle);border-radius:0 8px 8px 0">${inline(line.replace(/^>\s/, ""))}</blockquote>`; }
    else if (/^(\d+)\.\s/.test(line)) { closeList(); const n = line.match(/^(\d+)\./)![1]; html += `<div style="display:flex;gap:8px;margin:4px 0"><span style="color:var(--color-primary-ink);font-weight:600">${n}.</span><span>${inline(line.replace(/^\d+\.\s/, ""))}</span></div>`; }
    else if (/^[-*]\s/.test(line)) { if (!inList) { html += '<ul style="margin:6px 0;padding-left:20px;display:flex;flex-direction:column;gap:3px">'; inList = true; } html += `<li>${inline(line.replace(/^[-*]\s/, ""))}</li>`; }
    else if (line.trim() === "") { closeList(); }
    else { closeList(); html += `<p style="margin:6px 0;line-height:1.6;color:var(--color-text-secondary)">${inline(line)}</p>`; }
  }
  closeList();
  return html;
}

export const MD_SNIPPETS: { label: string; insert: string; bold?: boolean }[] = [
  { label: "H2", insert: "## Título" },
  { label: "B", insert: "**negrita**", bold: true },
  { label: "•", insert: "- elemento" },
  { label: "1.", insert: "1. paso" },
  { label: "“ ”", insert: "> cita" },
  { label: "</>", insert: "```\ncódigo\n```" },
  { label: "link", insert: "[texto](https://wappy.dev)" },
];
