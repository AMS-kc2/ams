import { Router } from "express";
import * as courseController from "../controllers/course.controller";
import { authenticateJWT } from "../middleware";
import { registerCourses } from '../controllers/student.controller';

const router = Router();

// GET /courses
router.get("/", courseController.getAllCourses);

//POST /v1/students/register-courses/:Id
router.post("/register-courses/:studentId", registerCourses);

// GET /courses/student/:studentId
router.get(
	"/student/:studentId",
	authenticateJWT,
	courseController.getAllCourseWithStudent,
);

// GET /courses/lecturer/:lecturerId
router.get(
	"/lecturer/:lecturerId",
	authenticateJWT,
	courseController.getAllCourseWithLecturer,
);

// GET /courses/:courseId
router.get("/:id", authenticateJWT, courseController.getCourseWithId);

// POST /courses
router.post("/", courseController.createCourse);

// DELETE /courses/:id
router.delete("/:id", authenticateJWT, courseController.deleteCourse);

// PUT /courses/:id
router.put("/:id", authenticateJWT, courseController.updateCourse);

//GET /courses/:courseId/attendance/stats
router.get("/:courseId/attendance/stats",
	authenticateJWT,
	courseController.getCourseAttendanceStats
);

//GET /courses/:courseId/attendance/students?page=1&limit=20
router.get("/:courseId/attendance/students",
	authenticateJWT,
	courseController.getCourseAttendanceStudents
);

//GET /courses/:courseId/attendance/sessions?page=1&limit=20
router.get("/:courseId/attendance/sessions",
	authenticateJWT,
	courseController.getCourseAttendanceSessions
);

export default router;
