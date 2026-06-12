import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

type BackendUser = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: { id: number; name: string };
};

type BackendLoginResponse = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: BackendUser;
};

async function refreshBackendToken(refreshToken: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as Pick<
      BackendLoginResponse,
      "token" | "refreshToken" | "tokenExpires"
    >;
  } catch {
    // fetch throws on network errors (ECONNREFUSED, DNS, etc.) — distinct from
    // a 4xx/5xx response. Treat the same as a failed refresh.
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "fobo-dev-secret-change-in-production",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        if (USE_MOCKS) {
          return {
            id: "mock-user-1",
            name: "María Rojas",
            email: parsed.data.email,
            role: "agency",
            brandId: null,
          };
        }

        try {
          const res = await fetch(`${BACKEND_URL}/api/v1/auth/email/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
          });
          if (!res.ok) return null;
          const data = (await res.json()) as BackendLoginResponse;
          const fullName = [data.user.firstName, data.user.lastName]
            .filter(Boolean)
            .join(" ");
          return {
            id: String(data.user.id),
            email: data.user.email,
            name: fullName || data.user.email,
            role: data.user.role?.name?.toLowerCase() ?? "client",
            brandId: null,
            accessToken: data.token,
            refreshToken: data.refreshToken,
            tokenExpires: data.tokenExpires,
          };
        } catch (err) {
          console.error("auth.authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "agency";
        token.brandId = (user as { brandId?: string | null }).brandId ?? null;
        const u = user as {
          accessToken?: string;
          refreshToken?: string;
          tokenExpires?: number;
        };
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.tokenExpires = u.tokenExpires;
        return token;
      }

      // Mocks: no backend round-trip, keep session indefinitely.
      if (USE_MOCKS) return token;

      // No expires recorded → can't reason about freshness; let it pass through.
      // (Should only happen for OAuth providers like Google that don't set it.)
      if (!token.tokenExpires) return token;

      const expiresAt = Number(token.tokenExpires);
      const now = Date.now();
      const stillFresh = now < expiresAt - 30_000;

      // Token still valid for at least 30s — no refresh needed.
      if (stillFresh) return token;

      // Token expired or about to expire. Try to refresh.
      if (!token.refreshToken) {
        // No refresh token available → invalidate session.
        return null;
      }

      const refreshed = await refreshBackendToken(String(token.refreshToken));
      if (refreshed) {
        token.accessToken = refreshed.token;
        token.refreshToken = refreshed.refreshToken;
        token.tokenExpires = refreshed.tokenExpires;
        delete token.error;
        return token;
      }

      // Refresh failed. If the access token is *already past* its expiry, the
      // session is unusable — invalidate so NextAuth deletes the cookie and
      // the proxy redirects to /login. If we only tried preemptively (within
      // the 30s pre-expiry window), keep the session and flag the error so
      // the client UI can show a banner / silently retry later.
      if (now >= expiresAt) return null;
      token.error = "RefreshTokenError";
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.brandId = token.brandId as string | null;
      session.user.accessToken = token.accessToken as string | undefined;
      session.user.refreshToken = token.refreshToken as string | undefined;
      session.user.tokenExpires = token.tokenExpires as number | undefined;
      if (token.error)
        session.error = token.error as "RefreshTokenError";
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
});
