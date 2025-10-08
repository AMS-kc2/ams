import { z } from "zod";

// Signup (student provides matricNumber, surname, level, semester)
export const studentSignupSchema = z.object({
	matricNumber: z
		.string()
		.min(5, { message: "Matric number must be at least 5 characters." })
		.max(15, { message: "Matric number must be at most 15 characters." })
		.regex(/^[\w\d/]+$/, {
			message: "Matric number can only contain letters, numbers, and slashes.",
		}),
	surname: z
		.string()
		.min(2, { message: "Surname must be at least 2 characters." })
		.transform((v) => v.toLowerCase()),
	level: z.enum(["100", "200", "300", "400", "500"]),
	semester: z.enum(["1st", "2nd"]),
});

// Login (your second student schema)
export const studentLoginSchema = z.object({
	matricNumber: z
		.string()
		.min(2, { message: "Matriculation number is required" }),
	surname: z
		.string()
		.min(2, { message: "Surname must be at least 2 characters." })
		.transform((v) => v.toLowerCase()),
});

// Login (lecturer)
export const lecturerLoginSchema = z.object({
	lecturerId: z.string().min(2, { message: "ID is required" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

// Signup (lecturer)
export const lecturerSignupSchema = z
	.object({
		lecturerId: z.string().min(3, { message: "Enter a valid lecturer id" }),
		fullName: z
      .string()
      .min(3, "Enter a valid name")
      .refine((val) => val.trim().split(/\s+/).length >= 2, {
        message: "Enter your full name (at least two Names)",
      }),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" }),
		confirmPassword: z.string().min(8),
    department: z.string().min(1, "Department is required"),
		level: z.enum(["100", "200", "300", "400", "500"]),
		semester: z.enum(["1st", "2nd"]),
		courses: z
			.array(z.number())
			.min(1, { message: "Select at least one course" }),
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// Create course schema
export const createCourseSchema = z.object({
	title: z.string().min(3, { message: "Title must be at least 3 characters" }),
	code: z.string().min(3, { message: "Code must be at least 3 characters" }),
	level: z.enum(["100", "200", "300", "400", "500"]),
	semester: z.enum(["1st", "2nd"]),
});
