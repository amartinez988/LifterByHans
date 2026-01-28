import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyId?: string | null;
      companyRole?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    companyId?: string | null;
    companyRole?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    companyId?: string | null;
    companyRole?: string | null;
  }
}
