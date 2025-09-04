"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const SignUpPage = () => {
  // const [steps, setSteps] = React.useState<"choose" | "register">("choose");
  const [role, setRole] = React.useState<"student" | "lecturer" | null>(null);

  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-between p-20">
      <h1 className="text-2xl font-bold text-primary">Choose Your Role</h1>
      <div className="flex gap-5">
        <div className="flex flex-col items-center">
          <Image
            src="/student-avatar.png"
            alt="Student"
            width={100}
            height={100}
          />
          <h2 className="text-2xl font-semibold text-center mt-4">Student</h2>
          <p className="text-center mt-1 font-light text-xs text-balance">
            Register as a student to track your attendance and manage your
            classes.
          </p>
          <div
            className={cn(
              "rounded-full bg-gray-500 mt-5 w-8 h-8",

              role === "student" && "bg-primary"
            )}
            onClick={() => setRole("student")}
          />
        </div>

        <div className="relative flex flex-col items-center">
          <Image
            src="/lecturer-avatar.png"
            alt="lecturer"
            width={100}
            height={100}
          />
          <h2 className="text-2xl font-semibold text-center mt-2">Lecturer</h2>

          <p className="text-center mt-1 font-light text-xs text-balance">
            Register as a lecturer to manage your classes and track student
            attendance.
          </p>
          <div
            className={cn(
              "rounded-full bg-gray-500 mt-5 w-8 h-8",

              role === "lecturer" && "bg-primary"
            )}
            onClick={() => setRole("lecturer")}
          />
          <Image
            src="/lecturer-book.png"
            alt="book"
            width={40}
            height={40}
            className="absolute top-25 -right-8 animate-bounce"
          />
        </div>

        {/* <div>
          <Button
            size={"lg"}
            className="w-full"
            asChild
            aria-label="Continue"
            onClick={() => setSteps("register")}
          >
            Continue
          </Button>
        </div> */}
      </div>
      <div>
        <Button
          size={"lg"}
          className="w-full"
          onClick={() => {
            if (role === "student") {
              router.push("/auth/student/sign-up");
            }

            if (role === "lecturer") {
              router.push("/auth/lecturer/sign-up");
            }
          }}
          aria-label="Continue"
        >
          Continue
        </Button>
        <div className="mt-2 text-sm text-center text-muted-foreground">
          <span>Already have an account?</span>
          {"  "}
          <Link className="text-primary" href="/auth/log-in">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
