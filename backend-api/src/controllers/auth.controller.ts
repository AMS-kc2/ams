// @ts-check

import { hash, } from "argon2";
import prisma from "../config/db";
import AppError from "../libs/utils/AppError";
import { handleError, sendSuccess } from "../libs/utils/response";
import {
	lecturerLoginSchema,
	lecturerSignupSchema,
	studentLoginSchema,
	studentSignupSchema
} from "../schema/auth.schema";

export const studentSignup = async (req, res) => {
	try {
		const payload = await studentSignupSchema.parseAsync(req.body);
		const { matricNumber, surname, level, semester } = payload;

		const student = await prisma.student.create({
			data: {
				matricNumber,
				surname,
				level: `L${level}`,
				semester: semester === "1st" ? "FIRST" : "SECOND",
			},
		});

		return sendSuccess(res, student, "Student created", 201);
	} catch (err) {
		return handleError(res, err);
	}
};

export const studentLogin = async (req, res) => {
	try {
		const payload = await studentLoginSchema.parseAsync(req.body);
		const { matricNumber, surname } = payload;

		const student = await prisma.student.findUnique({
			where: { matricNumber },
		});

		if (student.surname !== surname) {
			throw new AppError("you've forgotten your surname? What a bad son");
		}
		return sendSuccess(res, student, "Student logged in", 200);
	} catch (err) {
		return handleError(res, err);
	}
};

/*

model Lecturer {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  lecturerId   String   @unique
  passwordHash String
  level        Level
  semester     Semester
  courses      String[]       // valid in MongoDB as scalar list
  totalClasses Int
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

*/

export const lecturerSignUp = async (req, res) => {
	try {
		const { 
			lecturerId, 
			password, 
			level, 
			courses, 
			semester, 
			totalClasses 
		} = await lecturerSignupSchema.parseAsync(req.body);

		const passwordHash = await hash(password);

		const lecturer = await prisma.lecturer.create({
			data: {
				lecturerId,
				passwordHash,
				level,
				courses,
				semester,
				totalClasses,
			},
		});

		return sendSuccess(res, lecturer, "Lecturer created", 201);
	} catch (error) {
		handleError(res, error);
	}
};

export const lecturerLogin = async (res, req) => {
	try {
		const {password, lecturerId} = await lecturerLoginSchema.parseAsync(req.body)

		const lecturer = await prisma.lecturer.findUnique({
			where: {lecturerId}
		})

		if(!lecturer){
			throw new AppError(`There's no Lecturer with id: ${lecturerId}`);
		}

		if(lecturer.password !== password){
			throw new AppError("The Password you Entered wasn't correct");
		}
	} catch (error) {
		handleError(res, error);
	}
}