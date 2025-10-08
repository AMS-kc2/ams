"use client";
import Loading from "@/components/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentStudent } from "@/hooks/use-user";
import { useFetch } from "@/hooks/use-api";
import {
  ArrowRight,
  BookOpen,
  XCircle,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CourseWithStats = {
  id: number;
  code: string;
  title: string;
  attendance_percentage: number;
  total_sessions: number;
  attended_sessions: number;
};

type DashboardStats = {
  overall_attendance: number;
  total_courses: number;
  sessions_today: number;
  total_sessions_attended: number;
};

type StudentDashboardData = {
  stats: DashboardStats;
  courses: CourseWithStats[];
};

const StudentDashboard = () => {
  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
  } = useCurrentStudent();

  const { data: dashboardData, isLoading: dashboardLoading } =
    useFetch<StudentDashboardData>(
      ["student-dashboard"],
      "/students/dashboard",
      { withCredentials: true }
    );

  const isLoading = studentLoading || dashboardLoading;

  if (isLoading) return <Loading />;

  if (studentError) {
    return (
      <div className="px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Error: {studentError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground">No student data found.</p>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const courses = dashboardData?.courses || [];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-6 border-b">
        <h1 className="text-xl font-bold text-primary mb-4">KCS 2.0</h1>

        <div className="space-y-1">
          <h2 className="text-base font-semibold">
            Welcome, <span className="text-primary">{student?.surname}</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Level {student?.level}</span>
            <span>•</span>
            <span>{student?.matric_number}</span>
            <span>•</span>
            <span>{student?.semester} Semester</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Attendance
                  </span>
                </div>
                <p className="text-xl font-bold">{stats.overall_attendance}%</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Courses</span>
                </div>
                <p className="text-xl font-bold">{stats.total_courses}</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Attended
                  </span>
                </div>
                <p className="text-xl font-bold">
                  {stats.total_sessions_attended}
                </p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <p className="text-xl font-bold">{stats.sessions_today}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Courses */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">My Courses</h3>
          <span className="text-xs text-muted-foreground">
            {courses.length} total
          </span>
        </div>

        {courses.length > 0 ? (
          <div className="flex flex-col gap-4">
            {courses.map((course) => (
              <Link href={`/student/course/${course.id}`} key={course.id}>
                <Card className="border hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">
                            {course.code}
                          </h4>
                          <Badge
                            variant={
                              course.attendance_percentage >= 75
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {course.attendance_percentage}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {course.title}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {course.attended_sessions}/{course.total_sessions}{" "}
                          sessions
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            course.attendance_percentage >= 75 &&
                              "text-primary",
                            course.attendance_percentage < 75 &&
                              course.attendance_percentage >= 50 &&
                              "text-yellow-600",
                            course.attendance_percentage < 50 &&
                              "text-destructive"
                          )}
                        >
                          {course.attendance_percentage}%
                        </span>
                      </div>
                      <Progress
                        value={course.attendance_percentage}
                        className="h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <h3 className="font-semibold text-sm mb-1">No courses yet</h3>
            <p className="text-xs text-muted-foreground max-w-[250px]">
              Your enrolled courses will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
