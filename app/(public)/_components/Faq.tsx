"use client";

import { useState } from "react";
import type { QA } from "./content";

export function Faq({ items }: { items: QA[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={`qa${isOpen ? " open" : ""}`} key={item.q}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
              {item.q}
              <span className="q-ico">+</span>
            </button>
            <div className="a" style={{ maxHeight: isOpen ? 240 : 0 }}>
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
