import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { COURSES } from "@/constants";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const StudentDashboard = () => {
  return (
    <div className="p-2 flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-primary mb-8">KCS.2.0</h1>

      <div className="mb-10">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800">
            Welcome back, <span className="text-primary">Joseph!</span>
          </h2>
          <div className="inline-flex items-center justify-center gap-2 text-sm text-gray-800">
            <span className="font-medium">Level 100</span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
            <span className="font-medium">KCS/1001/2020</span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
            <span>2nd Semester</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {
          COURSES.map((course, index) => (
            <Link href={`/student/course/${index + 1}`} key={index}>
            <Card className="border-2 border-gray-200 hover:border-primary transition-colors p-0 gap-0">
              <CardContent className="p-0">
                <Image 
                src="/course-img.png"
                alt="Course Image"
                width={400}
                height={300}
                className="w-full object-cover rounded-md"
                />
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 flex items-center justify-between rounded-b-md">
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-800">
                    KWASU {" "}
                    {course.split(' ')[0].slice(0,3)} {" "}{course.split(' ')[0].slice(3)}</p>
                  <p className="text-sm text-gray-600">{course}</p>
                </div>
                <div className="text-sm text-gray-600 space-x-3">
                50% Attendance
                <ArrowRight className="inline-block ml-1 text-primary" />
                </div>
              </CardFooter>
            </Card>
            </Link>
          ))
        }
      </div>
    </div>
  )
}
export default StudentDashboard;
