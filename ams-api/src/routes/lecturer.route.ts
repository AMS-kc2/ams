import { Router } from "express";

const router = Router();

import {
	getLecturerById,
	getLecturers,
	getLecturerWithCourse,
} from "../controllers/lecturer.controller";

// Route to get all lecturers
// GET /v1/lecturers
router.get("/", getLecturers);

// Route to get a lecturer by ID
// GET /v1/lecturers/:id
router.get("/:id", getLecturerById);

// Route to get lecturers by course ID
// POST /v1/lecturers/courses/:courseId
router.post("/courses/:courseId", getLecturerWithCourse);

export default router;
