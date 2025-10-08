"use server";
// server/data/user.dal.ts (Next.js Server-Side Utility)
// NOTE: This runs on the Next.js server (Server Component/Route Handler)

import { cookies } from "next/headers";
import { COOKIE_NAME, JWTPayload } from "../types/auth";
import axiosInstance from "@/lib/axios";

interface UserSession {
  isLoggedIn: boolean;
  user?: JWTPayload;
  error?: string;
}

export async function getUserSession(): Promise<UserSession> {
  // 1. Get the token from the request headers sent by the browser
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return { isLoggedIn: false };
  }

  // 2. Proxy the request to the Express backend (Server-to-Server)
  // We manually forward the cookie here.
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user-info`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          // Manually set the cookie header for the server-to-server call
          Cookie: `${COOKIE_NAME}=${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      // Express server returns { isLoggedIn: true, user: { id, username, role } }
      return { isLoggedIn: true, user: data.user as JWTPayload };
    }

    // Handles 401/403 responses from the Express server
    return { isLoggedIn: false, error: response.statusText };
  } catch (error) {
    console.warn("Error fetching user session from Express:", error);
    return {
      isLoggedIn: false,
      error: "Network error or Express server down.",
    };
  }
}

export async function validateRequest() {
  const { data } = await axiosInstance.get<UserSession>("/user-info");
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}
