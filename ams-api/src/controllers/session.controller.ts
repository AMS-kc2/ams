import type { Request, Response } from "express";
import db from "../config/db";
import { generateOtp } from "../libs/helpers";
import AppError from "../libs/utils/AppError";
import { markAttendance } from "../libs/utils/db";
import { sendError, sendSuccess } from "../libs/utils/response";
// import type { TablesInsert } from "../types/database";

// Create a new session (sign-in or sign-out)
// POST /sessions
export const createSession = async (req: Request, res: Response) => {
	try {
		const { courseId, lecturerId, type = "SIGN_IN" } = req.body || {};

		if (!courseId || !lecturerId)
			throw new AppError("Please provide valid course and lecturer ID");

		// Check if an active session already exists
		const { data: existing } = await db
			.from("sessions")
			.select("*")
			.eq("course_id", courseId)
			.eq("lecturer_id", lecturerId)
			.eq("type", type)
			.eq("is_active", true)
			.gte("expires_at", new Date().toISOString())
			.maybeSingle();

		if (existing) {
			return sendSuccess(res, {
				otp: existing.otp,
				message: "An active session already exists with this OTP.",
			});
		}

		const otp = generateOtp();

		const { data: newSession, error } = await db
			.from("sessions")
			.insert({
				course_id: Number(courseId),
				lecturer_id: Number(lecturerId),
				otp: String(otp),
				type,
				expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
				is_active: true,
			})
			.select()
			.single();

		if (error) throw error;

		return sendSuccess(res, newSession);
	} catch (error) {
		sendError(error, res);
	}
};

// Verify session OTP and mark attendance
// POST /sessions/verify
export const verifySession = async (req: Request, res: Response) => {
	try {
		const { studentId, otp } = req.body;

		if (!studentId || !otp)
			throw new AppError("Student ID and OTP are required");

		// const { data: session } = await db
		//   .from("sessions")
		//   .select("*")
		//   .eq("otp", otp)
		//   .eq("is_active", true)
		//   .gte("expires_at", new Date().toISOString())
		//   .single();

		// if (!session) throw new AppError("Invalid or expired OTP");

		// // Record attendance
		// const { error: attendanceErr } = await db.from("attendances").insert({
		//   session_id: session.id,
		//   student_id: studentId,
		//   status: "PRESENT",
		// });

		// if (attendanceErr) throw attendanceErr;
		const attendance = await markAttendance(studentId, otp);
		if (!attendance) throw new AppError("Invalid or expired OTP");

		return sendSuccess(res, { message: "Attendance recorded successfully." });
	} catch (error) {
		sendError(error, res);
	}
};

// End an active session
// PUT /sessions/:sessionId/end
export const endSession = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		if (!sessionId) throw new AppError("Please Provide Valid Session Id");

		const { error } = await db
			.from("sessions")
			.update({ is_active: false })
			.eq("id", Number(sessionId));

		if (error) throw error;

		return sendSuccess(res, { message: "Session ended successfully." });
	} catch (error) {
		sendError(error, res);
	}
};

//Reattach session
// PUT /sessions/:sessionId/reattach
export const reattachSession = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		if (!sessionId) throw new AppError("Please Provide Valid Session Id");
		const { error } = await db
			.from("sessions")
			.update({ is_active: true })
			.eq("id", Number(sessionId));

		if (error) throw error;

		return sendSuccess(res, { message: "Session reattached successfully." });
	} catch (error) {
		sendError(error, res);
	}
};

// Get all sessions, optionally filtered by lecturer or course
// GET /sessions?lecturerId=1&courseId=2
export const getSessions = async (req: Request, res: Response) => {
	try {
		const { lecturerId, courseId } = req.query;
		if (!lecturerId && !courseId)
			throw new AppError("Please Provide Valid Lecturer or Course Id");

		let query = db.from("sessions").select("*, courses(name), lecturers(name)");

		if (lecturerId) query = query.eq("lecturer_id", Number(lecturerId));
		if (courseId) query = query.eq("course_id", Number(courseId));

		const { data, error } = await query.order("created_at", {
			ascending: false,
		});

		if (error) throw error;

		return sendSuccess(res, data);
	} catch (error) {
		sendError(error, res);
	}
};

// Get all attendance for a specific session
// GET /sessions/:sessionId/attendances
export const getSessionAttendances = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		if (!sessionId) throw new AppError("Please Provide Valid Session Id");

		const { data, error } = await db
			.from("attendances")
			.select("*, students(name, matric_no)")
			.eq("session_id", Number(sessionId));

		if (error) throw error;

		return sendSuccess(res, data);
	} catch (error) {
		sendError(error, res);
	}
};
