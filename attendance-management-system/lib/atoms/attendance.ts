import { atom } from "jotai";
import axiosInstance from "../axios";

type AttendanceInfo = {
  id: number;
  course_id: number;
  session_id: number;
  student_id: number;
  signInTime: string;
  signOutTime?: string;
  location?: string;
};

interface AttendanceState {
  currentAttendance: AttendanceInfo | null;
  isSignedIn: boolean;
}

type Response = {
  sessionId: number;
  message: string;
  success: boolean;
};

// Atoms
export const attendanceAtom = atom<AttendanceState>({
  currentAttendance: null,
  isSignedIn: false,
});

// Derived atom for sign-in action with OTP verification
export const signInAtom = atom(
  null,
  async (
    _,
    set,
    payload: {
      otp: string;
      courseId: number;
      studentId: number;
    }
  ) => {
    try {
      // Verify OTP first
      const response: Response = await axiosInstance.post(
        "/sessions/verify",
        {
          otp: payload.otp,
          course_id: payload.courseId,
          type: "SIGN_IN",
        },
        {
          withCredentials: true,
        }
      );

      if (!response.success) {
        throw new Error(response.message || "OTP verification failed");
      }

      const signInTime = new Date().toISOString();

      const attendance: AttendanceInfo = {
        id: 0, // Will be assigned by server
        course_id: payload.courseId,
        session_id: response.sessionId,
        student_id: payload.studentId,
        signInTime,
      };

      set(attendanceAtom, {
        currentAttendance: attendance,
        isSignedIn: true,
      });

      return attendance;
    } catch (error) {
      console.warn("Error during sign-in:", error);
      throw error;
    }
  }
);

// Derived atom for sign-out action with OTP verification and server submission
export const signOutAtom = atom(
  null,
  async (get, set, payload: { otp: string }) => {
    const state = get(attendanceAtom);

    if (!state.currentAttendance || !state.isSignedIn) {
      throw new Error("No active sign-in session");
    }

    try {
      // Verify OTP first
      const verifyResponse: Response = await axiosInstance.post(
        "/sessions/verify",
        {
          otp: payload.otp,
          course_id: state.currentAttendance.course_id,
          session_id: state.currentAttendance.session_id,
          type: "SIGN_OUT",
        },
        {
          withCredentials: true,
        }
      );

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message || "OTP verification failed");
      }
      // const markAttendance: {sucess: boolean} = await axiosInstance.post(
      //   "/attendance",
      //   {
      //     course_id: state.currentAttendance.course_id,
      //     session_id: state.currentAttendance.session_id,
      //     student_id: state.currentAttendance.student_id,
      //     SignInTime: state.currentAttendance.signInTime,
      //     signOutTime: state.currentAttendance.signOutTime,
      //     location: state.currentAttendance.location,
      //   },
      //   {
      //     withCredentials: true,
      //   }
      // );

      // if(!markAttendance.sucess){
      //   throw new Error(verifyResponse.message || "Unable to mark failed");
      // }

      const signOutTime = new Date().toISOString();

      const completedAttendance: AttendanceInfo = {
        ...state.currentAttendance,
        signOutTime,
      };

      // Send attendance to server
      await axiosInstance.post("/attendances", completedAttendance, {
        withCredentials: true,
      });

      // Clear state after successful submission
      set(attendanceAtom, {
        currentAttendance: null,
        isSignedIn: false,
      });

      return completedAttendance;
    } catch (error) {
      console.warn("Error submitting attendance:", error);
      throw error;
    }
  }
);
