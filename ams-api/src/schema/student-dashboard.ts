import { z } from "zod";

export const CourseItemSchema = z.object({
  id: z.number(),
  code: z.string().nullable(),
  title: z.string().nullable(),
  attendance_percentage: z.number().nullable(),
  total_sessions: z.number().nullable(),
  attended_sessions: z.number().nullable(),
  last_attended: z.string().nullable(),
  lecturer: z.string().nullable(),
});

export const StudentDashboardSchema = z.object({
  stats: z.object({
    overall_attendance: z.number(),
    total_courses: z.number(),
    sessions_today: z.number(),
    total_sessions_attended: z.number(),
  }),
  courses: z.array(CourseItemSchema),
});
