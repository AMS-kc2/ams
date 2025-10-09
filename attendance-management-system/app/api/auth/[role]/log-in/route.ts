// // app/api/auth/[role]/log-in/route.ts
// import { NextResponse } from "next/server";
// import axiosInstance from "@/lib/axios";
// import cookie from "cookie"; // npm i cookie

// const isProd = process.env.NODE_ENV === "production";

// export async function POST(
//   req: Request,
//   ctx: { params: Promise<{ role: string }> }
// ) {
//   try {
//     const { role } = await ctx.params;
//     const body = await req.json();

//     // Ask axiosInstance to not throw on non-2xx so we can inspect headers
//     const res = await axiosInstance.post(`/auth/${role}/log-in`, body, {
//       validateStatus: () => true,
//     });

//     // res is unwrapped by your interceptor: either data or data.data; check shape
//     // but axiosInstance still exposes raw headers via (res as any).headers if needed.
//     // To forward cookie, we need the raw headers from axios. So request raw via axios (imported raw axios) OR read res as any.headers.
//     const rawHeaders = res?.headers ?? {}; // axios's headers
//     const setCookieHeader =
//       rawHeaders["set-cookie"] || rawHeaders["Set-Cookie"];

//     console.log(res, rawHeaders, setCookieHeader);
//     const nextRes = NextResponse.json(
//       { status: "success", data: res },
//       { status: res.status || 200 }
//     );

//     // If backend returned Set-Cookie(s), parse and re-set cookie(s) on Vercel domain
//     if (setCookieHeader) {
//       const cookies = Array.isArray(setCookieHeader)
//         ? setCookieHeader
//         : [setCookieHeader];
//       cookies.forEach((sc: string) => {
//         // parse name=value
//         const parsed = cookie.parse(sc.split(";")[0]); // "name=value; ...", take first segment
//         const name = Object.keys(parsed)[0];
//         const value = parsed[name];

//         if (!name) return;

//         // set options — make it HttpOnly, secure in prod, path '/', and persistent
//         nextRes.cookies.set({
//           name,
//           value: value || "", // Ensure value is a string
//           httpOnly: true,
//           secure: isProd,
//           sameSite: isProd ? "lax" : "lax", // proxy is same-origin, 'lax' is fine
//           path: "/",
//           maxAge: 60 * 60 * 24 * 7, // 7 days
//         });
//       });
//     }

//     return nextRes;
//   } catch (err) {
//     console.error("[PROXY ERROR]", err);
//     return NextResponse.json(
//       { status: "error", message: err || "Proxy error" },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/[role]/log-in/route.ts
import { NextResponse } from "next/server";
import axios, { type AxiosResponse } from "axios";
import cookie from "cookie";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://ams-api-tzrb.onrender.com/v1";
const isProd = process.env.NODE_ENV === "production";

function parseError(err: unknown): { message: string; status?: number } {
  if (axios.isAxiosError(err)) {
    // AxiosError<T> may have response?.data shape; prefer message from response if present
    const msg =
      typeof err.response?.data === "object" && err.response?.data !== null
        ? // attempt to pull message field from response body
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((err.response?.data as any).message as string | undefined) ??
          err.message
        : err.message;
    return { message: msg, status: err.response?.status };
  }

  if (err instanceof Error) {
    return { message: err.message };
  }

  // Fallback for non-Error values
  return { message: String(err) };
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ role: string }> }
) {
  try {
    const { role } = await ctx.params;
    const body = await req.json();

    // Use raw axios so we can access headers including set-cookie
    const apiRes: AxiosResponse = await axios.post(
      `${API_BASE}/auth/${role}/log-in`,
      body,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        validateStatus: () => true,
      }
    );

    // Forward backend body & status
    const nextRes = NextResponse.json(apiRes.data, { status: apiRes.status });

    // Forward cookies by parsing backend Set-Cookie and re-setting them on Vercel domain
    const setCookieHeader = apiRes.headers?.["set-cookie"];
    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];

      for (const sc of cookies) {
        const firstPair = sc.split(";")[0]; // "name=value"
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
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }
    }

    return nextRes;
  } catch (err: unknown) {
    console.error("[PROXY ERROR]", err);
    const { message, status } = parseError(err);
    return NextResponse.json(
      { status: "error", message },
      { status: status ?? 500 }
    );
  }
}
