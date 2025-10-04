import type { Request, Response } from "express";
import type { TablesInsert } from "types/database";
import z from "zod";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { sendError, sendSuccess } from "../libs/utils/response";

// Create course schema
export const createCourseSchema = z.object({
	title: z.string().min(3, { message: "Title must be at least 3 characters" }),
	code: z.string().min(3, { message: "Code must be at least 3 characters" }),
	level: z.enum(["100", "200", "300", "400", "500"]),
	semester: z.enum(["1st", "2nd"]),
});

// Get all courses
// GET /courses
export const getAllCourses = async (_: Request, res: Response) => {
	try {
		const { data: course, error } = await db.from("courses").select("*");

		if (error) throw new AppError(error.message);
		if (!course) throw new AppError("No Course was found");
		return sendSuccess(res, { course });
	} catch (error) {
		sendError(error, res);
	}
};

// Get all courses with student
// GET /courses/student/:studentId
export const getAllCourseWithStudent = async (req: Request, res: Response) => {
	try {
		const { studentId } = req.params;
		if (!studentId) throw new AppError("Please Provide Valid Student Id");

		const { data: courses } = await db
			.from("courses")
			.select("*")
			.eq("student_id", studentId);

		if (!courses) throw new AppError("No Course was found");

		return sendSuccess(res, { courses });
	} catch (error) {
		sendError(error, res);
	}
};

// Get all courses with lecturer
// GET /courses/lecturer/:lecturerId
export const getAllCourseWithLecturer = async (req: Request, res: Response) => {
	try {
		const { lecturerId } = req.params;
		if (!lecturerId) throw new AppError("Please Provide Valid Lecturer Id");

		const { data: courses } = await db
			.from("courses")
			.select("*")
			.eq("lecturer_id", lecturerId);

		if (!courses) throw new AppError("No Course was found");

		return sendSuccess(res, { courses });
	} catch (error) {
		sendError(error, res);
	}
};

// Get course with id
// GET /courses/:id
export const getCourseWithId = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id || typeof id !== "string")
			throw new AppError("Please Provide Valid Course Id");

		const { data: course } = await db
			.from("courses")
			.select("*")
			.eq("id", Number(id))
			.single();

		return sendSuccess(res, { course });
	} catch (error) {
		sendError(error, res);
	}
};

// Create course
// POST /courses
export const createCourse = async (req: Request, res: Response) => {
	try {
		const { title, code, level, semester } = createCourseSchema.parse(req.body);

		const existingCourse = await db
			.from("courses")
			.select("*")
			.eq("code", code)
			.single();

		if (existingCourse) throw new AppError("Course already exists");

		const course = await db
			.from("courses")
			.insert<TablesInsert<"courses">>({
				title,
				code,
				level,
				semester,
			})
			.select()
			.single();

		if (!course) throw new AppError("Course Creation Failed");

		return sendSuccess(res, { course }, "Course Created Successfully", 201);
	} catch (error) {
		sendError(error, res);
	}
};

// Delete course
// DELETE /courses
export const deleteCourse = async (req: Request, res: Response) => {
	try {
		const { id } = req.body;
		if (!id || typeof id !== "string")
			throw new AppError("Please Provide Valid Course Id");

		const course = await db.from("courses").delete().eq("id", Number(id));

		if (!course) throw new AppError("Course Deletion Failed");

		return sendSuccess(res, null, "Course Deleted Successfully");
	} catch (error) {
		sendError(error, res);
	}
};

// Update course
// PUT /courses
export const updateCourse = async (req: Request, res: Response) => {
	try {
		const { id, title, code, level, semester } = createCourseSchema
			.extend({ id: z.string().min(1) })
			.parse(req.body);

		const course = await db
			.from("courses")
			.update({ title, code, level, semester })
			.eq("id", Number(id))
			.select()
			.single();

		if (!course) throw new AppError("Course Update Failed");
		return sendSuccess(res, { course }, "Course Updated Successfully");
	} catch (error) {
		sendError(error, res);
	}
};
