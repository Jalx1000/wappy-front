import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

/**
 * GET /oauth/launch/:channel?brandId=N
 *
 * Toma el JWT de la sesión de NextAuth y lo adjunta como Authorization Bearer
 * al call al backend /api/v1/connections/:channel/authorize. El backend devuelve
 * un 302 con Location apuntando al consent screen NATIVO de la plataforma
 * (facebook.com, business-api.tiktok.com, etc.). Propagamos ese redirect.
 *
 * Esto resuelve el problema de que window.location.href no manda el header
 * Authorization en una navegación normal.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ channel: string }> },
) {
  const { channel } = await context.params;

  // Behind Railway's proxy req.url is the internal http://0.0.0.0:3000 origin,
  // which is useless for a browser redirect. Rebuild the public origin from the
  // forwarded headers (falling back to NEXTAUTH_URL / req.url).
  const fwdHost = req.headers.get("x-forwarded-host");
  const fwdProto = req.headers.get("x-forwarded-proto") ?? "https";
  const publicOrigin = fwdHost
    ? `${fwdProto}://${fwdHost}`
    : process.env.NEXTAUTH_URL ?? new URL(req.url).origin;

  const session = await auth();
  const token = session?.user?.accessToken;
  if (!token) {
    return NextResponse.redirect(new URL("/login", publicOrigin));
  }

  const url = new URL(req.url);
  const brandId = url.searchParams.get("brandId");
  if (!brandId) {
    return new NextResponse("brandId is required", { status: 400 });
  }

  const upstream = await fetch(
    `${BACKEND_URL}/api/v1/connections/${channel}/authorize?brandId=${brandId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "manual",
    },
  );

  const location = upstream.headers.get("location");
  if (!location) {
    const body = await upstream.text().catch(() => "");
    return new NextResponse(
      `Backend no devolvió Location (status ${upstream.status}): ${body}`,
      { status: 502 },
    );
  }

  return NextResponse.redirect(location);
}
