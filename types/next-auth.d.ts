import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
      brandId: string | null;
      accessToken?: string;
      refreshToken?: string;
      tokenExpires?: number;
    };
    error?: "RefreshTokenError";
  }
  interface User {
    role?: string;
    brandId?: string | null;
    accessToken?: string;
    refreshToken?: string;
    tokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    brandId: string | null;
    accessToken?: string;
    refreshToken?: string;
    tokenExpires?: number;
    error?: "RefreshTokenError";
  }
}
