"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

// Base structure for role switching
const lecturerSchema = z.object({
  lecturerId: z.string().min(2, { message: "Lecturer ID is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const studentSchema = z.object({
  matricNumber: z.string().min(2, { message: "Matric number is required" }),
  surname: z
    .string()
    .min(2, { message: "Surname must be at least 2 characters" }),
});

type LecturerFormData = z.infer<typeof lecturerSchema>;
type StudentFormData = z.infer<typeof studentSchema>;

export const onSubmitProxy = async (
  data: LecturerFormData | StudentFormData,
  role: "lecturer" | "student",
  router: ReturnType<typeof useRouter>
) => {
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

    // 🔹 Call your Next.js proxy route, NOT backend directly
    const res = await axios.post(`/api/auth/${role}/log-in`, formData, {
      withCredentials: true, // allow cookies from proxy
    });

    toast("Successfully logged in");

    router.push(
      role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard"
    );
  } catch (error: any) {
    console.error("[LOGIN ERROR]", error);
    toast(`Failed to login: ${error?.message || error}`);
  }
};
