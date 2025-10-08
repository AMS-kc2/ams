type Feed = {
  course_id: number;
  code: string;
  title: string;
  level: string;
  semester: string;
  student_count: number;
  total_sessions: number;
  total_attendances: number;
  attendance_rate: number;
};

type Session = {
  course_id: number;
  created_at: string;
  id: number;
  is_active: boolean;
  lecturer_id: number;
  sign_in_otp: string;
  sign_out_otp?: string;
  updated_at: string;
  success: boolean;
  expiry_minutes?: number;
};

type ActiveSession = {
  sessionId: number;
  courseId: number;
  signInOtp: string;
  signOutOtp: string | null;
  signInExpiry: number;
  signOutExpiry: number | null;
  hasSignedIn: boolean;
};

export type { Feed, Session, ActiveSession };
