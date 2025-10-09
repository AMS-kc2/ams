import { NextResponse } from "next/server";
import axiosInstance from "@/lib/axios"; // preconfigured Axios instance

export async function POST(
  req: Request,
  ctx: { params: Promise<{ role: string }> }
) {
  try {
    const { role } = await ctx.params;
    const body = await req.json();

    // 🔹 Forward the login request to your backend
    const res = await axiosInstance.post(`/auth/${role}/log-in`, body, {
      // Don't need withCredentials — same-domain proxy handles it
      validateStatus: () => true, // prevent axios from throwing on non-2xx
    });

    // 🔹 Build the response
    const nextRes = NextResponse.json({
      status: "success",
      data: res,
    });

    // 🔹 Forward backend cookies (if any)
    const setCookie = res?.headers?.["set-cookie"];
    if (setCookie) {
      // Multiple cookies may be set
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      cookies.forEach((cookie) => {
        nextRes.headers.append("Set-Cookie", cookie);
      });
    }

    return nextRes;
  } catch (error) {
    console.error("[PROXY ERROR]", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : `An unexpected error occurred: ${error}`,
      },
      { status: 500 }
    );
  }
}
