export const COOKIE_NAME = "auth_token";

export interface JWTPayload {
  id: number;
  role: "student" | "lecturer";
  matricNumber?: number;
  lecturerId?: number;
}

export interface UserSession {
  isLoggedIn: boolean;
  user?: JWTPayload;
  error?: string;
}

export interface Student {
  id: number;
  level: string;
  matric_number: string;
  semester: string;
  surname: string;
}

export interface Lecturer {
  courses: string[];
  id: number;
  lecturer_id: string;
  level: string;
  password: string;
  semester: string;
  total_classes: number;
  full_name: string;
  department: string;
}
