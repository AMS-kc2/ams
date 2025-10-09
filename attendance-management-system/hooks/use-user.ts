import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Student, Lecturer, UserSession } from "../server/types/auth";
import { Course } from "@/components/auth/register-admin/schema";

// Get current user session
// export function useUser() {
//   return useQuery<UserSession>({
//     queryKey: ["user", "session"],
//     queryFn: async () =>
//       axiosInstance.get("/auth/user-info", {
//         withCredentials: true,
//       }),
//     staleTime: 1000 * 60 * 5,
//     retry: false,
//   });
// }

// // Get student profile
// export function useStudent(studentId?: number) {
//   return useQuery<{ student: Student }>({
//     queryKey: ["student", studentId],
//     queryFn: async () =>
//       axiosInstance.get(`/students/${studentId}`, {
//         withCredentials: true,
//       }),
//     enabled: !!studentId,
//     staleTime: 1000 * 60 * 10,
//   });
// }

// // Get lecturer profile
// export function useLecturer(lecturerId?: number) {
//   return useQuery<{ lecturer: Lecturer }>({
//     queryKey: ["lecturer", lecturerId],
//     queryFn: async () =>
//       axiosInstance.get(`/lecturers/${lecturerId}`, {
//         withCredentials: true,
//       }),
//     enabled: !!lecturerId,
//     staleTime: 1000 * 60 * 10,
//   });
// }

// // Get user + their full profile
// export function useUserProfile() {
//   const { data: session, isLoading: sessionLoading, error } = useUser();
//   const user = session?.user;

//   const { data: student, isLoading: studentLoading } = useStudent(
//     user?.role === "student" ? user.matricNumber : undefined
//   );

//   const { data: lecturer, isLoading: lecturerLoading } = useLecturer(
//     user?.role === "lecturer" ? user.lecturerId : undefined
//   );

//   return {
//     session,
//     user,
//     profile:
//       user?.role === "student"
//         ? student?.student
//         : user?.role === "lecturer"
//         ? lecturer?.lecturer
//         : undefined,
//     isLoading: sessionLoading || studentLoading || lecturerLoading,
//     isAuthenticated: session?.isLoggedIn ?? false,
//     error,
//   };
// }

// Usage:
// const { user, profile, isLoading } = useUserProfile();
// if (user?.role === "student") profile.matricNumber
// if (user?.role === "lecturer") profile.lecturerId

export function useCurrentStudent() {
  return useQuery<Student & { courses: Course[] }>({
    queryKey: ["student"],
    queryFn: async () =>
      axiosInstance.get(`/students/me`, {
        withCredentials: true,
      }),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCurrentLecturer() {
  return useQuery<Lecturer>({
    queryKey: ["lecturer"],
    queryFn: async () =>
      axiosInstance.get(`/lecturers/me`, {
        withCredentials: true,
      }),
    staleTime: 1000 * 60 * 10,
  });
}

export default function useUser() {
  return useQuery<UserSession>({
    queryKey: ["user", "session"],
    queryFn: async () =>
      axiosInstance.get("/auth/user-info", {
        withCredentials: true,
      }),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
