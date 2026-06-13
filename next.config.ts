import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build: genera un bundle autocontenido en .next/standalone/
  // listo para correr con `node server.js`. Imprescindible para Docker prod.
  output: "standalone",
};

export default nextConfig;
