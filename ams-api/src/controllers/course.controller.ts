import type { Request, Response } from "express";
// import type { TablesInsert } from "types/database";
import z from "zod";
import db from "../config/db";
import AppError from "../libs/utils/AppError";
import { sendError, sendSuccess } from "../libs/utils/response";
import { AuthenticatedRequest } from 'src/types/auth';

/* -----------------------
   Types (for reference)
   ----------------------- */
type StudentAttendance = {
  student_id: number;
  matric_no: string;
  full_name: string;
  total_attended: number;
  total_sessions: number;
  attendance_percentage: number;
  last_attended: string | null;
};

type SessionDto = {
  id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  students_present: number;
  total_students: number;
  attendance_percentage: number;
};

type CourseStats = {
  course_id: number;
  course_code: string;
  course_title: string;
  total_students: number;
  total_sessions: number;
  overall_attendance: number;
  last_session:
    | {
        date: string;
        students_present: number;
        total_students: number;
      }
    | null;
};

/* -----------------------
   Helper
   ----------------------- */
const safePercent = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : Math.round((numerator / denominator) * 10000) / 100; // two decimals

// Create course schema
export const createCourseSchema = z.object({
	title: z.string().min(3, { message: "Title must be at least 3 characters" }),
	code: z.string().min(3, { message: "Code must be at least 3 characters" }),
	level: z.enum(["100", "200", "300", "400", "500"]),
	semester: z.enum(["1st", "2nd"]),
	no_of_students: z.number().min(1, { message: "Number of students cannot be less than 1" }),
});

// Get all courses
// GET /courses
export const getAllCourses = async (_: Request, res: Response) => {
	try {
		const { data: courses, error } = await db.from("courses").select("*");

		if (error) throw new AppError(error.message);
		if (!courses || courses.length === 0) throw new AppError("No Course was found", 404);
		return sendSuccess(res, { courses });
	} catch (error) {
		sendError(error, res);
	}
};

// Get all courses with student
// GET /courses/student/:studentId
export const getAllCourseWithStudent = async (req: Request, res: Response) => {
	try {
		const { studentId } = req.params;
		if (!studentId) throw new AppError("Please Provide Valid Student Id");

		const { data: courses } = await db
			.from("courses")
			.select("*")
			.eq("student_id", studentId);

		if (!courses) throw new AppError("No Course was found");

		return sendSuccess(res, { courses });
	} catch (error) {
		sendError(error, res);
	}
};

// Get all courses with lecturer
// GET /courses/lecturer/:lecturerId
export const getAllCourseWithLecturer = async (req: Request, res: Response) => {
	try {
		const { lecturerId } = req.params;
		if (!lecturerId) throw new AppError("Please Provide Valid Lecturer Id");

		const { data: courses } = await db
			.from("courses")
			.select("*")
			.eq("lecturer_id", lecturerId);

		if (!courses) throw new AppError("No Course was found");

		return sendSuccess(res, { courses });
	} catch (error) {
		sendError(error, res);
	}
};

// Get course with id
// GET /courses/:id
export const getCourseWithId = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const studentId = req.user?.id
		const { id } = req.params;
		if (!id || typeof id !== "string")
			throw new AppError("Please Provide Valid Course Id", 400);
		if(!studentId) throw new AppError("Unauthorized", 401)

		const { data: course, error: courseError } = await db
			.from("courses")
			.select("*")
			.eq("id", Number(id))
			.single();

		if(!course) throw new AppError("Course Not Found", 404)
		if(courseError) throw new AppError(courseError)

		const {data: attendances, error: attendanceError} = await db
			.from("attendances")
			.select("*")
			.eq("course_id", Number(id))
			.eq("student_id", Number(studentId))

		if(attendanceError) throw new AppError(attendanceError.message)
		return sendSuccess(res, { ...course, attendances });
	} catch (error) {
		sendError(error, res);
	}
};

