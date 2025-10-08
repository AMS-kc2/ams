// "use client";

// import Loading from "@/components/loading";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { useFetch } from "@/hooks/use-api";
// import {
//   attendanceAtom,
//   signInAtom,
//   signOutAtom,
// } from "@/lib/atoms/attendance";
// import { Label } from "@radix-ui/react-label";
// import { useAtom } from "jotai";
// import { ArrowRight, ChevronLeft, CircleCheckBig } from "lucide-react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import { toast } from "sonner";

// type course = {
//   code: string;
//   created_at: string | null;
//   id: number;
//   level: string;
//   semester: string;
//   title: string;
// };

// type Attendance = {
//   course_id: number;
//   id: number;
//   session_id: number;
//   status: string | null;
//   student_id: number;
//   verified_at: string | null;
// };

// type payload = course & { attendances: Attendance[] };

// const CoursePage = () => {
//   const id = useParams().id as string;
//   const router = useRouter();

//   const [signInOtp, setSignInOtp] = useState("");
//   const [signOutOtp, setSignOutOtp] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [isSigningIn, setIsSigningIn] = useState(false);
//   const [isSigningOut, setIsSigningOut] = useState(false);

//   const [{ currentAttendance, isSignedIn }] = useAtom(attendanceAtom);
//   const [, signIn] = useAtom(signInAtom);
//   const [, signOut] = useAtom(signOutAtom);

//   const {
//     data: course,
//     isLoading,
//     error,
//   } = useFetch<payload>(["course", id], `/courses/${id}`);
//   console.log(course);

//   if (isLoading) return <Loading />;
//   if (error) return <p>Error: {error.message}</p>;
//   if (!course) return <p>No data found</p>;

//   const attendances = course.attendances ?? [];

//   const handleSignIn = async () => {
//     try {
//       if (!signInOtp || signInOtp.trim().length === 0) {
//         throw new Error("Please enter your OTP");
//       }

//       if (signInOtp.length !== 6) {
//         throw new Error("OTP must be 6 digits");
//       }

//       setIsSigningIn(true);

//       // Call signIn with OTP verification
//       await signIn({
//         otp: signInOtp,
//         courseId: course.id,
//         sessionId: 1, // You'll need to get the actual session ID
//         studentId: 1, // You'll need to get the actual student ID from auth context
//       });

//       setSuccess(true);
//       setSignInOtp("");

//       toast.success("Signed In Successfully", {
//         description: "Your attendance has been marked",
//         position: "top-center",
//         duration: 3000,
//       });
//     } catch (err) {
//       console.warn(err);

//       toast.error("Sign In Failed", {
//         description: (err as Error).message || "Invalid OTP",
//         position: "top-center",
//         cancel: { label: "Dismiss", onClick: () => {} },
//         duration: 5000,
//       });
//     } finally {
//       setIsSigningIn(false);
//     }
//   };

//   const handleSignOut = async () => {
//     try {
//       if (!isSignedIn) {
//         throw new Error("You must sign in first before signing out");
//       }

//       if (!signOutOtp || signOutOtp.trim().length === 0) {
//         throw new Error("Please enter your OTP");
//       }

//       if (signOutOtp.length !== 6) {
//         throw new Error("OTP must be 6 digits");
//       }

//       setIsSigningOut(true);

//       // Call signOut with OTP verification
//       await signOut({
//         otp: signOutOtp,
//       });

//       setSuccess(true);
//       setSignOutOtp("");

//       toast.success("Signed Out Successfully", {
//         description: "Your attendance has been submitted",
//         position: "top-center",
//         duration: 3000,
//       });
//     } catch (err) {
//       console.warn(err);

//       toast.error("Sign Out Failed", {
//         description: (err as Error).message || "Invalid OTP",
//         position: "top-center",
//         duration: 5000,
//         richColors: true,
//         closeButton: true,
//       });
//     } finally {
//       setIsSigningOut(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="space-y-10 px-5 relative">
//         <div className="absolute -top-8 left-5">
//           <Button size={"sm"} variant="ghost" onClick={() => router.back()}>
//             <ChevronLeft size={16} className="mr-1" /> Back
//           </Button>
//         </div>

//         <div className="flex flex-col items-center justify-center gap-6">
//           <CircleCheckBig size={40} className="text-primary" />
//           <p className="text-2xl font-bold text-center text-primary">
//             Attendance Marked Successfully
//           </p>
//         </div>

