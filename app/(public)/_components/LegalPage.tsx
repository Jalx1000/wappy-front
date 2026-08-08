"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useMarketing } from "./MarketingProvider";
import { LEGAL, type Block, type LegalKind } from "./legal";

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case "p":
      return <p key={key}>{block.text}</p>;
    case "ul":
      return (
        <ul key={key}>
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case "table":
      return (
        <table className="cookie-table" key={key}>
          <thead>
            <tr>
              {block.headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td key={i}>{i === 0 ? <strong>{cell}</strong> : cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "contact":
      return (
        <p key={key}>
          {block.text}{" "}
          <a className="legal-link" href={`mailto:${block.email}`}>
            {block.email}
          </a>
          .
        </p>
      );
  }
}

export function LegalPage({ kind }: { kind: LegalKind }) {
  const { lang } = useMarketing();
  const doc = LEGAL[lang][kind];

  return (
    <>
      <header className="legal-hero">
        <div className="cloud" style={{ top: 60, left: -40, width: 260, height: 110 }} />
        <div className="cloud" style={{ top: 120, right: -30, width: 220, height: 90 }} />
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            {doc.eyebrow}
          </span>
          <h1 className="display">{doc.title}</h1>
          <p>{doc.updated}</p>
          <div className="legal-toc">
            {doc.toc.map((t) => (
              <a key={t.id} href={`#${t.id}`}>
                {t.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="legal-body">
        {doc.intro.map((b, i) => renderBlock(b, i))}
        {doc.sections.map((s) => (
          <Fragment key={s.id}>
            <h2 id={s.id}>{s.heading}</h2>
            {s.blocks.map((b, i) => renderBlock(b, i))}
          </Fragment>
        ))}
        <p style={{ marginTop: 40 }}>
          <Link className="btn btn-glass btn-sm" href="/" style={{ border: "1px solid var(--line)" }}>
            {doc.back}
          </Link>
        </p>
      </main>
    </>
  );
}
