"use client";

import { useMarketing } from "./MarketingProvider";
import { ripple } from "./ripple";
import { ArrowRight } from "./Icons";

export function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, toast, startTrial } = useMarketing();
  const d = t.demo;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
    toast(t.toasts.demoRequested);
  }

  return (
    <div
      className={`mkt-modal-scrim${open ? " show" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!open}
    >
      <div className="mkt-modal" role="dialog" aria-modal="true" aria-label={d.title}>
        <button className="mkt-modal-x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="eyebrow">
          <span className="dot" />
          {d.eyebrow}
        </span>
        <h3 className="display" style={{ fontSize: 28, margin: "14px 0 6px" }}>
          {d.title}
        </h3>
        <p style={{ color: "#5a6470", fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>
          {d.sub}
        </p>
        <form onSubmit={onSubmit}>
          <input className="fld" type="text" placeholder={d.name} required />
          <input className="fld" type="email" placeholder={d.email} required />
          <input className="fld" type="text" placeholder={d.company} />
          <select className="fld" defaultValue={d.teamSizes[0]}>
            {d.teamSizes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            type="submit"
            onClick={ripple}
            style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
          >
            {d.submit}{" "}
            <span className="pip">
              <ArrowRight />
            </span>
          </button>
        </form>
        <p style={{ fontSize: 12, color: "#5a6470", textAlign: "center", margin: "14px 0 0" }}>
          {d.orStart}{" "}
          <a
            href="#"
            className="legal-link"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              startTrial();
            }}
          >
            {d.trialLink}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
