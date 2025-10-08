"use client";
import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/use-api";
import { useCurrentLecturer } from "@/hooks/use-user";
import { sessionsAtom, fetchSessionsAtom } from "@/lib/atoms/session";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Feed } from "@/types/feed";
import { XCircle, LogOut } from "lucide-react";

import { DashboardHeader } from "@/components/lecturer/dashboard-header";
import { CourseCard } from "@/components/lecturer/course-card";
import { CourseCardSkeleton } from "@/components/lecturer/course-card-skeleton";

const Dashboard = () => {
  const router = useRouter();
  const [sessions] = useAtom(sessionsAtom);
  const fetchSessions = useSetAtom(fetchSessionsAtom);

  const { data: lecturer, error, isLoading } = useCurrentLecturer();

  const {
    data: feed,
    error: feedError,
    isLoading: feedLoading,
    refetch: refetchFeed,
  } = useFetch<Feed[]>(["Feed"], "/lecturers/my-feed", {
    withCredentials: true,
  });

  // Fetch active sessions on mount
  useEffect(() => {
    if (lecturer) {
      fetchSessions();
    }
  }, [lecturer, fetchSessions]);

  if (error) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-screen w-full text-center">
        <h1 className="text-2xl font-bold">
          Error Getting The Current Lecturer
        </h1>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => router.refresh()}>Try Again</Button>
      </div>
    );
  }

  if (isLoading) return <Loading />;

  if (!lecturer) {
    return <p className="text-center py-10">No lecturer data found.</p>;
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="absolute -top-14 right-4">
        <Button
          variant="outline"
          size="sm"
          className="flex gap-2 items-center shadow-sm hover:shadow-md transition-all"
        >
          <LogOut size={15} /> Log Out
        </Button>
      </div>

      <DashboardHeader lecturerName={lecturer.full_name} />

      <div className="flex flex-col gap-6">
        {feedLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))
        ) : feedError ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load feed: {feedError.message}
            </AlertDescription>
          </Alert>
        ) : feed && feed.length > 0 ? (
          feed.map((course) => (
            <CourseCard
              key={course.course_id}
              course={course}
              activeSession={sessions.get(course.course_id)}
              refetchFeed={refetchFeed}
            />
          ))
        ) : (
          <div className="p-12 text-center">
            <p className="text-base text-muted-foreground">
              No courses found for this lecturer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
