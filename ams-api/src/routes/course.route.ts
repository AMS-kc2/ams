import { Router } from "express";
import * as courseController from "../controllers/course.controller";

const router = Router();

// GET /courses
router.get("/", courseController.getAllCourses);

// GET /courses/student/:studentId
router.get("/student/:studentId", courseController.getAllCourseWithStudent);

// GET /courses/lecturer/:lecturerId
router.get("/lecturer/:lecturerId", courseController.getAllCourseWithLecturer);

// GET /courses/lecturer/:lecturerId
router.get("/:id", courseController.getCourseWithId);

// POST /courses
router.post("/", courseController.createCourse);

// DELETE /courses/:id
router.delete("/:id", courseController.deleteCourse);

// PUT /courses/:id
router.put("/:id", courseController.updateCourse);

export default router;
