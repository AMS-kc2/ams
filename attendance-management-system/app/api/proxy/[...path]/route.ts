// app/api/proxy/[...path]/route.ts
import { NextResponse } from "next/server";
import axios, { type AxiosResponse } from "axios";
import cookie from "cookie";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://ams-api-tzrb.onrender.com/v1";
const isProd = process.env.NODE_ENV === "production";

export async function all(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const targetPath = path.join("/"); // e.g. auth/students/log-in or students/me
  const url = `${API_BASE}/${targetPath}`;

  try {
    const method = req.method ?? "GET";
    const headers = Object.fromEntries(Array.from(req.headers.entries()));
    // remove host header to avoid mismatch
    delete headers.host;
    // Forward client cookies (if any) to backend - preserve session for server-to-server calls
    // NOTE: For many flows you may want to forward cookies, but in proxy we often don't need to modify them
    const body =
      method !== "GET" && method !== "HEAD" ? await req.text() : undefined;

    const apiRes: AxiosResponse = await axios({
      url,
      method,
      data: body ? JSON.parse(body) : undefined,
      headers,
      withCredentials: true,
      validateStatus: () => true,
    });

    // Build NextResponse with backend status & body
    const nextRes = NextResponse.json(apiRes.data, { status: apiRes.status });

    // If backend set cookies, parse and set them on the Vercel domain (first-party)
    const setCookieHeader = apiRes.headers?.["set-cookie"];
    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];
      for (const sc of cookies) {
        const firstPair = sc.split(";")[0];
        const parsed = cookie.parse(firstPair);
        const name = Object.keys(parsed)[0];
        const value = parsed[name];
        if (!name) continue;
        nextRes.cookies.set({
          name,
          value: value || "",
          httpOnly: true,
          secure: isProd,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    return nextRes;
  } catch (err: unknown) {
    console.error("[PROXY ERROR]", err);
    const message = axios.isAxiosError(err)
      ? err.response?.data?.message ?? err.message
      : err instanceof Error
      ? err.message
      : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

// Support all HTTP methods
export {
  all as GET,
  all as POST,
  all as PUT,
  all as PATCH,
  all as DELETE,
  all as OPTIONS,
};
