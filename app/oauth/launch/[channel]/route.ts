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
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
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
