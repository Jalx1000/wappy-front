import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MSWProvider } from "@/components/providers/MSWProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--inter",
  subsets: ["latin"],
  display: "swap",
});

const generalSans = localFont({
  variable: "--general-sans",
  src: [
    { path: "../public/fonts/general-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/general-sans-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/general-sans-600.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Wappy", template: "%s · Wappy" },
  description: "Portal de reporting y operaciones de marketing de Wappy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${generalSans.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <MSWProvider>{children}</MSWProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
