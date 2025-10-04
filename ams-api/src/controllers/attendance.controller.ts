import type { Request, Response } from "express";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { sendError, sendSuccess } from "../libs/utils/response";
// import { markAttendance } from 'libs/utils/db';

// Get all attendance for a specific course with pagination
// GET /attendances/course/:courseId/?page=1&limit=10
export const getAllAttendanceFromCourse = async (
	req: Request,
	res: Response,
) => {
	try {
		const { courseId } = req.params;
		if (!courseId) throw new AppError("Please Provide Valid Course Id");

		const { page = 1, limit = 10 } = req.query;

		const offset = (Number(page) - 1) * Number(limit);

		const { data: attendances } = await db
			.from("attendances")
			.select("*")
			.eq("course_id", Number(courseId))
			.range(offset, offset + Number(limit) - 1);

		return sendSuccess(res, { attendances });
	} catch (error) {
		sendError(error, res);
	}
};

// Get all attendance for a specific course and student with pagination
// GET /attendances/course/:courseId/student/:studentId/?page=1&limit=10
export const getAllAttendanceForCourseAndStudent = async (
	req: Request,
	res: Response,
) => {
	try {
		const { courseId, studentId } = req.params;
		if (!courseId || !studentId)
			throw new AppError("Please Provide Valid Course Id");

		const { page = 1, limit = 10 } = req.query;

		const offset = (Number(page) - 1) * Number(limit);

		const { data: attendances, error } = await db
			.from("attendances")
			.select("*")
			.eq("course_id", Number(courseId))
			.eq("student_id", Number(studentId))
			.range(offset, offset + Number(limit) - 1);

		if (error) throw new AppError(error.message);
		return sendSuccess(res, { attendances });
	} catch (error) {
		sendError(error, res);
	}
};

// Mark attendance for a student in a session
// POST /attendances/mark
// Body: { sessionId: number, studentId: number }

// export const markStudentAttendance = async (req: Request, res: Response) => {
// 	try {
// 		const { sessionId, studentId } = req.body;
// 		if (!sessionId || !studentId)
// 			throw new AppError("Please Provide Valid Session Id and Student Id");

// 		// Check if session is active
// 		const { data: session, error: sessionError } = await db
// 			.from("sessions")
// 			.select("*")
// 			.eq("id", Number(sessionId))
// 			.eq("is_active", true)
// 			.single();

// 		if (sessionError || !session)
// 			throw new AppError("Session is not active or does not exist");
// 		// Check if attendance already marked
// 		const { data: existingAttendance, error: attendanceError } = await db
// 			.from("attendances")
// 			.select("*")
// 			.eq("session_id", Number(sessionId))
// 			.eq("student_id", Number(studentId))
// 			.single();

// 		if (attendanceError && attendanceError.code !== "PGRST116")
// 			throw attendanceError;

// 		if (existingAttendance)
// 			throw new AppError("Attendance already marked for this session");

// 		// Mark attendance
// 		const newAttendance = await markAttendance(studentId, sessionId);
// 		if (!newAttendance)
// 			throw new AppError("Failed to mark attendance. Please try again.");
// 		return sendSuccess(res, { newAttendance });
// 	} catch (error) {
// 		sendError(error, res);
// 	}
// };

// Delete an attendance record
// DELETE /attendances/:attendanceId
export const deleteAttendance = async (req: Request, res: Response) => {
	try {
		const { attendanceId } = req.params;
		if (!attendanceId) throw new AppError("Please Provide Valid Attendance Id");
		const { error } = await db
			.from("attendances")
			.delete()
			.eq("id", Number(attendanceId));

		if (error) throw error;

		return sendSuccess(res, { message: "Attendance record deleted." });
	} catch (error) {
		sendError(error, res);
	}
};
