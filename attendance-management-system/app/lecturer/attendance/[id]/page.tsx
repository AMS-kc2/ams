"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, Search, TrendingUp, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const AttendancePage = () => {

  const [search, setSearch] = useState("")
  const [students, setStudents] = useState([
    {
      surName: "Takin Pelumi", 
      matricNo: "24/47LS/2735", 
      attend: true, 
      noAttended: 19

    }
  ])

  const {id} = useParams()
  const router = useRouter()
  

  console.log("id: ", id)
  return (
    <div className="relative w-full">
      <div className="absolute -top-14 left-0">
        <Button
          onClick={() => {
            router.push("/lecturer/dashboard");
          }}
          variant="ghost"
          className="cursor-pointer"
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </Button>
      </div>
      <main className="p-10 space-y-15 w-full">
        <h1 className="text-2xl font-bold mb-6">Students Attendance</h1>
        <section className="space-y-5 w-full">
          <div className="rounded-lg border border-gray-200 space-y-5 p-5 w-full">
            <h4 className="text-lg font-bold">Total student</h4>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold">572</p>
              <Users />
            </div>
            <p className="text-sm font-light">Enrolled in course</p>
          </div>

          <div className="rounded-lg border border-gray-200 space-y-5 p-5 w-full">
            <h4 className="text-lg font-bold">Overall Attendance</h4>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold">87%</p>
              <TrendingUp />
            </div>
            <p className="text-sm font-light">Average across all student</p>
          </div>

          <div className="rounded-lg border border-gray-200 space-y-5 p-5 w-full">
            <h4 className="text-lg font-bold">Classes Held</h4>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold">26</p>
              <Calendar />
            </div>
            <p className="text-sm font-light">Out of 30 classes held</p>
          </div>

          <div className="rounded-lg border border-gray-200 space-y-5 p-5 w-full">
            <h4 className="text-lg font-bold">Last session</h4>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold">475/576</p>
              <Users />
            </div>
            <p className="text-sm font-light">Students present</p>
          </div>
        </section>
        <section className="space-y-3">
          <form
            className="flex items-center gap-2 w-[calc(100%-30px)] mx-auto shadow-xs transition-[color,box-shadow] rounded-md border border-gray-100 px-4 py-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (!search.trim()) return;
              alert("search: " + search);
            }}
          >
            <Input
              placeholder="Search"
              className="flex-1 bg-transparent focus:outline-none border-none focus-visible:ring-0 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="ghost" className="cursor-pointer text-black">
              <Search size={15} className="font-extralight text-2xl mr-2" />
            </Button>
          </form>
          {students.length > 0 && (
            <div className="rounded-lg border border-gray-200 space-y-5 p-5 w-full">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2 items-center justify-center">
                  <p className="font-semibold">{students[0].matricNo}</p>
                  <p className="font-semibold text-sm">{students[0].surName}</p>
                </div>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full bg-gray-300",
                    students[0].attend && "bg-primary"
                  )}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-light">
                    {students[0].noAttended} / 29 classes
                  </p>
                  <p className="text-xs font-light">
                    {Math.round((students[0].noAttended / 29) * 100)}%
                  </p>
                </div>
                <Progress
                  className="h-4"
                  value={Math.round((students[0].noAttended / 29) * 100)}
                />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-5 w-full pt-5">
          <h3 className="text-xl font-bold">Past Sessions</h3>
          <div className="rounded-lg border border-gray-200 space-y-5 p-5 w-full">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Yesterday</p>
              <p className="font-semibold text-sm">8 - 10:30 am</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-light">475/576</p>
                <p className="text-xs font-light">5%</p>
              </div>
              <Progress className="h-4" value={92} />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 space-y-5 p-5 w-full">
            <div className="flex items-center justify-between">
              <p className="font-semibold">3 days ago</p>
              <p className="font-semibold text-sm">7 - 9:30 am</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-light">300/576</p>
                <p className="text-xs font-light">65%</p>
              </div>
              <Progress className="h-4" value={65} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AttendancePage;