// Create course
// POST /courses
export const createCourse = async (req: Request, res: Response) => {
	try {
		const { title, code, level, semester, no_of_students } = createCourseSchema.parse(req.body);

		const {data:existingCourse} = await db
			.from("courses")
			.select("*")
			.eq("code", code)
			.maybeSingle();


		if (existingCourse) {
			console.log("---------" +existingCourse);

			throw new AppError("Course already exists")
		};

		const course = await db
			.from("courses")
			.insert({
				title,
				code,
				level,
				semester,
				no_of_students,
			})
			.select()
			.single();

		if (!course) throw new AppError("Course Creation Failed");

		return sendSuccess(res, { ...course }, "Course Created Successfully", 201);
	} catch (error) {
		sendError(error, res);
	}
};

// Delete course
// DELETE /courses
export const deleteCourse = async (req: Request, res: Response) => {
	try {
		const { id } = req.body;
		if (!id || typeof id !== "string")
			throw new AppError("Please Provide Valid Course Id");

		const course = await db.from("courses").delete().eq("id", Number(id));

		if (!course) throw new AppError("Course Deletion Failed");

		return sendSuccess(res, null, "Course Deleted Successfully");
	} catch (error) {
		sendError(error, res);
	}
};

// Update course
// PUT /courses
export const updateCourse = async (req: Request, res: Response) => {
	try {
		const { id, title, code, level, semester } = createCourseSchema
			.extend({ id: z.string().min(1) })
			.parse(req.body);

		const course = await db
			.from("courses")
			.update({ title, code, level, semester })
			.eq("id", Number(id))
			.select()
			.single();

		if (!course) throw new AppError("Course Update Failed");
		return sendSuccess(res, { course }, "Course Updated Successfully");
	} catch (error) {
		sendError(error, res);
	}
};

/* -----------------------
   //GET /courses/:courseId/attendance/stats
   ----------------------- */
export const getCourseAttendanceStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user?.id;
    if (!lecturerId) throw new AppError("Unauthorized", 401);

    const { courseId } = req.params;
    if (!courseId) throw new AppError("Please provide a valid course id", 400);

    // Verify lecturer owns course (via lecturer_courses)
    const { data: lc, error: lcErr } = await db
      .from("lecturer_courses")
      .select("course_id")
      .eq("course_id", Number(courseId))
      .eq("lecturer_id", Number(lecturerId))
      .maybeSingle();

    if (lcErr) throw new AppError(lcErr.message);
    if (!lc) throw new AppError("Course not found or not assigned to you", 404);

    // Basic course info
    const { data: course, error: courseErr } = await db
      .from("courses")
      .select("id, code, title, no_of_students")
      .eq("id", Number(courseId))
      .maybeSingle();

    if (courseErr) throw new AppError(courseErr.message);
    if (!course) throw new AppError("Course not found", 404);

    // Fetch sessions for this course (all sessions)
    const { data, error: sessionsErr } = await db
      .from("sessions")
      .select("id, created_at, updated_at")
      .eq("course_id", Number(courseId));

    if (sessionsErr) throw new AppError(sessionsErr.message);

		const sessions = data||[]

    const total_sessions = Array.isArray(sessions) ? sessions.length : 0;

    // Fetch all attendances for this course
    const { data: attendances = [], error: attendErr } = await db
      .from("attendances")
      .select("id, session_id, student_id, sign_in_time, sign_out_time")
      .eq("course_id", Number(courseId));

    if (attendErr) throw new AppError(attendErr.message);
		if (!attendances) return sendSuccess(res, {})


    const total_attendances = Array.isArray(attendances) ? attendances.length : 0;

    // Overall attendance rate: total_attendances / (total_sessions * total_students)
    const total_students = course.no_of_students ?? 0;
    const denominator = total_sessions * total_students;
    const overall_attendance = denominator === 0 ? 0 : Math.round((total_attendances / denominator) * 10000) / 100;

    // Last session summary (most recent session by created_at)
    let last_session = null;
    if (total_sessions > 0) {
      const sorted = sessions
        .filter((s: any) => s.created_at)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const last = sorted[0];
      if (last) {
        const students_present = attendances.filter((a: any) => a.session_id === last.id).length;
        last_session = {
          date: last.created_at ? new Date(last.created_at).toISOString() : new Date().toISOString(),
          students_present,
          total_students,
        };
      }
    }

    const stats: CourseStats = {
      course_id: Number(course.id),
      course_code: course.code,
      course_title: course.title,
      total_students,
      total_sessions,
      overall_attendance,
      last_session,
    };

    return sendSuccess(res, stats, "Course stats fetched");
  } catch (err: any) {
    return sendError(err, res);
  }
};

