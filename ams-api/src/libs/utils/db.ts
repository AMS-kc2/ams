/** biome-ignore-all lint/suspicious/noExplicitAny: <no explanation> */

import { log } from "node:console";
// import { ZodError, type ZodIssue } from "zod";
import db from "../../config/db";
import AppError from "./AppError";

export async function enrollStudentInCourse(
	student_id: number,
	course_id: number,
) {
	const { data, error } = await db
		.from("student_courses")
		.insert({ student_id, course_id })
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function markAttendance(student_id: number, otp: string) {
	// Find active session with OTP
	const { data: session, error: findErr } = await db
		.from("sessions")
		.select("*")
		.eq("otp", otp)
		// .eq("is_active", true)
		.single();

	if (findErr || !session) throw new Error("Invalid or expired OTP");

	if (session.expires_at < new Date().toISOString())
		throw new Error("Session has expired, You're late");
	if (!session.is_active) throw new Error("Session is no longer active");

	// Check if attendance already marked
	const { data: existingAttendance } = await db
		.from("attendances")
		.select("*")
		.eq("session_id", session.id)
		.eq("student_id", student_id)
		.single();

	if (existingAttendance)
		throw new Error("Attendance already marked for this session");

	// Mark attendance

	const { data, error } = await db
		.from("attendances")
		.insert({
			student_id,
			session_id: session.id,
			status: "present",
			course_id: session.course_id,
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function addLecturerToCourse(
	lecturer_id: number,
	course_id: number,
) {
	const { data, error } = await db
		.from("lecturer_courses")
		.insert({ lecturer_id, course_id })
		.select()
		.single();

	if (error) throw error;
	return data;
}

export const safeStudents = (students: any[] | null) => {
	if (!students) return [];
	return students.map(({ password, ...rest }) => rest);
};

export const safeLecturers = (lecturers: any[] | null) => {
	if (!lecturers) return [];
	return lecturers.map(({ password, ...rest }) => rest);
};

export const safeStudent = (student: any) => {
	if (!student) throw new AppError("No student provided");
	const { password, ...rest } = student;
	log(password);
	return rest;
};

export const safeLecturer = (lecturer: any) => {
	if (!lecturer) throw new AppError("No lecturer provided");
	const { password, ...rest } = lecturer;
	log(password);
	return rest;
};
