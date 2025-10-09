"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  ArrowLeft,
  Calendar,
  Search,
  TrendingUp,
  Users,
  XCircle,
  CheckCircle2,
  Clock,
  UserX,
  CalendarX,
} from "lucide-react";
// import { cn } from "@/lib/utils";
import { useFetch } from "@/hooks/use-api";
import NotFoundPage from "@/app/not-found";

type StudentAttendance = {
  student_id: number;
  matric_no: string;
  full_name: string;
  total_attended: number;
  total_sessions: number;
  attendance_percentage: number;
  last_attended: string | null;
};

type SessionData = {
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
  last_session: {
    date: string;
    students_present: number;
    total_students: number;
  } | null;
};

/**
 * Backend endpoint return shapes
 */
type StudentsResp = {
  page: number;
  limit: number;
  total: number;
  students: StudentAttendance[];
};

type SessionsResp = {
  page: number;
  limit: number;
  total: number;
  sessions: SessionData[];
};

const StudentSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-5">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const SessionSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-5">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const AttendancePage = () => {
  const { id } = useParams(); // course id
  const router = useRouter();
  const courseId = String(id ?? "");

  const [search, setSearch] = useState("");

  // --- Fetch stats
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useFetch<CourseStats | null>(
    ["course", courseId, "stats"],
    `/courses/${courseId}/attendance/stats`,
    {
      withCredentials: true,
    }
  );

  // --- Fetch students (first page, large limit; can add pagination later)
  const STUDENTS_PAGE = 1;
  const STUDENTS_LIMIT = 200; // reasonable for read-only view; adjust if needed
  const {
    data: studentsResp,
    error: studentsError,
    isLoading: studentsLoading,
  } = useFetch<StudentsResp | null>(
    [
      "course",
      courseId,
      "students",
      STUDENTS_PAGE.toString(),
      STUDENTS_LIMIT.toString(),
    ],
    `/courses/${courseId}/attendance/students?page=${STUDENTS_PAGE}&limit=${STUDENTS_LIMIT}`,
    { withCredentials: true }
  );

  // --- Fetch sessions (recent sessions page)
  const SESSIONS_PAGE = 1;
  const SESSIONS_LIMIT = 10;
  const {
    data: sessionsResp,
    error: sessionsError,
    isLoading: sessionsLoading,
  } = useFetch<SessionsResp | null>(
    [
      "course",
      courseId,
      "sessions",
      SESSIONS_PAGE.toString(),
      SESSIONS_LIMIT.toString(),
    ],
    `/courses/${courseId}/attendance/sessions?page=${SESSIONS_PAGE}&limit=${SESSIONS_LIMIT}`,
    { withCredentials: true }
  );

  // Immutable read-only derived values & good defaults
  const stats: CourseStats = useMemo(
    () =>
      statsData ?? {
        course_id: Number(courseId || 0),
        course_code: "N/A",
        course_title: "Course Attendance",
        total_students: 0,
        total_sessions: 0,
        overall_attendance: 0,
        last_session: null,
      },
    [statsData, courseId]
  );

  const students = useMemo(() => studentsResp?.students ?? [], [studentsResp]);
  const sessions = useMemo(() => sessionsResp?.sessions ?? [], [sessionsResp]);

  const anyLoading = statsLoading || studentsLoading || sessionsLoading;
  const anyError = statsError ?? studentsError ?? sessionsError;

  const filteredStudents = useMemo(() => {
    if (!students || students.length === 0) return [];
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        (s.full_name ?? "").toLowerCase().includes(q) ||
        (s.matric_no ?? "").toLowerCase().includes(q)
    );
  }, [students, search]);

  if (!anyLoading && anyError && !statsData) return <NotFoundPage />;

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff <= 7) return `${diff} days ago`;
    return d.toLocaleDateString();
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="absolute -top-14 left-0">
        <Button
          onClick={() => router.push("/lecturer/dashboard")}
          variant="ghost"
          className="cursor-pointer hover:bg-muted"
        >
          <ArrowLeft size={15} className="mr-2" /> Back to Dashboard
        </Button>
      </div>

      <main className="p-6 md:p-10 space-y-8 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {anyLoading ? (
              <Skeleton className="h-10 w-64" />
            ) : (
              stats.course_code
            )}
          </h1>
          {!anyLoading && (
            <p className="text-muted-foreground">{stats.course_title}</p>
          )}
        </div>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {anyLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    Total Students
                    <Users className="text-primary" size={20} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-1">
                    {students.length ?? stats.total_students}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enrolled in course
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    Overall Attendance
                    <TrendingUp className="text-green-600" size={20} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-1">
                    {stats.overall_attendance}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average across all students
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    Sessions Held
                    <Calendar className="text-blue-600" size={20} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-1">
                    {stats.total_sessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total classes held
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    Last Session
                    <Clock className="text-orange-600" size={20} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.last_session ? (
                    <>
                      <p className="text-3xl font-bold mb-1">
                        {stats.last_session.students_present}/
                        {students.length ?? stats.last_session.total_students}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Students present
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        On {formatDate(stats.last_session.date)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No sessions yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>

        {/* Errors */}
        {anyError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {(statsError || studentsError || sessionsError)?.message ??
                "Failed to load attendance data"}
            </AlertDescription>
          </Alert>
        )}

        {/* Student search & list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Student Attendance</h2>
            <Badge variant="outline" className="text-sm">
              {studentsLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                `${students.length} students`
              )}
            </Badge>
          </div>

          <form
            className="flex items-center gap-2 w-full shadow-sm rounded-lg border border-gray-200 bg-background px-4 py-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <Search size={18} className="text-muted-foreground" />
            <Input
              placeholder="Search by name or matric number..."
              className="flex-1 bg-transparent focus:outline-none border-none focus-visible:ring-0 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="space-y-3">
            {studentsLoading ? (
              <StudentSkeleton />
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <Card
                  key={student.student_id}
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-lg">
                          {student.full_name || "Unknown"}
                        </p>
                        <p className="font-medium text-sm text-muted-foreground">
                          {student.matric_no}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.attendance_percentage >= 75 ? (
                          <CheckCircle2 className="text-green-600" size={24} />
                        ) : (
                          <XCircle className="text-red-600" size={24} />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {student.total_attended} / {student.total_sessions}{" "}
                          classes
                        </p>
                        <p className="text-xs font-semibold">
                          {student.attendance_percentage}%
                        </p>
                      </div>
                      <Progress
                        className="h-3"
                        value={student.attendance_percentage}
                      />
                    </div>

                    {student.last_attended && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last attended: {formatDate(student.last_attended)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-10">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UserX className="h-10 w-10 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>
                        {search ? "No Students Found" : "No Attendance Data"}
                      </EmptyTitle>
                      <EmptyDescription>
                        {search
                          ? "No students match your search criteria. Try a different name or matric number."
                          : "This course has no student attendance records yet."}
                      </EmptyDescription>
                    </EmptyHeader>
                    {!search && (
                      <EmptyContent>
                        <Button
                          onClick={() => router.push(`/lecturer/dashboard`)}
                        >
                          {" "}
                          Go Back to Dashboard
                        </Button>
                      </EmptyContent>
                    )}
                  </Empty>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Past Sessions */}
        <section className="space-y-4 pt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Past Sessions</h2>
            <Badge variant="outline" className="text-sm">
              {sessionsLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                `${sessions.length} sessions`
              )}
            </Badge>
          </div>

          <div className="space-y-3">
            {sessionsLoading ? (
              <SessionSkeleton />
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <Card
                  key={session.id}
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">
                        {formatDate(session.date)}
                      </p>
                      <p className="font-semibold text-sm text-muted-foreground">
                        {formatTime(session.start_time)} -{" "}
                        {formatTime(session.end_time)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {session.students_present}/{session.total_students}{" "}
                          students present
                        </p>
                        <p className="text-xs font-semibold">
                          {session.attendance_percentage}%
                        </p>
                      </div>
                      <Progress
                        className="h-3"
                        value={session.attendance_percentage}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-10">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <CalendarX className="h-10 w-10 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>No Sessions Held</EmptyTitle>
                      <EmptyDescription>
                        There are no past sessions recorded for this course yet.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        onClick={() => router.push(`/lecturer/dashboard`)}
                      >
                        Go Back to Dashboard
                      </Button>
                    </EmptyContent>
                  </Empty>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AttendancePage;
