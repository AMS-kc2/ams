import type { Request, Response } from "express";
import db from "../config/db";
import { generateOtp } from "../libs/helpers";
import AppError from "../libs/utils/AppError";
// import { markAttendance } from "../libs/utils/db";
import { sendError, sendSuccess } from "../libs/utils/response";
import { AuthenticatedRequest } from 'src/types/auth';
// import type { TablesInsert } from "../types/database";

const SESSION_EXPIRY_MS = 10 * 60 * 1000; // 10 mins

const isSessionExpired = (createdAt: string) =>
  new Date(createdAt).getTime() + SESSION_EXPIRY_MS < Date.now();

// --- Create new class session ---
export const createSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user?.id;
    const { courseId } = req.body;

    if (!lecturerId || !courseId)
      throw new AppError("Please provide valid course and lecturer ID");

    // ✅ Verify course belongs to lecturer
    const { data: course, error: courseErr } = await db
      .from("lecturer_courses")
      .select("*")
      .eq("course_id", courseId)
      .eq("lecturer_id", lecturerId)
      .maybeSingle();

    if (courseErr) throw new AppError((courseErr as Error).message);
    if (!course)
      throw new AppError("Course not found or not assigned to this lecturer", 404);

    // ✅ Check if there's an active valid session
    const { data: existing, error: sessionErr} = await db
      .from("sessions")
      .select("*")
      .eq("course_id", courseId)
      .eq("lecturer_id", lecturerId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

		if(sessionErr) throw new AppError((sessionErr as Error).message)
    if (existing && !isSessionExpired(existing.created_at!)) {
      return sendSuccess(res, existing, "An active class session already exists.");
    }

    // ✅ Generate new OTPs
    const signInOtp = generateOtp();
    // const signOutOtp = generateOtp();

    // ✅ Create new session
    const { data: session, error } = await db
      .from("sessions")
      .insert({
        course_id: Number(courseId),
        lecturer_id: Number(lecturerId),
        sign_in_otp: signInOtp.toString(),
        is_active: true,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
      })
      .select()
      .single();
		if(!session) throw new AppError("Unable to create session")
    if (error) throw new AppError(error);

    return sendSuccess(res, {...session, success: true}, "Class session created successfully");
  } catch (error) {
    sendError(error, res);
  }
};

// --- Verify OTP (sign-in / sign-out) ---
export const verifySession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) throw new AppError("Unauthorized", 401);

    const { otp, type, course_id, session_id } = req.body; // type: "SIGN_IN" | "SIGN_OUT"
    if (!otp || !type) throw new AppError("OTP and type are required");

		if(!course_id) throw new AppError("Please provide valid course id")

		if(type === "SIGN_OUT" && (!session_id || typeof session_id !== "number")){
			throw new AppError("Please provide valid session id")
		}

    // ✅ Find valid active session for OTP
    const otpColumn = type === "SIGN_OUT" ? "sign_out_otp" : "sign_in_otp";
    if(type === "SIGN_IN"){
			 const { data: session, error } = await db
				.from("sessions")
				.select("*")
				.eq("course_id", course_id)
				// .eq("id", session_id)
				.eq("is_active", true)
				.maybeSingle();

			if (error) throw new AppError(error.message);
			if (!session) throw new AppError("Invalid or inactive session", 400);

			if(session[otpColumn] !== otp) throw new AppError("Invalid OTP", 400)
			if (isSessionExpired(session.updated_at!)) {
				// Optionally deactivate expired session
				await db.from("sessions").update({ is_active: false }).eq("id", session.id);
				throw new AppError("Session has expired, you're late.");
			}

			// ✅ (Optional) Record attendance here

			return sendSuccess(res, {
				sessionId: session.id,
				success: true,
				message: `Successfully signed in for class.`,
			});
		}

    const { data: session, error } = await db
      .from("sessions")
      .select("*")
      .eq("course_id", Number(course_id))
      .eq("id", Number(session_id))
      // .eq("is_active", true)
      .maybeSingle();
		console.log(session)
    if (error) throw new AppError(error.message);
    if (!session) throw new AppError("Invalid or inactive session", 400);

		// if(session.sign_out_otp != otp) throw new AppError("Invalid OTP", 400)
    // if (isSessionExpired(session.updated_at!)) {
    //   // Optionally deactivate expired session
    //   await db.from("sessions").update({ is_active: false }).eq("id", session.id);
    //   throw new AppError("Session has expired, you're late.");
    // }

		if(!session.is_active) throw new AppError("Session is not active, you're late.", 400)

    // ✅ (Optional) Record attendance here

    return sendSuccess(res, {
      sessionId: session.id,
      success: true,
      message: `Successfully signed out for class.`,
    });
  } catch (error) {
    sendError(error, res);
  }
};

