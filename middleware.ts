import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth guard
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();

    const session = request.cookies.get("admin_session")?.value;
    const secret = process.env.ADMIN_SECRET;
    const authenticated = secret && session && session === secret;

    if (!authenticated) {
      if (pathname.startsWith("/api/admin/")) {
        return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
      }
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Session cookie for cart persistence
  const res = NextResponse.next();
  if (!request.cookies.get("tbt_sid")) {
    res.cookies.set("tbt_sid", crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/",
    });
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