/* -----------------------
   //GET /courses/:courseId/attendance/students?page=1&limit=20
   ----------------------- */
export const getCourseAttendanceStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user?.id;
    if (!lecturerId) throw new AppError("Unauthorized", 401);

    const { courseId } = req.params;
    if (!courseId) throw new AppError("Please provide a valid course id", 400);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    // Verify ownership
    const { data: lc, error: lcErr } = await db
      .from("lecturer_courses")
      .select("course_id")
      .eq("course_id", Number(courseId))
      .eq("lecturer_id", Number(lecturerId))
      .maybeSingle();

    if (lcErr) throw new AppError(lcErr.message);
    if (!lc) throw new AppError("Course not found or not assigned to you", 404);

    // Fetch enrolled students (student_courses JOIN students)
    const { data: enrolled = [], error: enrolledErr } = await db
      .from("student_courses")
      .select("student_id, students(id, matric_number, surname)")
      .eq("course_id", Number(courseId));

    if (enrolledErr) throw new AppError(enrolledErr.message);

    const studentsList = (enrolled || []).map((row: any) => ({
      student_id: row.student_id,
      matric_no: row.students?.matric_number ?? null,
      full_name: row.students ? `${row.students.surname}` : null,
    }));

    // Fetch sessions count
    const { data: sessions = [], error: sessionsErr } = await db
      .from("sessions")
      .select("id")
      .eq("course_id", Number(courseId));

    if (sessionsErr) throw new AppError(sessionsErr.message);
    const total_sessions = Array.isArray(sessions) ? sessions.length : 0;

    // Fetch attendances for this course (all)
    const { data, error: attendErr } = await db
      .from("attendances")
      .select("id, student_id, session_id, sign_in_time")
      .eq("course_id", Number(courseId));

    if (attendErr) throw new AppError(attendErr.message);
		// if(!attendances) return sendSuccess(res, {
		// 	page,
		// 	limit,
		// 	total: 0,
		// 	students: [],
		// });

		const attendances = data || [];

    // Build map of student aggregates
    const attendanceByStudent = new Map<number, { total_attended: number; last_attended: string | null }>();
    for (const a of attendances) {
      const sid = a.student_id;
      const prev = attendanceByStudent.get(sid) ?? { total_attended: 0, last_attended: null };
      const last = prev.last_attended ? new Date(prev.last_attended) : null;
      const thisTime = a.sign_in_time ? new Date(a.sign_in_time) : null;
      let last_attended_iso = prev.last_attended;
      if (thisTime) {
        if (!last || thisTime.getTime() > last.getTime()) last_attended_iso = thisTime.toISOString();
      }
      attendanceByStudent.set(sid, {
        total_attended: prev.total_attended + 1,
        last_attended: last_attended_iso,
      });
    }

    // Combine and paginate
    const combined: StudentAttendance[] = studentsList.map((s: any) => {
      const agg = attendanceByStudent.get(s.student_id) ?? { total_attended: 0, last_attended: null };
      const percentage = total_sessions === 0 ? 0 : Math.round((agg.total_attended / total_sessions) * 10000) / 100;
      return {
        student_id: s.student_id,
        matric_no: s.matric_no ?? "",
        full_name: s.full_name ?? "",
        total_attended: agg.total_attended,
        total_sessions,
        attendance_percentage: percentage,
        last_attended: agg.last_attended,
      };
    });

    // Pagination
    const totalStudents = combined.length;
    const paginated = combined.slice(offset, offset + limit);

    return sendSuccess(res, {
      page,
      limit,
      total: totalStudents,
      students: paginated,
    });
  } catch (err: any) {
    return sendError(err, res);
  }
};

