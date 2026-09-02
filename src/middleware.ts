import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/cart", "/checkout", "/orders", "/admin"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "111bakery-secret-key-production-ready-2026-super-secure",
  });

  // Not logged in -> redirect to login with callbackUrl
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection: customers accessing /admin/* will be shown not authorized
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    return NextResponse.rewrite(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/admin/:path*",
  ],
};
