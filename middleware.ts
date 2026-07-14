import NextAuth from "next-auth"; import { authConfig } from "@/auth.config";
export default NextAuth(authConfig).auth((request) => { if (!request.auth) { const url = new URL("/sign-in", request.nextUrl); url.searchParams.set("callbackUrl", request.nextUrl.pathname); return Response.redirect(url); } });
export const config = { matcher: ["/studio/:path*"] };
