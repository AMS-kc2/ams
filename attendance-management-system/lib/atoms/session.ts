import { atom } from "jotai";
import axiosInstance from "../axios";
import { Session } from "@/components/lecturer/types";
import { toast } from "sonner";

export type ActiveSession = {
  sessionId: number;
  courseId: number;
  signInOtp: string;
  signOutOtp: string | null;
  signInExpiry: number;
  signOutExpiry: number | null;
  hasSignedIn: boolean;
  expiryMinutes: number;
};

// Main sessions atom - stores Map of courseId -> ActiveSession
export const sessionsAtom = atom<Map<number, ActiveSession>>(new Map());

// Derived atom to fetch active sessions on mount
export const fetchSessionsAtom = atom(null, async (_, set) => {
  try {
    const data: Session = await axiosInstance.get("/sessions/active", {
      withCredentials: true,
    });

    console.log(data);

    if (data && Array.isArray(data)) {
      const sessionsMap = new Map<number, ActiveSession>();

      data.forEach((session: Session) => {
        const createdAt = new Date(session.created_at).getTime();
        const expiryMinutes = session.expiry_minutes || 10;
        const signInExpiry = createdAt + expiryMinutes * 60 * 1000;

        let signOutExpiry = null;
        if (session.sign_out_otp && session.updated_at) {
          const updatedAt = new Date(session.updated_at).getTime();
          signOutExpiry = updatedAt + expiryMinutes * 60 * 1000;
        }

        sessionsMap.set(session.course_id, {
          sessionId: session.id,
          courseId: session.course_id,
          signInOtp: session.sign_in_otp,
          signOutOtp: session.sign_out_otp || null,
          signInExpiry,
          signOutExpiry,
          hasSignedIn: !!session.sign_out_otp,
          expiryMinutes,
        });
      });

      set(sessionsAtom, sessionsMap);
    }
  } catch (error) {
    toast(error as String);
    console.warn("Failed to fetch active sessions:", error);
  }
});

// Create session (generate sign-in OTP) with custom expiry time
export const createSessionAtom = atom(
  null,
  async (get, set, payload: { courseId: number; expiryMinutes: number }) => {
    try {
      const data: Session & { success: boolean } = await axiosInstance.post(
        "/sessions",
        { courseId: payload.courseId, expiryMinutes: payload.expiryMinutes },
        { withCredentials: true }
      );

      const sessionData = data;
      console.log(data);

      if (sessionData && data.success !== false) {
        const newSession: ActiveSession = {
          sessionId: sessionData.id,
          courseId: sessionData.course_id || payload.courseId,
          signInOtp: sessionData.sign_in_otp,
          signOutOtp: null,
          signInExpiry: Date.now() + payload.expiryMinutes * 60 * 1000,
          signOutExpiry: null,
          hasSignedIn: false,
          expiryMinutes: payload.expiryMinutes,
        };

        const sessions = new Map(get(sessionsAtom));
        sessions.set(payload.courseId, newSession);
        set(sessionsAtom, sessions);

        return { success: true, session: newSession };
      }

      return { success: false, error: "Failed to create session" };
    } catch (error: any) {
      console.warn("Error creating session:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || error,
      };
    }
  }
);

// Generate sign-out OTP with same expiry as sign-in
export const generateSignOutOtpAtom = atom(
  null,
  async (get, set, courseId: number) => {
    const sessions = get(sessionsAtom);
    const session = sessions.get(courseId);

    if (!session) {
      return { success: false, error: "No active session found" };
    }

    try {
      const data: { sign_out_otp: string } = await axiosInstance.put(
        `/sessions/${session.sessionId}/sign-out-otp`,
        { expiryMinutes: session.expiryMinutes },
        { withCredentials: true }
      );

      const sessionData = data;

      if (sessionData && sessionData.sign_out_otp) {
        const updatedSession: ActiveSession = {
          ...session,
          signOutOtp: sessionData.sign_out_otp,
          signOutExpiry: Date.now() + session.expiryMinutes * 60 * 1000,
          hasSignedIn: true,
        };

        const newSessions = new Map(sessions);
        newSessions.set(courseId, updatedSession);
        set(sessionsAtom, newSessions);

        return { success: true, session: updatedSession };
      }

      return { success: false, error: "Failed to generate sign-out OTP" };
    } catch (error: any) {
      console.warn("Error generating sign-out OTP:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || error,
      };
    }
  }
);

// End session
export const endSessionAtom = atom(null, async (get, set, courseId: number) => {
  const sessions = get(sessionsAtom);
  const session = sessions.get(courseId);

  if (!session) {
    return { success: false, error: "No active session found" };
  }

  try {
    await axiosInstance.put(
      `/sessions/${session.sessionId}/end`,
      {},
      { withCredentials: true }
    );

    const newSessions = new Map(sessions);
    newSessions.delete(courseId);
    set(sessionsAtom, newSessions);

    return { success: true };
  } catch (error: any) {
    console.warn("Error ending session:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || error,
    };
  }
});
