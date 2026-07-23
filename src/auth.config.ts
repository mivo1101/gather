import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-compatible Auth.js config used by middleware.
 * Keep database calls out of this file.
 */
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAppRoute =
        pathname.startsWith("/home") ||
        pathname.startsWith("/invitations") ||
        pathname.startsWith("/templates") ||
        pathname.startsWith("/guests") ||
        pathname.startsWith("/insights") ||
        pathname.startsWith("/brand-kit") ||
        pathname.startsWith("/settings");

      if (isAppRoute) {
        return !!auth?.user;
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
