import type { Request, Response } from "express";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { safeStudents, safeStudent } from "../libs/utils/db";
import { sendError, sendSuccess } from "../libs/utils/response";
import { AuthenticatedRequest } from 'src/types/auth';
import { z } from "zod";
import { StudentDashboardSchema } from "../schema/student-dashboard";
import { normalizeRpcPayload } from '../libs/utils/student-dashboard';


export const getAllStudents = async (_: Request, res: Response) => {
	try {
		let { data: students, error } = await db.from("students").select("*");
		if (error) throw new AppError(error.message);
		if (!students) throw new AppError("No student was found");

		students = safeStudents(students);
		return sendSuccess(res, { students });
	} catch (error) {
		sendError(error, res);
	}
};

export const getStudentWithCourse = async (req: Request, res: Response) => {
	try {
		const { courseId } = req.params;
		if (!courseId || typeof courseId !== "string")
			throw new AppError("Please Provide Valid Course Identification");

		let { data: students, error } = await db
			.from("student_courses")
			.select("*")
			.eq("course_id", Number(courseId))
			.eq("studeny_id", Number(courseId))
			.eq("is_active", true);
		// .then(data => {
		// 	return safeStudents(data)
		// });

		if (error) throw new AppError(error.message);
		if (!students) throw new AppError("No student was found");
		students = safeStudents(students);
		return sendSuccess(res, { students });
	} catch (error) {
		sendError(error, res);
	}
};

export const getStudentById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) throw new AppError("Please Provide Valid Student Id");
		let { data: student, error } = await db
			.from("students")
			.select("*")
			.eq("id", Number(id))
			.single();

		if (error) throw new AppError(error.message);
		if (!student) throw new AppError("No student was found");
		student = safeStudent(student);
		return sendSuccess(res, { student });
	} catch (error) {
		sendError(error, res);
	}
};

export const getCurrentStudent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.user?.id;
    if (!id) throw new AppError("Unauthorized access", 401);

    // Fetch joined data from the relation table
    const { data, error } = await db
      .from("student_courses")
      .select(
        `
        students!inner(
          id,
          surname,
          matric_number,
          level,
          semester
        ),
        courses(*)
        `
      )
      .eq("student_id", id);

    if (!data || data.length === 0){
      const {data: student, error: studentErr} = await db
      .from("students")
      .select("*")
      .eq("id", id)
      .maybeSingle()

      if(!student) throw new AppError("student does not exist", 404)
      if(studentErr) throw new AppError(`Failed to retrieve student: ${studentErr}`)
      const response = {
      ...student,
      courses: [],
    };
      return sendSuccess(res, response,"No Course Available, Kindly Register for course")
    }
    if (error) throw new AppError(`Failed to retrieve student: ${error}`);

    // Normalize: extract student info once and map courses
    const student = data[0].students;
    const courses = data.map((row) => row.courses);

    const response = {
      ...student,
      courses,
    };

		console.log(response);

    return sendSuccess(res, response, "Student profile retrieved successfully");
  } catch (error) {
    return sendError(error, res);
  }
};

export const registerCourses = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    if (!studentId) throw new AppError("Unauthorized", 401);

    // ✅ Fetch the student safely
    const { data: students, error: studentError } = await db
      .from("students")
      .select("*")
      .eq("id", Number(studentId));

    if (studentError) throw new AppError(studentError.message);
    if (!students || students.length === 0)
      throw new AppError("No student was found", 404);

    const student = students[0];

    // ✅ Validate body
    const { course_ids } = req.body;
    if (!Array.isArray(course_ids) || course_ids.length < 1)
      throw new AppError("Kindly provide valid course IDs for registration");

    // ✅ Prepare insert payload
    const courseLinks = course_ids.map((courseId: string) => ({
      course_id: Number(courseId),
      student_id: student.id,
    }));

    // ✅ Batch insert once (efficient)
    const { error: linkError } = await db
      .from("student_courses")
      .insert(courseLinks);

    if (linkError)
      throw new AppError(linkError.message ?? "Failed to assign courses");

    // ✅ Respond success
    return sendSuccess(res, { registered: course_ids.length }, "Courses registered successfully", 201);
  } catch (error) {
    return sendError(error, res);
  }
};

// export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const studentId = req.user?.id;
//     if (!studentId) throw new AppError("Unauthorized", 401);

//     const { data, error } = await db.rpc("get_student_dashboard", { p_student_id: Number(studentId) });

//     if (error) throw new AppError(error.message || "Failed to load dashboard", 500);

//     // data may be an array with single element depending on supabase client, normalize:
//     const payload = Array.isArray(data) ? data[0] ?? {} : data ?? {};

//     return sendSuccess(res, JSON.parse(JSON.stringify(payload)), "Student dashboard fetched");
//   } catch (err: any) {
//     return sendError(err, res);
//   }
// };

// import { Request, Response } from "express";
// import db from "@/config/db"; // supabase client
// import { AuthenticatedRequest } from "@/types/auth";
// import { sendSuccess, sendError } from "@/lib/response";
// import { AppError } from "@/lib/utils/AppError";
// import { StudentDashboardSchema } from "@/schemas/student-dashboard"; // import zod schemas
// import { z } from "zod";

export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) throw new AppError("Unauthorized", 401);

    // Call RPC
    const { data: rpcData, error: rpcError } = await db.rpc("get_student_dashboard", {
      p_student_id: Number(studentId),
    });

    if (rpcError) {
      // helpful debug info
      if (process.env.NODE_ENV === "development") console.error("RPC error:", rpcError);
      throw new AppError(rpcError.message || "Failed to fetch dashboard", 500);
    }

    // In dev, log raw RPC so you can inspect malformed returns quickly
    if (process.env.NODE_ENV === "development") console.debug("raw get_student_dashboard rpc:", rpcData);

    // Normalize payload
    const normalized = normalizeRpcPayload(rpcData);

    // Validate with zod (fail-fast) — throws if invalid
    const parsed = StudentDashboardSchema.parse(normalized);

    return sendSuccess(res, parsed, "Student dashboard fetched");
  } catch (err: any) {
    // If it's a zod error, make it readable
    if (err instanceof z.ZodError) {
      console.error("Dashboard validation failed:", err);
      return sendError(new AppError("Invalid dashboard shape from DB", 500), res);
    }
    return sendError(err, res);
  }
};
