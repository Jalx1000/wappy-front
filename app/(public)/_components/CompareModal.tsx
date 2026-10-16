"use client";

import { Fragment } from "react";
import { useMarketing } from "./MarketingProvider";
import { ripple } from "./ripple";
import { Check } from "./Icons";

export function CompareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, startTrial, openDemo } = useMarketing();
  const c = t.compare;

  function cell(value: string | boolean, key: number, highlight: boolean) {
    return (
      <td key={key} className={highlight ? "hl" : undefined}>
        {typeof value === "boolean" ? (
          value ? (
            <span className="cy">
              <Check size={13} strokeWidth={3.5} />
            </span>
          ) : (
            <span className="cn">–</span>
          )
        ) : (
          value
        )}
      </td>
    );
  }

  return (
    <div
      className={`mkt-modal-scrim${open ? " show" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!open}
    >
      <div
        className="mkt-modal mkt-cmp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={c.title}
      >
        <button className="mkt-modal-x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="eyebrow">
          <span className="dot" />
          {c.subtitle}
        </span>
        <h3 className="display" style={{ fontSize: 26, margin: "14px 0 18px" }}>
          {c.title}
        </h3>
        <div className="mkt-cmp-scroll">
          <table className="mkt-cmp-table">
            <thead>
              <tr>
                <th>{c.feature}</th>
                {c.plans.map((p, i) => (
                  <th key={p} className={i === 1 ? "hl" : undefined}>
                    {p}
                    <br />
                    <span>{c.prices[i]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.groups.map((g) => (
                <Fragment key={g.name}>
                  <tr className="grp">
                    <td colSpan={4}>{g.name}</td>
                  </tr>
                  {g.rows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      {row.values.map((v, i) => cell(v, i, i === 1))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              ripple(e);
              onClose();
              startTrial();
            }}
            style={{ flex: 1, justifyContent: "center", minWidth: 160 }}
          >
            {c.ctaTrial}
          </button>
          <button
            className="btn btn-glass"
            onClick={(e) => {
              ripple(e);
              onClose();
              openDemo();
            }}
            style={{ flex: 1, justifyContent: "center", minWidth: 140, border: "1px solid #e7eaee" }}
          >
            {c.ctaDemo}
          </button>
        </div>
      </div>
    </div>
  );
}
