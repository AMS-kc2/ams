import z from "zod";

export const schema = z
  .object({
    fullName: z
      .string()
      .min(3, "Enter a valid name")
      .refine((val) => val.trim().split(/\s+/).length >= 2, {
        message: "Enter your full name (at least two Names)",
      }),
    lecturerId: z.string().min(3, "Enter a valid lecturer ID"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
    department: z.string().min(1, "Department is required"),
    level: z.enum(["100", "200", "300", "400", "500"]),
    semester: z.enum(["1st", "2nd"]),
    courseIds: z.array(z.string()).min(1, "Select at least one course"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type FormValues = z.infer<typeof schema>;

export type Course = {
  id: string;
  code: string;
  title: string;
  no_of_students: number;
  level: string;
  semester: string;
};

export const STEP_FIELDS: Record<number, Array<keyof FormValues>> = {
  1: ["fullName", "lecturerId", "password", "confirmPassword"],
  2: ["department", "level", "semester", "courseIds"],
};
