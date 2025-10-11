"use client";

import { Course } from "@/components/auth/register-admin/schema";
import Loading from "@/components/loading";
import OnboardingForm from "@/components/students/onboardingform";
import { Button } from "@/components/ui/button";
// import { COURSES } from "@/constants";
import { useFetch } from "@/hooks/use-api";
import axiosInstance from "@/lib/axios";
import { Student } from "@/server/types/auth";
import { Search } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

const SelectCoursesPage = () => {
  const queryKey = useMemo(() => ["courses"], []);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const router = useRouter();

  const filteredCourses = debouncedSearchTerm
    ? courses.filter(
        (c) =>
          c.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          c.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    : courses;

  const { data, isLoading, isError } = useFetch<{ courses: Course[] }>(
    queryKey,
    "/courses"
  );

  const onsubmit = async () => {
    try {
      const studentData = localStorage.getItem("student");
      if (!studentData) throw new Error("Student not found");

      const student: Student = JSON.parse(studentData);

      await axiosInstance.post(
        `/courses/register-courses/${student.id}`,
        {
          course_ids: selectedCourses,
        },
        {
          withCredentials: true,
        }
      );
      toast("Successfully registered");
      router.push("/student/dashboard");
    } catch (error) {
      toast.error("Error occured while registering" + (error as Error).message);
    }
  };

  useEffect(() => {
    console.log(data);
    if (data?.courses) {
      setCourses(data.courses);
    }
  }, [data]);

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="h-screen flex flex-col gap-4 items-center justify-center text-center text-slate-500">
        Something went wrong. Please try again later.
        <span>Try refresh</span>
        <Button onClick={() => router.refresh()}>Refresh</Button>
      </div>
    );

  return (
    <div className="min-h-screen max-w-xl relative flex items-center flex-col gap-5 mx-auto py-20 px-5">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-primary mb-4">
          Mark Courses to Register
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-6">
          Select courses corresponding to your department and level
        </p>
        <div>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="Search Course"
              className="w-full flex-1 border-0 focus:ring-0 focus:outline-none focus:border-0 bg-transparent outline-none shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={24} className="text-muted-foreground" />
          </div>
        </div>
      </div>
      <OnboardingForm
        courses={filteredCourses}
        selectedCourseIds={selectedCourses}
        setSelectedCourseIds={setSelectedCourses}
      />

      {selectedCourses.length > 0 && (
        <div className="fixed bottom-5 flex items-center justify-center w-full mx-2 p-5 shadow-md bg-transparent rounded-md backdrop-blur-sm ">
          <Button className="w-full" size="lg" onClick={onsubmit}>
            {/* <Link href="/auth/student/onboarding"> */}
            Continue with {selectedCourses.length} course
            {selectedCourses.length !== 1 ? "s" : ""}
            {/* </Link> */}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectCoursesPage;
