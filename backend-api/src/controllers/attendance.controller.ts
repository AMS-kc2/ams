import type { Request, Response } from "express";
import db from "@/config/db";
import AppError from "@/libs/utils/AppError";
import { sendError, sendSuccess } from "@/libs/utils/response";

export const getAllAttendanceFromCourse = async (
	req: Request,
	res: Response,
) => {
	try {
		const { courseId } = req.body;
		if (!courseId) throw new AppError("Please Provide Valid Course Id");

		const attendances = db
			.from("attendances")
			.select("*")
			.eq("course_id", courseId)
			.limit(10);

		return sendSuccess(res, { attendances });
	} catch (error) {
		sendError(error, res);
	}
};

export const getAllAttendanceFromCourseAndStudent = async (
	req: Request,
	res: Response,
) => {
	try {
		const { courseId, studentId } = req.body;
		if (!courseId || !studentId)
			throw new AppError("Please Provide Valid Course Id");

		const attendances = db
			.from("attendances")
			.select("*")
			.eq("course_id", courseId)
			.eq("student_id", studentId)
			.limit(10);

		return sendSuccess(res, { attendances });
	} catch (error) {
		sendError(error, res);
	}
};

export const createAttendance = async (req: Request, res: Response) => {
	try {
		const { courseId, studentId, otp, type = "SIGN_IN" } = req.body;
		if (!courseId || !studentId || otp)
			throw new AppError("Please Provide Valid Course Id");

		const session = await db
			.from("session")
			.select("*")
			.eq("otp", otp)
			.gt("expiry", Date.now()) //TODO: Fix this line
			.single();

		if (!session)
			throw new AppError(
				"Could not found the session. Either It's expire or never existed",
			);

		const attendances = db.from("attendances").insert({
			courseId,
			studentId,
			session_id: session.data.id,
			type,
		});

		return sendSuccess(res, { attendances });
	} catch (error) {
		sendError(error, res);
	}
};
