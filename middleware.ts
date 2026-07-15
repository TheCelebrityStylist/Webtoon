import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

const protectedMiddleware = NextAuth(authConfig).auth((request) => {
  if (!request.auth) {
    const url = new URL("/sign-in", request.nextUrl);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return Response.redirect(url);
  }
});

export default function middleware(request: NextRequest) {
  if (!(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET)) {
    const url = new URL("/sign-in", request.nextUrl);
    url.searchParams.set("reason", "configuration");
    return NextResponse.redirect(url);
  }
  return protectedMiddleware(request, {} as never);
}
export const config = { matcher: ["/studio/:path*"] };
