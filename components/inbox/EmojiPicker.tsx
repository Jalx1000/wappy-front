"use client";

import { useState } from "react";

const GROUPS: { id: string; label: string; emojis: string[] }[] = [
  { id: "smileys", label: "😀", emojis: "😀 😁 😂 🤣 😊 😍 😘 😎 🤩 🥳 🙂 😉 😇 🤗 🤔 😴 😢 😭 😅 😬 😳 🥺 😤 😱 🙃 😐 😷 🤯 😜 🤪 😏 😌".split(" ") },
  { id: "gestures", label: "👍", emojis: "👍 👎 👏 🙌 🙏 👌 🤝 ✌️ 🤞 💪 👋 🫶 🤙 👊 ✋ 🖐️ 👇 👉 👈 ☝️ 💅 🫡".split(" ") },
  { id: "hearts", label: "❤️", emojis: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💖 💕 💔 ❣️ 💯 ✨ ⭐ 🔥 🎉 🎊 🎁 🏆 ✅ ⚡".split(" ") },
  { id: "objects", label: "📦", emojis: "📦 📱 💻 📧 📄 📎 📌 🔗 💳 🛒 🚀 ⏰ 📅 🔔 💡 🔒 🔑 📈 📉 💬 📞 🎯".split(" ") },
];

export function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  const [group, setGroup] = useState(GROUPS[0].id);
  const active = GROUPS.find((g) => g.id === group) || GROUPS[0];
  return (
    <>
      <div className="fixed inset-0 z-[10]" onClick={onClose} />
      <div
        className="absolute z-[20]"
        style={{ bottom: 46, left: 0, width: 280, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 8 }}
      >
        <div className="flex gap-1 mb-2" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: 6 }}>
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              className="cursor-pointer rounded-[8px] text-[16px] leading-none"
              style={{
                width: 34, height: 30, border: "none",
                background: group === g.id ? "var(--color-primary-subtle)" : "transparent",
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(8, 1fr)", gap: 2, maxHeight: 168, overflowY: "auto" }}>
          {active.emojis.map((e, i) => (
            <button
              key={g_key(active.id, i)}
              type="button"
              onClick={() => onPick(e)}
              className="cursor-pointer rounded-[7px] text-[18px] leading-none flex items-center justify-center"
              style={{ height: 32, border: "none", background: "transparent" }}
              onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--color-background)")}
              onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

const g_key = (id: string, i: number) => `${id}-${i}`;
