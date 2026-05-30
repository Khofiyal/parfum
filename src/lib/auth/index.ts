// src/lib/auth/index.ts
// Export NextAuth handlers, auth() helper, dan signIn/signOut

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const {
  handlers,   // { GET, POST } — di-export ke app/api/auth/[...nextauth]/route.ts
  auth,       // Session helper — pakai di Server Components & Server Actions
  signIn,     // Untuk trigger login dari Server Action
  signOut,    // Untuk trigger logout dari Server Action
} = NextAuth(authConfig);

// ─── Type augmentation ────────────────────────────────────────────────────────
// Extend NextAuth types agar TypeScript tahu field tambahan (id, role)

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
