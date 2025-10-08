import { Button } from "@/components/ui/button";
import { CircleMinus, CirclePlus, Frown } from "lucide-react";
import React from "react";
import { Course } from "@/components/auth/register-admin/schema";

// Context to avoid prop drilling
const CourseSelectionContext = React.createContext<{
  selectedCourseIds: string[];
  toggleCourse: (courseId: string) => void;
  isSelected: (courseId: string) => boolean;
} | null>(null);

const useCourseSelection = () => {
  const context = React.useContext(CourseSelectionContext);
  if (!context) {
    throw new Error(
      "useCourseSelection must be used within CourseSelectionProvider"
    );
  }
  return context;
};

const OnboardingForm = ({
  courses,
  selectedCourseIds,
  setSelectedCourseIds,
}: {
  courses: Course[];
  selectedCourseIds: string[];
  setSelectedCourseIds: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const toggleCourse = React.useCallback(
    (courseId: string) => {
      setSelectedCourseIds((prev) =>
        prev.includes(courseId)
          ? prev.filter((id) => id !== courseId)
          : [...prev, courseId]
      );
    },
    [setSelectedCourseIds]
  );

  const isSelected = React.useCallback(
    (courseId: string) => selectedCourseIds.includes(courseId),
    [selectedCourseIds]
  );

  // Split courses into selected and unselected
  const selectedCourses = courses.filter((course) =>
    selectedCourseIds.includes(course.id)
  );
  const unselectedCourses = courses.filter(
    (course) => !selectedCourseIds.includes(course.id)
  );

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 w-full p-8 text-center">
        <Frown size={80} className="text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-xl font-semibold text-foreground">
            No courses found
          </p>
          <p className="text-sm text-muted-foreground max-w-md">
            We couldn&apos;t find any courses matching your criteria. Try
            adjusting your search or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CourseSelectionContext.Provider
      value={{ selectedCourseIds, toggleCourse, isSelected }}
    >
      <div className="w-full p-5 space-y-3 mb-10">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Select Your Courses</h2>
          <p className="text-sm text-muted-foreground">
            Choose the courses you&apos;d like to Enroll in{" "}
            <b>({courses.length} total)</b>
          </p>
        </div>

        <div className="space-y-3">
          {unselectedCourses.map((course) => (
            <CourseInput key={course.id} course={course} />
          ))}
        </div>
      </div>

      {selectedCourses.length > 0 && (
        <div className="w-full p-5 space-y-3 mb-15">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Selected Courses</h2>
            <p className="text-sm text-muted-foreground">
              Drop the course(s) from <b>({selectedCourses.length} Enrolled)</b>
            </p>
          </div>

          <div className="space-y-3">
            {selectedCourses.map((course) => (
              <CourseInput key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}
    </CourseSelectionContext.Provider>
  );
};

const CourseInput = ({ course }: { course: Course }) => {
  const { toggleCourse, isSelected } = useCourseSelection();
  const selected = isSelected(course.id);

  return (
    <div
      className={`
      flex p-4 border rounded-xl justify-between items-center transition-all duration-200
      ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
      }
    `}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-semibold text-foreground">
            {course.code}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            Level {course.level}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {course.semester} Semester
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{course.title}</p>
        {selected && (
          <div className="text-xs text-primary font-medium mt-1">Selected</div>
        )}
      </div>

      <Button
        variant={selected ? "default" : "outline"}
        size="sm"
        className="rounded-full w-10 h-10 p-0 transition-all duration-200"
        onClick={() => toggleCourse(course.id)}
        aria-label={selected ? `Remove ${course.code}` : `Add ${course.code}`}
      >
        {selected ? <CircleMinus size={20} /> : <CirclePlus size={20} />}
      </Button>
    </div>
  );
};

export default OnboardingForm;
