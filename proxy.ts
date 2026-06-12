import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Proxy (formerly middleware) — runs before route rendering on the edge.
 *
 * We use NextAuth's `auth()` wrapper instead of reading the session cookie
 * directly so we can see the decoded JWT. This catches two cases the raw
 * cookie check misses:
 *
 *   1. The cookie exists but the JWT inside has expired and refresh failed.
 *      `auth()` invokes the jwt callback, which returns `null` in that case,
 *      so `req.auth` is null and we redirect to /login.
 *
 *   2. The cookie exists and the session has `error: "RefreshTokenError"`,
 *      meaning the access token is unusable. We treat that as logged-out.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session && !session.error;

  if (
    (pathname.startsWith("/app") || pathname.startsWith("/p/")) &&
    !isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|fonts).*)"],
};
