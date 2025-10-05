import { Router } from "express";
import * as courseController from "../controllers/course.controller";
import { authenticateJWT } from "../middleware";

const router = Router();

// GET /courses
router.get("/", courseController.getAllCourses);

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
router.get("/:id", courseController.getCourseWithId);

// POST /courses
router.post("/", courseController.createCourse);

// DELETE /courses/:id
router.delete("/:id", authenticateJWT, courseController.deleteCourse);

// PUT /courses/:id
router.put("/:id", authenticateJWT, courseController.updateCourse);

export default router;