//         <div className="space-y-2 max-w-md mx-auto">
//           {[
//             ["Name", "Joseph Adeniyi"],
//             ["Matric No", "24/47xls/2632"],
//             ["Course", `KWASU ${course.code}`],
//             [
//               "Time Signed In",
//               currentAttendance?.signInTime
//                 ? new Date(currentAttendance.signInTime).toLocaleTimeString()
//                 : "N/A",
//             ],
//             ["Date", new Date().toLocaleDateString()],
//           ].map((item, index) => (
//             <div
//               className="flex items-center justify-between border-b-2 border-gray-200 py-4"
//               key={index}
//             >
//               <p className="text-sm text-gray-600">{item[0]}</p>
//               <p className="text-sm">{item[1]}</p>
//             </div>
//           ))}
//         </div>

//         <div className="w-full space-y-15 max-w-md mx-auto">
//           <div className="bg-primary/30 p-4 rounded-md text-center">
//             <p className="text-sm text-primary text-balance">
//               Remember : 80% attendance is required to qualify for exams
//             </p>
//           </div>
//           <div className="px-5 flex items-center justify-center">
//             <Button
//               size={"lg"}
//               onClick={() => setSuccess(false)}
//               className="w-full"
//             >
//               Done
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 px-5">
//       <div className="space-y-2">
//         <div className="flex items-center space-x-2">
//           <p className="text-2xl font-bold text-center text-primary">
//             KWASU {course.code} {course.title.split(" — ")[0]}
//           </p>
//           <span className="w-2 h-2 bg-black rounded-full"></span>
//           <span className="font-medium text-center">
//             {course.title.split(" — ")[1] || ""}
//           </span>
//         </div>
//         <p className="text-sm text-gray-600 flex gap-3 items-center">
//           <span>Level {course.level}</span>
//           <span className="w-1 h-1 bg-black rounded-full"></span>
//           <span>{course.semester} Semester</span>
//         </p>
//       </div>

//       {/* Attendance Forms */}
//       <div className="space-y-4">
//         {/* Sign IN */}
//         <Card className="p-4">
//           <div className="space-y-2">
//             <h1 className="font-semibold">Mark today&apos;s Attendance</h1>
//             <div className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="attendance"
//                 className="p-2 w-5 h-5 border border-gray-300 rounded-full checked:bg-primary checked:border-primary"
//                 id="present"
//                 checked={isSignedIn}
//                 disabled
//               />
//               <Label htmlFor="present"> Present </Label>
//             </div>
//             <div className="flex items-center px-4">
//               <Input
//                 type="text"
//                 placeholder="(Enter Lecturer's OTP)"
//                 className="mx-4"
//                 value={signInOtp}
//                 onChange={(e) => setSignInOtp(e.target.value)}
//                 disabled={isSignedIn || isSigningIn}
//                 maxLength={6}
//               />
//             </div>
//             <Button
//               className="w-full bg-primary mt-4"
//               size={"lg"}
//               onClick={handleSignIn}
//               disabled={isSignedIn || isSigningIn}
//             >
//               {isSigningIn
//                 ? "Signing In..."
//                 : isSignedIn
//                 ? "Already Signed In"
//                 : "Sign In"}
//             </Button>
//           </div>
//         </Card>

//         {/* Sign Out */}
//         <Card className="p-4">
//           <div className="space-y-2">
//             <h1 className="font-semibold">Sign out of the class</h1>
//             <div className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="log out"
//                 className="p-2 w-5 h-5 border border-gray-300 rounded-full checked:bg-primary checked:border-primary"
//                 id="log out"
//                 checked={!isSignedIn}
//                 disabled
//               />
//               <Label htmlFor="log out"> Present </Label>
//             </div>
//             <div className="flex items-center px-4">
//               <Input
//                 type="text"
//                 placeholder="(Enter Lecturer's OTP)"
//                 className="mx-4"
//                 value={signOutOtp}
//                 onChange={(e) => setSignOutOtp(e.target.value)}
//                 disabled={!isSignedIn || isSigningOut}
//                 maxLength={6}
//               />
//             </div>

//             <Button
//               className="w-full bg-primary mt-4"
//               size={"lg"}
//               onClick={handleSignOut}
//               disabled={!isSignedIn || isSigningOut}
//             >
//               {isSigningOut
//                 ? "Signing Out..."
//                 : !isSignedIn
//                 ? "Sign In First"
//                 : "Sign Out"}
//             </Button>
//           </div>
//         </Card>

