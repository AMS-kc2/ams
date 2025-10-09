import { NextResponse } from "next/server";
import axiosInstance from "@/lib/axios"; // your configured instance

export async function POST(
  req: Request,
  { params }: { params: { role: string } }
) {
  const { role } = params;

  try {
    const body = await req.json();

    // Forward request to backend API using axiosInstance
    const data = await axiosInstance.post(`/auth/${role}/log-in`, body, {
      withCredentials: true,
    });

    // Extract cookies from backend response (if any)
    // Then pass them forward if Render sets cookies (optional)
    const response = NextResponse.json({ status: "success", data });

    // ✅ Copy cookies manually (if backend sends Set-Cookie header)
    // You may need to read raw response from axiosInstance to forward them correctly
    // If axiosInstance uses withCredentials, backend cookies will stick
    return response;
  } catch (error: any) {
    console.error("[PROXY ERROR]", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Login failed",
      },
      { status: 500 }
    );
  }
}
