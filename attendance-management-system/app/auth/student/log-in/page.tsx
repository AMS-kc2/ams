"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { ChevronLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

const formSchema = z.object({
  matricNumber: z
    .string()
    .min(2, { message: "Matriculation number is required" }),
  surname: z
    .string()
    .min(2, { message: "Surname must be at least 2 characters." })
    .transform((val) => val.toLowerCase()),
});

type FormData = z.infer<typeof formSchema>;

export default function StudentLoginPage() {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { matricNumber: "", surname: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await axiosInstance.post("/auth/students/log-in", data);

      router.push("/student/dashboard");
    } catch (error) {
      toast(error as string);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-screen p-4 relative">
      <div className="absolute top-10 left-10">
        <Button size={"sm"} variant="ghost" onClick={() => router.back()}>
          <ChevronLeft size={16} className="mr-1" /> Back
        </Button>
      </div>

      {/* Title */}
      <div className="text-center space-y-4">
        <div className="mb-4">
          <GraduationCap size={40} className="text-primary mx-auto" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-primary text-pretty">
          Student Login
        </h2>
        <p className="text-sm text-muted-foreground">
          Note: you won&apos;t be able to log out once logged in.
        </p>
      </div>

      {/* Form Card */}
      <Card className="w-full max-w-sm mt-4">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      <Input placeholder="Enter your Surname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Login as Student
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/student/sign-up"
            className="hover:underline text-primary"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