//         <Card className="p-4">
//           <p className="font-semibold">Previous Attendance</p>
//           {attendances.length > 0 ? (
//             attendances.slice(0, 3).map((attendance) => (
//               <div
//                 key={attendance.id}
//                 className="flex items-center justify-between mt-4"
//               >
//                 <div className="space-y-1">
//                   <p className="text-sm text-gray-600">
//                     {attendance.verified_at
//                       ? new Date(attendance.verified_at).toLocaleDateString()
//                       : "N/A"}
//                   </p>
//                   <p className="text-xs text-gray-400">
//                     sign in:{" "}
//                     {attendance.verified_at
//                       ? new Date(attendance.verified_at).toLocaleTimeString()
//                       : "N/A"}
//                   </p>
//                 </div>
//                 <p className="text-sm">{attendance.status || "Present"}</p>
//               </div>
//             ))
//           ) : (
//             <p className="text-sm text-gray-500 mt-4">
//               No previous attendance records
//             </p>
//           )}
//           <div className="text-center mt-4">
//             <Link href="#" className="text-primary font-medium">
//               see All <ArrowRight className="inline-block ml-1" />
//             </Link>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default CoursePage;

"use client";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardContent, CardHeader, CardTitle
import { Input } from "@/components/ui/input";
import { useFetch } from "@/hooks/use-api";
import {
  attendanceAtom,
  signInAtom,
  signOutAtom,
} from "@/lib/atoms/attendance";
import { useAtom } from "jotai";
import {
  ArrowRight,
  ChevronLeft,
  CircleCheckBig,
  Clock, // Added Clock for time
  Calendar, // Added Calendar for dates
  User, // Added User for student info
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useCurrentStudent } from "@/hooks/use-user";

// Types (Keep as is)
type course = {
  code: string;
  created_at: string | null;
  id: number;
  level: string;
  semester: string;
  title: string;
};

type Attendance = {
  course_id: number;
  id: number;
  session_id: number;
  status: string | null;
  student_id: number;
  verified_at: string | null;
};

type payload = course & { attendances: Attendance[] };

