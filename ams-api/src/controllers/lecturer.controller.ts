import type { Request, Response } from "express";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { safeLecturer, safeLecturers } from "../libs/utils/db";
import { sendError, sendSuccess } from "../libs/utils/response";
import { AuthenticatedRequest } from '../types/auth';

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

export const getCurrentLecturer = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const id = req.user?.id;
		if (!id) throw new AppError("Unauthorized", 401);

		const {data, error} = await db
			.from("lecturers")
			.select("*")
			.eq("id", Number(id))

		if (error) throw new AppError(`Failed to retrieve Lcturer: ${error.message}`);
		if (!data || data.length === 0) throw new AppError("No lecturer record found", 404);

		// Normalize: extract lecturer info once and map courses
		const lecturer = data[0];

		return sendSuccess(res, lecturer, "Lecturer fetched successfully");

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
			.from("course_attendances")
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


export const getLecturerFeed = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const lecturerId = req.user?.id;
		if (!lecturerId) throw new AppError("Unauthorized", 401);

		// Step 1: Try summary view
		const { data: summary, error: summaryError } = await db
			.from("course_attendance_summary")
			.select("*")
			.eq("lecturer_id", Number(lecturerId))
			.order("attendance_rate", { ascending: false });

		if (summaryError)
			throw new AppError(
				`Failed to fetch course attendance summary: ${
					summaryError.message || "Unknown database error"
				}`
			);

		// Step 2: Fallback if summary empty
		if (!summary || summary.length === 0) {
			const { data: lecturerCourses, error: courseError } = await db
				.from("lecturer_courses")
				.select(`courses(id, code, title, level, semester)`)
				.eq("lecturer_id", Number(lecturerId));

			if (courseError)
				throw new AppError(`Failed to fetch courses: ${courseError.message}`);

			if (!lecturerCourses || lecturerCourses.length === 0)
				return sendSuccess(res, [], "No courses, sessions, or attendance records yet.");

			// Step 3: Normalize fallback shape
			const zeroedCourses = lecturerCourses.map(({ courses }) => ({
				course_id: courses.id,
				code: courses.code,
				title: courses.title,
				level: courses.level,
				semester: courses.semester,
				student_count: 0,
				total_sessions: 0,
				total_attendances: 0,
				attendance_rate: 0,
			}));

			return sendSuccess(
				res,
				zeroedCourses,
				"Courses found, but no sessions or attendance records yet."
			);
		}

		// Step 4: Normalize valid summary
		const normalized = summary.map((course) => ({
			...course,
			student_count: course.student_count ?? 0,
			total_sessions: course.total_sessions ?? 0,
			total_attendances: course.total_attendances ?? 0,
			attendance_rate: course.attendance_rate ?? 0,
		}));

		return sendSuccess(res, normalized, "Course attendance summary fetched successfully");
	} catch (err: any) {
		sendError(err, res);
	}
};
