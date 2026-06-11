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
    };
  }
  interface User {
    role?: string;
    brandId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    brandId: string | null;
  }
}