// End an active session
// PUT /sessions/:sessionId/end
export const endSession = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const lecturerId = req.user?.id;
		if (!lecturerId) throw new AppError("Unauthorized", 401);

		const { sessionId } = req.params;
		if (!sessionId) throw new AppError("Please Provide Valid Session Id");

		const { error } = await db
			.from("sessions")
			.update({ is_active: false })
			.eq("id", Number(sessionId))
			.eq("lecturer_id", lecturerId)

		if (error) throw error;

		return sendSuccess(res, { message: "Session ended successfully." });
	} catch (error) {
		sendError(error, res);
	}
};

//Reattach session
// PUT /sessions/:sessionId/reattach
export const reattachSession = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		if (!sessionId) throw new AppError("Please Provide Valid Session Id");
		const { error } = await db
			.from("sessions")
			.update({ is_active: true })
			.eq("id", Number(sessionId));

		if (error) throw error;

		return sendSuccess(res, { message: "Session reattached successfully." });
	} catch (error) {
		sendError(error, res);
	}
};

// Get all sessions, optionally filtered by lecturer or course
// GET /sessions?lecturerId=1&courseId=2
export const getSessions = async (req: Request, res: Response) => {
	try {
		const { lecturerId, courseId } = req.query;
		if (!lecturerId && !courseId)
			throw new AppError("Please Provide Valid Lecturer or Course Id");

		let query = db.from("sessions").select("*, courses(name), lecturers(name)");

		if (lecturerId) query = query.eq("lecturer_id", Number(lecturerId));
		if (courseId) query = query.eq("course_id", Number(courseId));

		const { data, error } = await query.order("created_at", {
			ascending: false,
		});

		if (error) throw error;

		return sendSuccess(res, data);
	} catch (error) {
		sendError(error, res);
	}
};

// Get all attendance for a specific session
// GET /sessions/:sessionId/attendances
export const getSessionAttendances = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		if (!sessionId) throw new AppError("Please Provide Valid Session Id");

		const { data, error } = await db
			.from("attendances")
			.select("*, students(name, matric_no)")
			.eq("session_id", Number(sessionId));

		if (error) throw error;

		return sendSuccess(res, data);
	} catch (error) {
		sendError(error, res);
	}
};

// Get active session for a lecturer
// GET /sessions/active
export const getActiveSessions = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const lecturerId = req.user?.id;
		if (!lecturerId) throw new AppError("Unauthorized", 401);

		const { data: sessions, error } = await db
			.from("sessions")
			.select("*")
			.eq("lecturer_id", lecturerId)
			.eq("is_active", true)
			.order("created_at", { ascending: false })


		if (error) throw new AppError(error.message);

		if (!sessions) {
			throw new AppError("No active session found.", 404);
		}

		return sendSuccess(res, sessions);
	} catch (error) {
		sendError(error, res);
	}
};

// Put sign-out OTP for a session
// PUT /sessions/:sessionId/sign-out-otp
export const getSignOutOtp = async (req: AuthenticatedRequest, res: Response) => {
	try {
		console.log("YAY!!")
		const lecturerId = req.user?.id;
		if (!lecturerId) throw new AppError("Unauthorized", 401);

		const { sessionId } = req.params;
		// const { courseId } = req.body

		if (!sessionId) throw new AppError("Please provide a valid session ID", 400);
		// if (!courseId) throw new AppError("Please provide a valid course ID", 400);

		// const { data: session, error } = await db
		// 	.from("sessions")
		// 	.select("sign_out_otp, lecturer_id")
		// 	.eq("id", Number(sessionId))
		// 	.single();

		const signOutOtp = generateOtp();

		const { data: session, error } = await db
			.from("sessions")
			.update({
				sign_out_otp: signOutOtp.toString(),
				updated_at: new Date().toISOString()
			})
			.eq("id", Number(sessionId))
			.eq("lecturer_id", lecturerId)
			// .eq("course_id", Number(courseId))
			.select("sign_out_otp")
			.single();


		if (error) throw error;
		if (!session) throw new AppError("Session not found", 404);

		return sendSuccess(res, { sign_out_otp: session.sign_out_otp });
	} catch (error) {
		sendError(error, res);
	}
};
