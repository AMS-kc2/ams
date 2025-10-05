// @ts-check

import { hash, verify } from "argon2";
import type { Request, Response } from "express";
import db from "../config/db";
import { createToken } from "../config/jwt";
import AppError from "../libs/utils/AppError";
import { sendError, sendSuccess } from "../libs/utils/response";
import {
	lecturerLoginSchema,
	lecturerSignupSchema,
	studentLoginSchema,
	studentSignupSchema,
} from "../schema/auth.schema";
import { COOKIE_NAME } from "../types/auth";

// ====================== STUDENTS ======================

export const studentSignup = async (req: Request, res: Response) => {
	try {
		const payload = await studentSignupSchema.parseAsync(req.body);
		const { matricNumber, surname, level, semester } = payload;

		const existingStudent = await db
			.from("students")
			.select("*")
			.eq("matric_number", matricNumber)
			.single();

		if (existingStudent) {
			throw new AppError("Student already exists");
		}

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

		//Create token
		const token = createToken({
			id: student.id,
			role: "student",
			matricNumber: Number(student.matric_number),
		});

		//Set the JWT in a secure HTTP-only cookie
		res.cookie(COOKIE_NAME, token, {
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});

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

		const existingLecturer = await db
			.from("lecturers")
			.select("*")
			.eq("lecturer_id", lecturerId)
			.single();

		if (existingLecturer) throw new AppError("Lecturer already exists");

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

		//Create token
		const token = createToken({
			id: lecturer.id,
			role: "lecturer",
			lecturerId: Number(lecturer.lecturer_id),
		});

		//Set the JWT in a secure HTTP-only cookie
		res.cookie(COOKIE_NAME, token, {
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});

		return sendSuccess(res, lecturer, "Lecturer logged in", 200);
	} catch (error) {
		return sendError(error, res);
	}
};
