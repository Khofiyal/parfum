// src/lib/auth/auth.config.ts
// Konfigurasi Auth.js (NextAuth v5)

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env["AUTH_GOOGLE_ID"]!,
      clientSecret: process.env["AUTH_GOOGLE_SECRET"]!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validasi input dengan Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            passwordHash: true,
            isSuspended: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        if (user.isSuspended) return null;

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
    updateAge: 24 * 60 * 60,   // Rotate setiap 24 jam
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Saat login pertama — tambahkan data ke token
      if (user) {
        token["id"] = user.id;
        token["role"] = (user as { role?: string }).role ?? "USER";
      }

      // Saat update session (misalnya role berubah)
      if (trigger === "update" && (session as { role?: string } | null)?.role) {
        token["role"] = (session as { role: string }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (token["id"]) {
        session.user.id = token["id"] as string;
        session.user.role = token["role"] as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      // Block user yang di-suspend
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { isSuspended: true },
        });
        if (dbUser?.isSuspended) return false;
      }
      return true;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: isNewUser ? "USER_REGISTER" : "USER_LOGIN",
          entity: "User",
          entityId: user.id,
          metadata: { provider: account?.provider },
        },
      });
    },
  },

  debug: process.env["NODE_ENV"] === "development",
};
