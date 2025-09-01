"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { COURSES } from "@/constants";
import { Label } from "@radix-ui/react-label";
import { ArrowRight, ChevronLeft, CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CoursePage = () => {
  const [signInOtp, setSignInOtp] = useState("");
  const [signOutOtp, setSignOutOtp] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter()


  const handleSignIn = async () => {
    try {
      if (
        !signInOtp ||
        signInOtp.trim() === "" ||
        signInOtp.trim().length === 0
      ) {
        throw new Error("Please enter your OTP");
      }

      if (signInOtp.length !== 6) {
        throw new Error("Invalid OTP");
      }

      console.log(signInOtp);

      if (signInOtp === "123456") {
        setSuccess(true);
        setSignInOtp("");
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (err) {
      console.log(err);

      toast.error("Sign In Failed", {
        description: (err as Error).message,
        position: "top-center", // or "bottom-center", "top-right", etc.
        cancel: { label: "Dismiss", onClick: () => {} }, // adds a cancel button
        duration: 5000,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      if (
        !signOutOtp ||
        signOutOtp.trim() === "" ||
        signOutOtp.trim().length === 0
      ) {
        throw new Error("Please enter your OTP");
      }

      if (signOutOtp.length !== 6) {
        throw new Error("Invalid OTP");
      }

      console.log(signOutOtp);

      if (signOutOtp === "123456") {
        setSuccess(true);
        setSignOutOtp("");
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (err) {
      console.log(err);

      toast.error("Sign Out Failed", {
        description: (err as Error).message,
        position: "top-center",
        // cancel: { label: "Dismiss", onClick: () => {} },
        duration: 5000,
        richColors: true,
        closeButton: true,
      });
    }
  };



  const id =  useParams().id
  const course = COURSES[parseInt(id as string) -1 ]
  console.log(id, course);

  if(success){
    return (
      <div className="space-y-10 px-5 relative">
        <div className="absolute -top-8 left-5">
          <Button size={"sm"} variant="ghost" onClick={() => router.back()}>
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-6">
          <CircleCheckBig size={40} className="text-primary" />
          <p className="text-2xl font-bold text-center text-primary">
            Attendance Marked Successfully
          </p>
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          {[
            ["Name", "Joseph Adeniyi"],
            ["Matric No", "24/47xls/2632"],
            ["Course", "KWASU LIS 116"],
            ["Time Signed In", "8:03am"],
            ["Date", "Aug 12, 2025"],
          ].map((item, index) => (
            <div
              className="flex items-center justify-between border-b-2 border-gray-200 py-4"
              key={index}
            >
              <p className="text-sm text-gray-600">{item[0]}</p>
              <p className="text-sm">{item[1]}</p>
            </div>
          ))}
        </div>
        <div className="w-full space-y-15 max-w-md mx-auto">
          <div className="bg-primary/30 p-4 rounded-md text-center">
            <p className="text-sm text-primary text-balance">Remember : 80% attendance is required to qualify for exams</p>
          </div>
          <div className="px-5 flex items-center justification-center">
            <Button
              size={"lg"}
              onClick={() => setSuccess(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 x-5">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <p className="text-2xl font-bold text-center text-primary">
            KWASU {course.split(" — ")[0].slice(0, 3)}{" "}
            {course.split(" ")[0].slice(3)}
          </p>
          <span className="w-2 h-2 bg-black rounded-full"></span>
          <span className="font-medium text-center">
            {course.split(" — ")[1]}
          </span>
        </div>
        <p className="text-sm text-gray-600 flex gap-3 items-center">
          <span>Lwvel 100</span>
          <span className="w-1 h-1 bg-black rounded-full"></span>
          <span>2nd Semester</span>
        </p>
      </div>

      {/* Attendance Forms */}
      {/* Sign IN */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="space-y-2">
            <h1 className="font-semibold">Mark today's Attendance</h1>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="attendance"
                className="p-2 w-5 h-5 border border-gray-300 rounded-full checked:bg-primary checked:border-primary"
                id="present"
              />
              <Label htmlFor="present"> Present </Label>
            </div>
            <div className="flex items-center px-4">
              <Input
                type="text"
                placeholder="(Enter Lecturer's OTP)"
                className="mx-4"
                value={signInOtp}
                onChange={(e) => setSignInOtp(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-primary mt-4"
              size={"lg"}
              onClick={handleSignIn}
            >
              SIgn In
            </Button>
          </div>
        </Card>

        {/* Sign Out */}
        <Card className="p-4">
          <div className="space-y-2">
            <h1 className="font-semibold">Sign out of the class</h1>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="log out"
                className="p-2 w-5 h-5 border border-gray-300 rounded-full checked:bg-primary checked:border-primary"
                id="log out"
              />
              <Label htmlFor="log out"> Present </Label>
            </div>
            <div className="flex items-center px-4">
              <Input
                type="text"
                placeholder="(Enter Lecturer's OTP)"
                className="mx-4"
                value={signOutOtp}
                onChange={(e) => setSignOutOtp(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-primary mt-4"
              size={"lg"}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-semibold">Previous Attendance</p>
          <div className="flex items-center justify-between mt-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">25th October, 2025 </p>
              <p className="text-xs text-gray-400">
                sign in: 8:20 | sign out: 10:01
              </p>
            </div>
            <p className="text-sm">Present</p>
          </div>
          <div className="text-center mt-4">
            <Link href="#" className="text-primary font-medium">
              see All <ArrowRight className="inline-block ml-1" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CoursePage;

{
  /* 
  import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
  export function DialogDemo({title}: {title: string}) {
  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary mt-4" size={"lg"}>
            {title}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
} */
}
