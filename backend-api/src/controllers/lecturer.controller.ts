import type { Request, Response } from "express";
import db from "@/config/db";
import AppError from "@/libs/utils/AppError";
import { sendError, sendSuccess } from "@/libs/utils/response";

export const getAllLecturer = async (_: Request, res: Response) => {
	try {
		const lecturer = db.from("lecturer").select("*");
		if (!lecturer) throw new AppError("No lecturer was found");

		return sendSuccess(res, { lecturer });
	} catch (error) {
		sendError(error, res);
	}
};

export const getLecturerWithCourse = async (req: Request, res: Response) => {
	try {
		const { courseId } = req.body;
		if (!courseId) throw new AppError("Please Provide Valid Course Id");

		const lecturer = db.from("lecturer").select("*").eq("couse_id", courseId);
		if (!lecturer) throw new AppError("No lecturer was found");

		return sendSuccess(res, { lecturer });
	} catch (error) {
		sendError(error, res);
	}
};
