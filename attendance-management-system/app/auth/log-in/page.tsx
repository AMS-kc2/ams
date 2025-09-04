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

const formSchema = z.object({
  lecturerId: z.string().min(2, { message: "ID is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
  surname: z
    .string()
    .min(2, { message: "Surname must be at least 2 characters." })
    .transform((val) => val.toLowerCase())
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [role, setRole] = useState<"lecturer" | "student">("lecturer");
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { lecturerId: "", password: "" },
  });

  const onSubmit = (data: FormData) => {
    // Handle student login logic here
    // use timeput to represent req
    setTimeout(() => {
      console.log("Student login data:", data);
    }, 2000);

    router.push("/student/dashboard");
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
        onValueChange={(val: string) => setRole(val as "lecturer" | "student")}
      >
        <TabsList>
          <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
          <TabsTrigger value="student">Student</TabsTrigger>
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

      {/* Form Card */}
      <Card className="w-full max-w-sm mt-4">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="lecturerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {role === "lecturer"
                        ? "Lecturer ID"
                        : "Matriculation Number"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        aria-required
                        aria-label={
                          role === "lecturer"
                            ? "Lecturer ID"
                            : "Matriculation Number"
                        }
                        placeholder={
                          role === "lecturer"
                            ? "Enter Lecturer ID"
                            : "Enter Matric Number"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === "lecturer" ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          required
                          aria-required
                          aria-label="Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surname</FormLabel>
                      <FormControl>
                        <Input
                          aria-label="Surname"
                          aria-required
                          required
                          placeholder="Enter your Surname"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full">
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
