// @ts-check
import { hash, verify } from "argon2";
import type { Request, Response } from "express";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { sendError, sendSuccess } from "../libs/utils/response";
import {
	lecturerLoginSchema,
	lecturerSignupSchema,
	studentLoginSchema,
	studentSignupSchema,
} from "../schema/auth.schema";

// ====================== STUDENTS ======================

export const studentSignup = async (req: Request, res: Response) => {
	try {
		const payload = await studentSignupSchema.parseAsync(req.body);
		const { matricNumber, surname, level, semester } = payload;

		const { data, error } = await db
			.from("students")
			.insert({
				matric_number: matricNumber,
				surname: surname.toLowerCase(),
				level,
				semester,
			})
			.select()
			.single();

		if (error) throw new AppError(error.message);

		return sendSuccess(res, data, "Student created", 201);
	} catch (err) {
		return sendError(err, res);
	}
};

export const studentLogin = async (req: Request, res: Response) => {
	try {
		const payload = await studentLoginSchema.parseAsync(req.body);
		const { matricNumber, surname } = payload;

		const { data: student, error } = await db
			.from("students")
			.select("*")
			.eq("matric_number", matricNumber)
			.single();

		if (error) throw new AppError(error.message);
		if (!student) throw new AppError(`No Student with id: ${matricNumber}`);

		if (student.surname !== surname.toLowerCase()) {
			throw new AppError("you've forgotten your surname? What a bad son");
		}

		return sendSuccess(res, student, "Student logged in", 200);
	} catch (err) {
		return sendError(err, res);
	}
};

// ====================== LECTURERS ======================

export const lecturerSignUp = async (req: Request, res: Response) => {
	try {
		const { lecturerId, password, level, courses, semester, totalClasses } =
			await lecturerSignupSchema.parseAsync(req.body);

		const passwordHash = await hash(password);

		const { data, error } = await db
			.from("lecturers")
			.insert({
				lecturer_id: lecturerId,
				password: passwordHash,
				courses,
				level,
				semester,
				total_classes: totalClasses,
			})
			.select()
			.single();

		if (error) throw new AppError(error.message);

		return sendSuccess(res, data, "Lecturer created", 201);
	} catch (error) {
		return sendError(error, res);
	}
};

export const lecturerLogin = async (req: Request, res: Response) => {
	try {
		const { password, lecturerId } = await lecturerLoginSchema.parseAsync(
			req.body,
		);

		const { data: lecturer, error } = await db
			.from("lecturers")
			.select("*")
			.eq("lecturer_id", lecturerId)
			.single();

		if (error) throw new AppError(error.message);
		if (!lecturer) throw new AppError(`No Lecturer with id: ${lecturerId}`);

		const validPassword = await verify(lecturer.password, password);
		if (!validPassword) {
			throw new AppError("The Password you entered wasn't correct");
		}

		return sendSuccess(res, lecturer, "Lecturer logged in", 200);
	} catch (error) {
		return sendError(error, res);
	}
};
