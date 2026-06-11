import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

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
        // In dev/mock mode any valid email + 4+ char password works
        if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
          return {
            id: "mock-user-1",
            name: "María Rojas",
            email: parsed.data.email,
            role: "agency",
            brandId: null,
          };
        }
        // TODO: call backend auth endpoint
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "agency";
        token.brandId = (user as { brandId?: string | null }).brandId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.brandId = token.brandId as string | null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
});
