import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "./server/types/auth";

const LOGIN_ROUTE = "/auth/log-in";
const PROTECTION_RULES = { "/student": "student", "/lecturer": "lecturer" };

export const config = {
  matcher: ["/student/:path*", "/lecturer/:path*", "/auth/:path*", "/"],
};

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 1️⃣ Check if route is protected
  const [protectedPathKey] = Object.entries(PROTECTION_RULES).find(([path]) =>
    currentPath.startsWith(path)
  ) || [null, null];

  if (protectedPathKey) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_ROUTE;
      url.searchParams.set("redirect", currentPath);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2️⃣ If on /auth/* but already authenticated → redirect to dashboard
  if (currentPath.startsWith("/auth") && token) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/user-info`,
        {
          headers: {
            Cookie: `${COOKIE_NAME}=${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();
      const role = data?.user?.role;

      if (role) {
        if (role === "student") {
          const studentRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/students/me`,
            {
              headers: { Cookie: `${COOKIE_NAME}=${token}` },
            }
          );

          // ❌ If invalid student, delete cookie and redirect to login
          if (!studentRes.ok) {
            const response = NextResponse.redirect(
              new URL(LOGIN_ROUTE, request.url)
            );
            response.cookies.delete(COOKIE_NAME);
            return response;
          }
        }

        // ✅ Authenticated & valid → redirect to dashboard
        return NextResponse.redirect(
          new URL(`/${role}/dashboard`, request.url)
        );
      }
    } catch (err) {
      console.warn("Token validation failed:", err);
      const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // 3️⃣ Default
  return NextResponse.next();
}