const CoursePage = () => {
  const id = useParams().id as string;
  const router = useRouter();

  // Unified OTP state, will be used for both Sign In and Sign Out
  const [otp, setOtp] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [{ currentAttendance, isSignedIn }] = useAtom(attendanceAtom);
  const [, signIn] = useAtom(signInAtom);
  const [, signOut] = useAtom(signOutAtom);

  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
  } = useCurrentStudent();
  const {
    data: course,
    isLoading,
    error,
  } = useFetch<payload>(["course", id], `/courses/${id}`);

  if (isLoading || studentLoading) return <Loading />;
  if (error || studentError)
    return <p>Error: {(error || studentError)?.message}</p>;
  if (!course) return <p>No data found</p>;

  const attendances = course.attendances ?? [];

  if (!student) {
    return router.push("/auth/student/log-in");
  }

  // // Helper to extract course part and title part
  // const [course.code courseDescriptionPart] = course.title.includes(" — ")
  //   ? course.title.split(" — ")
  //   : [course.title, ""];

  // // --- Attendance Handlers (Minimalist: one input, dynamic action) ---

  const handleAttendanceAction = async () => {
    try {
      if (!otp || otp.trim().length === 0) {
        throw new Error("Please enter the 6-digit OTP.");
      }

      if (otp.length !== 6) {
        throw new Error("OTP must be 6 digits.");
      }

      if (isSignedIn) {
        // Sign Out Logic
        setIsSigningOut(true);
        await signOut({ otp });
        toast.success("Signed Out Successfully", {
          description: "Your attendance for this session has been finalized.",
          position: "top-center",
          duration: 3000,
        });
      } else {
        // Sign In Logic
        setIsSigningIn(true);
        await signIn({
          otp: otp,
          courseId: course.id,
          studentId: student.id,
        });
        toast.success("Signed In Successfully", {
          description: "You are now marked present for this session.",
          position: "top-center",
          duration: 3000,
        });
      }

      setSuccess(true);
      setOtp("");
    } catch (err) {
      console.warn(err);
      toast.error(isSignedIn ? "Sign Out Failed" : "Sign In Failed", {
        description: (err as Error).message || "Invalid OTP or action failed.",
        position: "top-center",
        duration: 5000,
        richColors: true,
      });
    } finally {
      setIsSigningIn(false);
      setIsSigningOut(false);
    }
  };

  // --- Success State UI (Keep logic, improve styling) ---

  if (success) {
    return (
      <div className="space-y-10 px-5 relative min-h-screen pt-12 flex flex-col justify-center">
        <div className="absolute top-0 left-0 p-5">
          <Button
            size={"sm"}
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground"
          >
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-6">
          <CircleCheckBig size={48} className="text-primary animate-pulse" />
          <p className="text-3xl font-extrabold text-center text-primary/90 tracking-tight">
            Attendance Marked!
          </p>
        </div>

        <Card className="max-w-md mx-auto w-full p-4 shadow-xl border-t-4 border-primary/70">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-semibold text-center">
              {course.code}: {course.code}
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0 pt-4 space-y-3">
            {[
              [
                "Student",
                "Joseph Adeniyi (24/47xls/2632)",
                <User size={16} className="text-muted-foreground" key="user" />,
              ],
              [
                "Status Time",
                currentAttendance?.signInTime
                  ? new Date(currentAttendance.signInTime).toLocaleTimeString()
                  : "N/A",
                <Clock
                  size={16}
                  className="text-muted-foreground"
                  key="clock"
                />,
              ],
              [
                "Date",
                new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
                <Calendar
                  size={16}
                  className="text-muted-foreground"
                  key="cal"
                />,
              ],
            ].map((item, index) => (
              <div
                className="flex items-center justify-between py-2 border-b last:border-b-0"
                key={index}
              >
                <div className="flex items-center gap-2">
                  {item[2]}
                  <p className="text-sm text-muted-foreground font-medium">
                    {item[0]}
                  </p>
                </div>
                <p className="text-sm font-semibold text-right">{item[1]}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="w-full space-y-6 max-w-md mx-auto">
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-sm text-primary font-medium">
              Reminder: **80%** attendance is required to qualify for exams.
            </p>
          </div>
          <div className="px-5 flex items-center justify-center">
            <Button
              size={"lg"}
              onClick={() => setSuccess(false)}
              className="w-full shadow-lg"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Attendance UI (Minimalist Refactor) ---

  const actionText = isSignedIn ? "Sign Out" : "Sign In";

  const buttonText = isSigningIn
    ? "Signing In..."
    : isSigningOut
    ? "Signing Out..."
    : isSignedIn
    ? "Sign Out Session"
    : "Sign In Session";

  const isDisabled = isSigningIn || isSigningOut;

  return (
    <div className="space-y-10 px-5 pt-12 max-w-lg mx-auto">
      {/* Back Button */}
      <div className="absolute top-0 left-0 p-5">
        <Button
          size={"sm"}
          variant="ghost"
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          <ChevronLeft size={16} className="mr-1" /> Back
        </Button>
      </div>

      {/* Header - Minimalist and Clean */}
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-extrabold text-primary/90 tracking-tighter">
          {course.code}
        </h1>
        <p className="text-xl font-semibold text-gray-800">{course.code}</p>
        <div className="flex items-center justify-center text-sm text-muted-foreground gap-2 mt-2">
          <span>{course.level} Level</span>
          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
          <span>{course.semester} Semester</span>
        </div>
      </div>

      {/* Main Action Card (Unified Sign In/Out) */}
      <Card className="p-6 shadow-2xl border-t-4 border-primary/80">
        <CardHeader className="p-0 space-y-2 mb-4">
          <CardTitle className="text-2xl font-bold text-center">
            {actionText} Attendance
          </CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Enter the 6-digit OTP provided by the lecturer.
          </p>
          <div
            className={`p-2 rounded-md font-medium text-sm text-center ${
              isSignedIn
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Status: **{isSignedIn ? "SIGNED IN" : "SIGNED OUT"}**
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          <Input
            type="text"
            placeholder="Enter OTP (6 digits)"
            className="text-center text-lg h-12 tracking-[.25em]" // Highlighting the input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))} // Ensure only numbers
            disabled={isDisabled}
            maxLength={6}
            inputMode="numeric"
          />

          <Button
            className="w-full shadow-lg h-12 text-lg"
            onClick={handleAttendanceAction}
            disabled={isDisabled || otp.length < 6}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Attendance - Minimalist List */}
      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Recent Sessions
        </h2>
        {attendances.length > 0 ? (
          <div className="space-y-3">
            {attendances.slice(0, 3).map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar size={14} />
                    {attendance.verified_at
                      ? new Date(attendance.verified_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 pl-4 flex items-center gap-2">
                    <Clock size={12} />
                    {attendance.verified_at
                      ? new Date(attendance.verified_at).toLocaleTimeString()
                      : "N/A"}
                  </p>
                </div>
                <div
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    attendance.status === "Present" || !attendance.status
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {attendance.status || "Present"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            No previous attendance records found.
          </p>
        )}
        <div className="text-center mt-6">
          <Link
            href="#"
            className="text-primary font-medium text-sm inline-flex items-center hover:underline"
          >
            View All History{" "}
            <ArrowRight className="inline-block ml-1 h-4 w-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default CoursePage;
