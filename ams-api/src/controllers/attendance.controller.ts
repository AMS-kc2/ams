import type { Request, Response } from "express";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { sendError, sendSuccess } from "../libs/utils/response";
import { AuthenticatedRequest } from 'src/types/auth';
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

// Create Attendance
// POST /attendances
// Body: { sessionId: number, studentId: number }
export const createAttendance = async (req: AuthenticatedRequest, res: Response) => {
	try {

		const studentId = req.user?.id;
		if (!studentId) throw new AppError("Unauthorized", 401);

		const { course_id,session_id, student_id,signInTime, signOutTime, location, } = req.body

		if (!course_id || !session_id) throw new AppError("Please Provide Valid Course Id and Session Id");
		if(!student_id) throw new AppError("Please Provide Valid Student Id");
		if(!signInTime) throw new AppError("Please Provide Valid Sign In Time");
		if(!signOutTime) throw new AppError("Please Provide Valid Sign Out Time");
		if(studentId !== student_id) throw new AppError("Unauthorized, Thief", 401)
		// if(!location) throw new AppError("Please Provide Valid Location");

		const { data: existingAttendance } = await db
		.from("attendances")
		.select("id")
		.eq("session_id", session_id)
		.eq("student_id", student_id)
		.eq("course_id", course_id)
		.maybeSingle();

	if (existingAttendance)
		throw new Error("Attendance already marked for this session");

	// Mark attendance
	const { data, error } = await db
		.from("attendances")
		.insert({
			student_id,
			session_id: session_id,
			course_id: course_id,
			sign_in_time: signInTime,
			sign_out_time: signOutTime,
			location,
		})
		.select()
		.single();

		if (error) throw new AppError(error.message);
		return sendSuccess(res, { data });

	} catch (error) {
		sendError(error, res);
	}
}

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
