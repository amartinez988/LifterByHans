import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { z } from "zod";

import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const NextAuthHandler = NextAuth as unknown as (config: unknown) => any;

export const { handlers, auth, signIn, signOut } = NextAuthHandler({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({
          where: { email }
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        const membership = await db.companyMember.findFirst({
          where: { userId: user.id }
        });
        const ownedCompany = !membership
          ? await db.company.findFirst({ where: { ownerId: user.id } })
          : null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          companyId: membership?.companyId ?? ownedCompany?.id ?? null,
          companyRole: membership?.role ?? (ownedCompany ? "OWNER" : null)
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({
      token,
      user
    }: {
      token: Record<string, unknown>;
      user?: { id?: string; companyId?: string | null; companyRole?: string | null };
    }) => {
      if (user) {
        token.id = user.id;
        token.companyId = user.companyId ?? null;
        token.companyRole = user.companyRole ?? null;
      }
      return token;
    },
    session: ({
      session,
      token
    }: {
      session: { user?: { id?: string; companyId?: string | null; companyRole?: string | null } };
      token: Record<string, unknown>;
    }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.companyId = (token.companyId as string | null) ?? null;
        session.user.companyRole = (token.companyRole as string | null) ?? null;
      }
      return session;
    }
  }
});
