import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';

const router = Router();

// POST /attendances
router.post('/', attendanceController.createAttendance);

// GET /attendances/course/:courseId/?page=1&limit=10
router.get('/course/:courseId', attendanceController.getAllAttendanceFromCourse);

// GET /attendances/course/:courseId/student/:studentId/?page=1&limit=10
router.get('/course/:courseId/student/:studentId', attendanceController.getAllAttendanceForCourseAndStudent);

// DELETE /attendances/:attendanceId
router.delete('/:attendanceId', attendanceController.deleteAttendance);


export default router;
