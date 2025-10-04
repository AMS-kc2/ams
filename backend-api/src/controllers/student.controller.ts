import type { Request, Response } from "express";
import db from "@/config/db";
import AppError from "@/libs/utils/AppError";
import { sendError, sendSuccess } from "@/libs/utils/response";

export const getAllStudents = async (_: Request, res: Response) => {
	try {
		const students = db.from("students").select("*");

		return sendSuccess(res, { students });
	} catch (error) {
		sendError(error, res);
	}
};

export const getStudentWithCourse = async (req: Request, res: Response) => {
	try {
		const { courseId } = req.body;
		if (!courseId || typeof courseId !== "string")
			throw new AppError("Please Provide Valid Course Identification");

		const students = db.from("students").select("*").eq("course_id", courseId);

		return sendSuccess(res, { students });
	} catch (error) {
		sendError(error, res);
	}
};
