import { Router } from "express";
import {
	getAllStudents,
	getStudentById,
	getStudentWithCourse,
	getCurrentStudent,
	registerCourses,
	getStudentDashboard
} from "../controllers/student.controller";

const router = Router();

// Route to get all students
// GET /v1/students
router.get("/", getAllStudents);

//GET /v1/students/dashboard
router.get("/dashboard", getStudentDashboard);

// Route to get current student
// GET /v1/students/me
router.get("/me", getCurrentStudent);

// Route to get a student by ID
// GET /v1/students/:id
router.get("/:id", getStudentById);

// Route to get students by course ID
// POST /v1/students/courses/:courseId
router.post("/courses/:courseId", getStudentWithCourse);

//POST /v1/students/register-courses
router.post("/register-courses", registerCourses);



export default router;
