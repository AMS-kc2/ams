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
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

const formSchema = z.object({
  lecturerId: z.string().min(2, { message: "lecturerId is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

export default function LecturerLoginPage() {
  // const [role, setRole] = useState<"lecturer" | "student">("lecturer");
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { lecturerId: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await axiosInstance.post("/auth/lecturer/log-in", data);

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

      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="mb-4">
          <Book size={40} className="text-primary mx-auto" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-primary text-pretty">
          Lecturer&apos;s Login
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
                name="lecturerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecturer lecturerId</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Lecturer lecturerId"
                        {...field}
                      />
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
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          <Link
            href="/auth/lecturer/sign-up"
            className="hover:underline text-primary"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
