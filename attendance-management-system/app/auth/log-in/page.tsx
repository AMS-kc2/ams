"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, ChevronLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

/* -------------------- SCHEMAS -------------------- */
// Base structure for role switching
const lecturerSchema = z.object({
  lecturerId: z.string().min(2, { message: "Lecturer ID is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const studentSchema = z.object({
  matricNumber: z.string().min(2, { message: "Matric number is required" }),
  surname: z
    .string()
    .min(2, { message: "Surname must be at least 2 characters" }),
});

type LecturerFormData = z.infer<typeof lecturerSchema>;
type StudentFormData = z.infer<typeof studentSchema>;

export default function LoginPage() {
  const [role, setRole] = useState<"lecturer" | "student">("lecturer");
  const router = useRouter();

  // Pick schema dynamically based on role
  const schema = role === "lecturer" ? lecturerSchema : studentSchema;

  const form = useForm<LecturerFormData | StudentFormData>({
    resolver: zodResolver(schema),
    defaultValues:
      role === "lecturer"
        ? { lecturerId: "", password: "" }
        : { matricNumber: "", surname: "" },
  });

  const onSubmit = async (data: LecturerFormData | StudentFormData) => {
    try {
      // Only send relevant data based on role
      // console.log(data);
      const formData =
        role === "lecturer"
          ? {
              lecturerId: (data as LecturerFormData).lecturerId,
              password: (data as LecturerFormData).password,
            }
          : {
              matricNumber: (data as StudentFormData).matricNumber,
              surname: (data as StudentFormData).surname,
            };

      axiosInstance.post(
        `/auth/${role === "lecturer" ? "lecturer" : "student"}/log-in`,
        formData,
        {
          withCredentials: true,
        }
      );
      toast("Successfully Logged In");
      router.push(
        role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard"
      );
    } catch (error) {
      toast("Failed to login [BAD]:" + error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-screen p-4 relative">
      <div className="absolute top-10 left-10">
        <Button size={"sm"} variant="ghost" onClick={() => router.back()}>
          <ChevronLeft size={16} className="mr-1" /> Back
        </Button>
      </div>

      {/* Role Tabs */}
      <Tabs
        value={role}
        onValueChange={(val: string) => {
          setRole(val as "lecturer" | "student");
          form.reset(); // reset fields when switching role
        }}
      >
        <TabsList>
          <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
          <TabsTrigger value="students">Student</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Dynamic Title */}
      <div className="text-center space-y-4">
        <div className="mb-4">
          {role === "lecturer" ? (
            <Book size={40} className="text-primary mx-auto" />
          ) : (
            <GraduationCap size={40} className="text-primary mx-auto" />
          )}
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-primary text-pretty">
          Login as {role === "lecturer" ? "Lecturer" : "Student"}
        </h2>
        {role === "student" && (
          <p className="text-sm text-muted-foreground">
            Note: you won&apos;t be able to log out once logged in.
          </p>
        )}
      </div>

      {/* Form */}
      <Card className="w-full max-w-sm mt-4">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {role === "lecturer" ? (
                <>
                  <FormField
                    control={form.control}
                    name="lecturerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lecturer ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Lecturer ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="matricNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matriculation Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Matric Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surname</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Surname" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
                type="submit"
                className="w-full"
              >
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="hover:underline text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
