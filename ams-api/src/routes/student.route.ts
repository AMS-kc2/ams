import { Router } from "express";
import {
	getAllStudents,
	getStudentById,
	getStudentWithCourse,
} from "../controllers/student.controller";

const router = Router();

// Route to get all students
// GET /v1/students
router.get("/", getAllStudents);

// Route to get a student by ID
// GET /v1/students/:id
router.get("/:id", getStudentById);

// Route to get students by course ID
// POST /v1/students/courses/:courseId
router.post("/courses/:courseId", getStudentWithCourse);

export default router;
