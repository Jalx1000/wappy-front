import Link from "next/link";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-background)",
        color: "var(--color-text-primary)",
      }}
    >
      <header
        style={{
          padding: "18px 32px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              textDecoration: "none",
            }}
          >
            Fobo Ads
          </Link>
          <nav
            style={{ display: "flex", gap: 18, fontSize: 13.5 }}
          >
            <Link
              href="/privacy-policy"
              style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
            >
              Política de privacidad
            </Link>
            <Link
              href="/terms"
              style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
            >
              Términos
            </Link>
            <Link
              href="/auth/login"
              style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: "48px 32px",
        }}
      >
        <article
          style={{
            maxWidth: 760,
            margin: "0 auto",
            fontFamily: "var(--ff-text)",
            fontSize: 15,
            lineHeight: 1.65,
            color: "var(--color-text-primary)",
          }}
        >
          {children}
        </article>
      </main>

      <footer
        style={{
          padding: "24px 32px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          fontSize: 12.5,
          color: "var(--color-text-tertiary)",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            © {new Date().getFullYear()} Sofopolis · Fobo Ads. Todos los derechos reservados.
          </div>
          <div>
            <a
              href="mailto:soporte@sofopolis.com"
              style={{ color: "var(--color-text-tertiary)", textDecoration: "none" }}
            >
              soporte@sofopolis.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
