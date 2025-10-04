import type { Request, Response } from "express";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { safeLecturer, safeLecturers } from "../libs/utils/db";
import { sendError, sendSuccess } from "../libs/utils/response";

export const getLecturers = async (_: Request, res: Response) => {
	try {
		let { data: lecturers, error } = await db.from("lecturers").select("*");
		if (error) throw new AppError(error.message);

		lecturers = safeLecturers(lecturers);

		return sendSuccess(res, { lecturers });
	} catch (error) {
		sendError(error, res);
	}
};

export const getLecturerById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) throw new AppError("Please Provide Valid Lecturer Id");

		let { data: lecturer, error } = await db
			.from("lecturers")
			.select("*")
			.eq("id", Number(id))
			.single();
		if (error) throw new AppError(error.message);
		if (!lecturer) throw new AppError("No lecturer was found");

		lecturer = safeLecturer(lecturer);

		// const safeLecturers = lecturers.map(({ password, ...rest }) => rest);
		return sendSuccess(res, { lecturer });
	} catch (error) {
		sendError(error, res);
	}
};

export const getLecturerWithCourse = async (req: Request, res: Response) => {
	try {
		const { courseId } = req.params;
		if (!courseId) throw new AppError("Please Provide Valid Course Id");

		let { data: lecturer, error } = await db
			.from("lecturers")
			.select("*")
			.eq("couse_id", courseId);

		if (error) throw new AppError(error.message);
		if (!lecturer) throw new AppError("No lecturer was found");

		lecturer = safeLecturers(lecturer);

		return sendSuccess(res, { lecturer });
	} catch (error) {
		sendError(error, res);
	}
};
