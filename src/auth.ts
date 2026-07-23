import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { upsertUser } from "@/lib/data/users-db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.id = profile.sub ?? token.sub ?? user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, profile }) {
      const id = profile?.sub ?? user.id;
      if (!id || !user.email) return;

      await upsertUser({
        id,
        email: user.email,
        name: user.name,
        image: user.image,
      });
    },
  },
});
