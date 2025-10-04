import type { Request, Response } from "express";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { safeStudents } from "../libs/utils/db";
import { sendError, sendSuccess } from "../libs/utils/response";

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
			.from("students")
			.select("*")
			.eq("course_id", courseId);
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
		student = safeStudents([student])[0];
		return sendSuccess(res, { student });
	} catch (error) {
		sendError(error, res);
	}
};
