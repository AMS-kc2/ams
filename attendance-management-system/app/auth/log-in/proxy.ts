"use client";

import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
// import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

// Base structure for role switching
export const lecturerSchema = z.object({
  lecturerId: z.string().min(2, { message: "Lecturer ID is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const studentSchema = z.object({
  matricNumber: z.string().min(2, { message: "Matric number is required" }),
  surname: z
    .string()
    .min(2, { message: "Surname must be at least 2 characters" }),
});

type LecturerFormData = z.infer<typeof lecturerSchema>;
type StudentFormData = z.infer<typeof studentSchema>;

function parseClientError(err: unknown): { message: string } {
  if (axios.isAxiosError(err)) {
    // try to extract message from response body, then fallback
    const serverMessage =
      typeof err.response?.data === "object" && err.response?.data !== null
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err.response?.data as any).message
        : undefined;
    return { message: serverMessage ?? err.message ?? "Request failed" };
  }

  if (err instanceof Error) return { message: err.message };
  return { message: String(err) };
}

export const onSubmitProxy = async (
  data: LecturerFormData | StudentFormData,
  role: "lecturer" | "student",
  router: AppRouterInstance
) => {
  // const router = useRouter();
  try {
    const formData =
      role === "lecturer"
        ? {
            lecturerId: (data as LecturerFormData).lecturerId,
            password: (data as LecturerFormData).password,
          }
        : {
            matricNumber: (data as StudentFormData).matricNumber,
            surname: (data as StudentFormData).surname,
          };

    // IMPORTANT: call the proxy route on the same origin
    const res = await axios.post(
      `/api/auth/${role === "lecturer" ? "lecturer" : "student"}/log-in`,
      formData,
      {
        withCredentials: true,
      }
    );

    if (res.status >= 200 && res.status < 300) {
      toast.success(res.data?.message ?? "Successfully Logged In");
      router.push(
        role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard"
      );
    } else {
      toast.error(res.data?.message ?? "Login failed");
    }
  } catch (err: unknown) {
    const { message } = parseClientError(err);
    toast.error(message);
  }
};
