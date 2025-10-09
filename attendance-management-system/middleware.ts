import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, type UserSession } from "./server/types/auth";
import axiosInstance from "@/lib/axios";

// --- ROUTE CONFIG ---
const LOGIN_ROUTE = "/auth/log-in";
const PROTECTION_RULES = { "/student": "student", "/lecturer": "lecturer" };

// --- NEXT MIDDLEWARE CONFIG ---
export const config = {
  matcher: ["/student/:path*", "/lecturer/:path*", "/auth/:path*", "/"],
};

/**
 * Authentication middleware.
 * - Redirects unauthenticated users to login
 * - Redirects authenticated users to /{role}
 */
export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Check which protected route this request falls under
  const [protectedPathKey] = Object.entries(PROTECTION_RULES).find(([path]) =>
    currentPath.startsWith(path)
  ) || [null, null];

  // 🔒 1️⃣ Authentication check
  if (protectedPathKey) {
    if (!token) {
      // No token — redirect to login
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_ROUTE;
      url.searchParams.set("redirect", currentPath);
      return NextResponse.redirect(url);
    }

    // ✅ Token exists, allow access
    return NextResponse.next();
  }

  // 🚪 2️⃣ If on login route and already authenticated → redirect to role dashboard
  if (currentPath.startsWith("/auth") && token) {
    try {
      // Lightweight API call to validate and decode user info
      const data: UserSession = await axiosInstance.get("/auth/user-info", {
        withCredentials: true,
        headers: {
          Cookie: `${COOKIE_NAME}=${token}`,
        },
      });
      console.log(data);
      if (data?.user?.role) {
        const role = data.user.role;
        return NextResponse.redirect(
          new URL(`/${role}/dashboard`, request.url)
        );
      }
    } catch (err) {
      // If invalid, continue to login
      console.warn("Token validation failed:", err);
    }
  }

  // 🌐 3️⃣ Default — let the request through
  return NextResponse.next();
}
