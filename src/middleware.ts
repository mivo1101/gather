import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/home/:path*",
    "/invitations/:path*",
    "/templates/:path*",
    "/guests/:path*",
    "/insights/:path*",
    "/brand-kit/:path*",
    "/settings/:path*",
  ],
};