/* -----------------------
   //GET /courses/:courseId/attendance/sessions?page=1&limit=20
   ----------------------- */
export const getCourseAttendanceSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user?.id;
    if (!lecturerId) throw new AppError("Unauthorized", 401);

    const { courseId } = req.params;
    if (!courseId) throw new AppError("Please provide a valid course id", 400);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    // Verify ownership
    const { data: lc, error: lcErr } = await db
      .from("lecturer_courses")
      .select("course_id")
      .eq("course_id", Number(courseId))
      .eq("lecturer_id", Number(lecturerId))
      .maybeSingle();

    if (lcErr) throw new AppError(lcErr.message);
    if (!lc) throw new AppError("Course not found or not assigned to you", 404);

    // Fetch enrolled student count (to compute percentages)
    const { data: enrolled = [], error: enrolledErr } = await db
      .from("student_courses")
      .select("student_id")
      .eq("course_id", Number(courseId));

    if (enrolledErr) throw new AppError(enrolledErr.message);
    const total_students = Array.isArray(enrolled) ? enrolled.length : 0;

    // Fetch sessions (paginated)
    const { data: sessions = [], error: sessionsErr } = await db
      .from("sessions")
      .select("id, created_at, updated_at")
      .eq("course_id", Number(courseId))
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (sessionsErr) throw new AppError(sessionsErr.message);
		// if(!sessions) return sendSuccess(res, {
		// 	page,
		// 	limit,
		// 	total: 0,
		// 	sessions: [],
		// });



    // Fetch attendances for these sessions only (one query)
    const sessionIds = (sessions || []).map((s: any) => s.id);

    let attendancesForSessions: any[] = [];

    if (sessionIds.length > 0) {
      const { data: arows = [], error: aErr } = await db
        .from("attendances")
        .select("id, session_id, student_id")
        .in("session_id", sessionIds);

      if (aErr) throw new AppError(aErr.message);
      attendancesForSessions = arows || [];
    }

    // Build Session DTOs
    const sessionDtos: SessionDto[] = (sessions || []).map((s: any) => {
      const students_present = attendancesForSessions.filter((a) => a.session_id === s.id).length;
      const attendance_percentage = total_students === 0 ? 0 : Math.round((students_present / total_students) * 10000) / 100;
      // const date = s.created_at ? new Date(s.created_at).toISOString().split("T")[0] : null;
      // const start_time = s.created_at ? new Date(s.created_at).toISOString().split("T")[1].replace("Z", "") : null;
      // const end_time = s.updated_at ? new Date(s.updated_at).toISOString().split("T")[1].replace("Z", "") : null;
			// use the full ISO timestamps (no splitting)
			const date = s.created_at ?? null;      // e.g. "2025-10-08T12:34:56.789Z"
			const start_time = s.created_at ?? null;
			const end_time = s.updated_at ?? null;


      return {
        id: s.id,
        date: date ?? new Date().toISOString().split("T")[0],
        start_time,
        end_time,
        students_present,
        total_students,
        attendance_percentage,
      };
    });

    // We also might want to return a total count of sessions (for client pagination)
    const { data: allSessions = [], error: allSessionsErr } = await db
      .from("sessions")
      .select("id")
      .eq("course_id", Number(courseId));

    if (allSessionsErr) throw new AppError(allSessionsErr.message);
    const total_sessions = Array.isArray(allSessions) ? allSessions.length : 0;

    return sendSuccess(res, {
      page,
      limit,
      total: total_sessions,
      sessions: sessionDtos,
    });
  } catch (err: any) {
    return sendError(err, res);
  }
};
