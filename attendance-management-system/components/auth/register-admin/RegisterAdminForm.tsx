"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronLeft,
  Book,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { departments } from "@/lib/constants";
import { schema, STEP_FIELDS, type FormValues, type Course } from "./schema";
import { MultiSelectCombobox } from "./MultiSelectCombobox";
import { useFetch } from "@/hooks/use-api";
import { PasswordInput } from "@/components/ui/password-input";
import Loading from "@/components/loading";

export default function RegisterAdminForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [openDepartment, setOpenDepartment] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      lecturerId: "",
      password: "",
      confirmPassword: "",
      department: departments[0],
      level: "100",
      semester: "1st",
      courseIds: [],
    },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: isFormLoading },
    trigger,
    setFocus,
  } = form;

  const watched = watch();

  /* ------------------ Fetch courses ------------------ */
  const queryKey = React.useMemo(() => ["courses"], []);

  const { data, isLoading, isError } = useFetch<{ courses: Course[] }>(
    queryKey,
    "/courses"
  );

  useEffect(() => {
    console.log(data);
    if (data?.courses) {
      setCourses(data.courses);
    }
  }, [data]);

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="h-screen flex flex-col gap-4 items-center justify-center text-center text-slate-500">
        Something went wrong. Please try again later.
        <span>Try refresh</span>
        <Button onClick={() => router.refresh()}>Refresh</Button>
      </div>
    );

  /* ------------------ Step control ------------------ */
  async function nextStep() {
    if (currentStep === 1) {
      const ok = await trigger(STEP_FIELDS[1]);
      if (!ok) return;
    }
    setCurrentStep((s) => Math.min(2, s + 1));
  }

  async function jumpTo(targetStep: number) {
    if (targetStep === currentStep) return;

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    for (let s = 1; s < targetStep; s++) {
      const fields = STEP_FIELDS[s] ?? [];
      if (fields.length === 0) continue;

      const ok = await trigger(fields as any);
      if (!ok) {
        const firstField = fields[0];
        if (firstField) setFocus(firstField);
        setCurrentStep(s);
        return;
      }
    }

    setCurrentStep(Math.min(2, Math.max(1, targetStep)));
  }

  function prevStep() {
    setCurrentStep((s) => Math.max(1, s - 1));
  }

  /* ------------------ Submit ------------------ */
  async function onSubmit(values: FormValues) {
    console.log(values);
    try {
      await axiosInstance.post("/auth/lecturer/sign-up", {
        ...values,
        courses: values.courseIds,
      });
      toast.success("Registration successful!");
      router.push("/auth/lecturer/log-in");
    } catch (error) {
      toast.error("Failed to register. Please try again.");
      console.warn(error);
    }
  }

  /* ------------------ Error helper ------------------ */
  const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-destructive mt-1.5">{msg}</p> : null;

  /* ------------------ UI ------------------ */
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="absolute top-6 left-6">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          <ChevronLeft size={16} className="mr-1" /> Back
        </Button>
      </div>

      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 mb-2">
            <Book size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Create Lecturer Account
            </h1>
            <p className="text-slate-600">
              Complete the steps below to set up your account
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-lg rounded-2xl p-8 space-y-6 border border-slate-200"
        >
          {/* Progress Indicator */}
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2].map((step) => (
              <button
                type="button"
                key={step}
                onClick={() => jumpTo(step)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step === currentStep
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 text-slate-500 hover:border-primary/60"
                }`}
              >
                {step}
              </button>
            ))}
          </div>

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <Input
                  placeholder="e.g., Williams Smith"
                  className="h-11 text-sm"
                  {...register("fullName")}
                />
                <Err msg={errors.fullName?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Lecturer ID
                </label>
                <Input
                  className="h-11 text-sm"
                  placeholder="e.g., LEC123"
                  {...register("lecturerId")}
                />
                <Err msg={errors.lecturerId?.message} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <PasswordInput
                    placeholder="********"
                    {...register("password")}
                  />
                  <Err msg={errors.password?.message} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <PasswordInput
                    placeholder="********"
                    {...register("confirmPassword")}
                  />
                  <Err msg={errors.confirmPassword?.message} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Department
                </label>
                <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDepartment}
                      className="w-full justify-between h-11 text-sm font-normal"
                    >
                      {watched.department || "Select department..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search department..." />
                      <CommandList>
                        <CommandEmpty>No department found.</CommandEmpty>
                        <CommandGroup>
                          {departments.map((dept) => (
                            <CommandItem
                              key={dept}
                              value={dept}
                              onSelect={(currentValue) => {
                                setValue(
                                  "department",
                                  currentValue === watched.department
                                    ? ""
                                    : currentValue
                                );
                                setOpenDepartment(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  watched.department === dept
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {dept}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Err msg={errors.department?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Level
                </label>
                <Select
                  onValueChange={(v: "100" | "200" | "300" | "400" | "500") =>
                    setValue("level", v)
                  }
                  defaultValue={watched.level}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["100", "200", "300", "400", "500"].map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Err msg={errors.level?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Semester
                </label>
                <Select
                  onValueChange={(v) => setValue("semester", v as any)}
                  defaultValue={watched.semester}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Semester</SelectItem>
                    <SelectItem value="2nd">2nd Semester</SelectItem>
                  </SelectContent>
                </Select>
                <Err msg={errors.semester?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Courses
                </label>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading courses...
                  </div>
                ) : (
                  <MultiSelectCombobox
                    courses={courses}
                    selectedIds={watched.courseIds}
                    onChange={(ids) => setValue("courseIds", ids)}
                  />
                )}
                <Err msg={errors.courseIds?.message} />
              </div>
            </div>
          )}

          {/* Step Controls */}
          <div className="flex justify-between pt-6 border-t">
            {currentStep > 1 ? (
              <Button variant="outline" type="button" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 2 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                disabled={isFormLoading}
                type="submit"
                onClick={() => {
                  console.log(form.getValues());
                  onSubmit(form.getValues());
                }}
              >
                {isFormLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
