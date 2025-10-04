import type { Request, Response } from "express";
import db from "@/config/db";
import { generateOtp } from "@/libs/helpers";
import AppError from "@/libs/utils/AppError";
import { sendError, sendSuccess } from "@/libs/utils/response";

export const createSession = async (req: Request, res: Response) => {
	try {
		const { courseId, lecturerId, type = "SIGN_IN" } = req.body || {};

		if (!courseId || !lecturerId)
			throw new AppError("Please provide valid course and lecturer Id");

		//Check if a session sesion already exist

		const existing = await db
			.from("session")
			.select("*")
			.eq("course_id", courseId)
			.eq("lecturer_id", lecturerId)
			.eq("type", type)
			.lt("expiry", Date.now()) //TODO: Fix this line
			.single();

		if (existing) {
			return sendSuccess(res, {
				otp: existing.data.otp,
				expiry: existing.data.expiry,
				message: "The otp has been already generated",
			});
		}

		const newOtp = generateOtp();

		const newSession = db
			.from("session")
			.insert({
				lecturer_id: lecturerId,
				course_id: courseId,
				type,
				otp: newOtp,
				expiry: Date.now(), //TODO: Fix this line
			})
			.select()
			.single();

		return sendSuccess(res, newSession);
	} catch (error) {
		sendError(error, res);
	}
};

export const getSession = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.body;

		const session = await db
			.from("session")
			.select("*")
			.eq("session_id", sessionId)
			.gt("expiry", Date.now()) //TODO: Fix this line
			.single();

		if (!session)
			throw new AppError(
				"Could not found the session. Either It's expire or never existed",
			);

		return sendSuccess(res, session);
	} catch (error) {
		sendError(error, res);
	}
};
