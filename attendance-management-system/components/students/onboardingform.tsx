import { Button } from "@/components/ui/button";
import { COURSES } from "@/constants";
import { CircleMinus, CirclePlus, Frown } from "lucide-react";
import React from "react";

// Context to avoid prop drilling
const CourseSelectionContext = React.createContext<{
  selectedCourses: string[];
  toggleCourse: (course: string) => void;
  isSelected: (course: string) => boolean;
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
  selectedCourses,
  setSelectedCourses,
}: {
  courses: string[];
  selectedCourses: string[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const toggleCourse = React.useCallback((course: string) => {
    setSelectedCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  }, []);

  const isSelected = React.useCallback(
    (course: string) => selectedCourses.includes(course),
    [selectedCourses]
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
      value={{ selectedCourses, toggleCourse, isSelected }}
    >
      <div className="w-full p-5 space-y-3 mb-10">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Select Your Courses</h2>
          <p className="text-sm text-muted-foreground">
            Choose the courses you'd like to Enroll in{" "}
            <b>({COURSES.length} total)</b>
          </p>
        </div>

        <div className="space-y-3">
          {courses.map((course) => (
            <CourseInput key={course} course={course} />
          ))}
        </div>
      </div>

      {selectedCourses.length > 0 && (
        <div className="w-full p-5 space-y-3 mb-15">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Selected Courses</h2>
            <p className="text-sm text-muted-foreground">
              Drop the course(s) from <b>({selectedCourses.length} Enroled)</b>
            </p>
          </div>

          <div className="space-y-3">
            {selectedCourses.map((course) => (
              <CourseInput key={course} course={course} />
            ))}
          </div>
        </div>
      )}
    </CourseSelectionContext.Provider>
  );
};

const CourseInput = ({ course }: { course: string }) => {
  const { toggleCourse, isSelected } = useCourseSelection();
  const selected = isSelected(course);

  return (
    <div
      className={`
      flex p-4 border rounded-xl justify-between items-center transition-all duration-200
      ${selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
        }
    `}
    >
      <div className="flex-1">
        <span className="text-base font-medium text-foreground">{course}</span>
        {selected && (
          <div className="text-xs text-primary font-medium mt-1">Selected</div>
        )}
      </div>

      <Button
        variant={selected ? "default" : "outline"}
        size="sm"
        className="rounded-full w-10 h-10 p-0 transition-all duration-200"
        onClick={() => toggleCourse(course)}
        aria-label={selected ? `Remove ${course}` : `Add ${course}`}
      >
        {selected ? <CircleMinus size={20} /> : <CirclePlus size={20} />}
      </Button>
    </div>
  );
};

export default OnboardingForm;
