// Mock URL webhook que el usuario pega en Meta for Developers.
// En producción este endpoint es real y público en el backend 01.back.
export const MOCK_WEBHOOK_URL = (
  brandId?: string | number,
  brandSlug?: string,
) => {
  const base =
    typeof process !== "undefined"
      ? (process.env as any).NEXT_PUBLIC_API_URL ?? "http://localhost:3100"
      : "http://localhost:3100";
  const id = brandSlug
    ? encodeURIComponent(brandSlug)
    : String(brandId ?? "demo");
  return `${base}/api/v1/whatsapp/webhook/${id}`;
};
export const MOCK_VERIFY_TOKEN = "WAPPY_WA_VERIFY_2026";
