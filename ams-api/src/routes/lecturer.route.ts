import { Router } from "express";

const router = Router();

import {
	getCurrentLecturer,
	getLecturerById,
	getLecturers,
	getLecturerWithCourse,
	getLecturerFeed
} from "../controllers/lecturer.controller";

// Route to get all lecturers
// GET /v1/lecturers
router.get("/", getLecturers);

//Route to get current lecturer
// GET /v1/lecturers/me
router.get("/me", getCurrentLecturer)

//Route to get current lecturer's getLecturerFeed
// GET /v1/lecturers/my-feed
router.get("/my-feed", getLecturerFeed)

// Route to get a lecturer by ID
// GET /v1/lecturers/:id
router.get("/:id", getLecturerById);

// Route to get lecturers by course ID
// POST /v1/lecturers/courses/:courseId
router.post("/courses/:courseId", getLecturerWithCourse);

export default router;
