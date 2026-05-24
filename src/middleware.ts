import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/admin/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/health",
  "/api/auth/exists",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET ?? "dev-insecure-secret" });
  const isAuthed = !!token;
  if (!isAuthed) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

