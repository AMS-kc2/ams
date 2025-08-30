"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // <- using your UI wrapper (recommended)
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, User } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

/* ------------------ Schema ------------------ */
// Zod schema: note surname transform -> lowercase
const formSchema = z.object({
  matricNumber: z
    .string()
    .min(5, { message: "Matric number must be at least 5 characters." })
    .max(15, { message: "Matric number must be at most 15 characters." })
    .regex(/^[\w\d\/]+$/, {
      message: "Matric number can only contain letters, numbers, and slashes.",
    }),
  surname: z
    .string()
    .min(2, { message: "Surname must be at least 2 characters." })
    .transform((val) => val.toLowerCase()),
  level: z.enum(["100", "200", "300", "400", "500"], {
    error: "Please select a level.",
  }),
  semester: z.enum(["1st", "2nd"], { error: "Please select a semester." }),
});

/* ------------------ Props ------------------ */
type RegisterUserProps = {
  setSteps: (step: "choose" | "register") => void;
  steps: "choose" | "register";
};

/* ------------------ Component ------------------ */
export default function RegisterUser({ setSteps }: RegisterUserProps) {
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matricNumber: "",
      surname: "",
      level: undefined,
      semester: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // send to API or advance flow
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative space-y-15">
      <div className="absolute top-10 left-10">
        <Button size={"sm"} variant="ghost" onClick={() => setSteps("choose")}>
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      <div className="text-center">
        <div className="mb-4">
          <User size={40} className="text-primary mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-primary">
          Create Your Account
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign up as a student to get started
        </p>
      </div>

      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <FormField
              control={form.control}
              name="matricNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matric Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABC/18/1234" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your unique matric number.
                  </FormDescription>
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
                    <Input placeholder="Enter your surname" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your surname will be saved in lowercase.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>

                  {/* Controlled Select: value + onValueChange */}
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current level" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>

                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current semester" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="1st">1st Semester</SelectItem>
                      <SelectItem value="2nd">2nd Semester</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
