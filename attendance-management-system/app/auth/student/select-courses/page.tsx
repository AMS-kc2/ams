"use client";

import OnboardingForm from "@/components/students/onboardingform";
import { Button } from "@/components/ui/button";
import { COURSES } from "@/constants";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";

const SelectCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Setup debounced search term if needed for performance optimization
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  //setup the filtered courses based on the search term
  const filteredCourses = debouncedSearchTerm
    ? COURSES.filter((course) =>
        course.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    : COURSES;

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
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
      />

      {selectedCourses.length > 0 && (
        <div className="fixed bottom-5 flex items-center justify-center w-full mx-2 p-5 shadow-md bg-transparent rounded-md backdrop-blur-sm ">
          <Button className="w-full" size="lg" asChild>
            <Link href="/auth/student/onboarding">
              Continue with {selectedCourses.length} course
              {selectedCourses.length !== 1 ? "s" : ""}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectCoursesPage;
