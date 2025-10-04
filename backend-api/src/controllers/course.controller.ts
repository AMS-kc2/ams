import type { Request, Response } from "express";
import db from "@/config/db";
import AppError from "@/libs/utils/AppError";
import { sendError, sendSuccess } from "@/libs/utils/response";

export const getAllCourse = async (_: Request, res: Response) => {
	try {
		const course = db.from("course").select("*");

		return sendSuccess(res, { course });
	} catch (error) {
		sendError(error, res);
	}
};

export const getAllCourseWithStudent = async (req: Request, res: Response) => {
	try {
		const { studentId } = req.body;
		if (!studentId || typeof studentId !== "string")
			throw new AppError("Please Provide Valid Student Id");

		const courses = db.from("course").select("*").eq("student_id", studentId);

		if (!courses) throw new AppError("No Course was found");

		return sendSuccess(res, { courses });
	} catch (error) {
		sendError(error, res);
	}
};

export const getAllCourseWithLecturer = async (req: Request, res: Response) => {
	try {
		const { lecturerId } = req.body;
		if (!lecturerId || typeof lecturerId !== "string")
			throw new AppError("Please Provide Valid Lecturer Id");

		const courses = db.from("course").select("*").eq("lecturer_id", lecturerId);

		if (!courses) throw new AppError("No Course was found");

		return sendSuccess(res, { courses });
	} catch (error) {
		sendError(error, res);
	}
};

export const getCourseWithId = async (req: Request, res: Response) => {
	try {
		const { id } = req.body;
		const course = db.from("course").select("*").eq("id", id).single();

		return sendSuccess(res, { course });
	} catch (error) {
		sendError(error, res);
	}
};
