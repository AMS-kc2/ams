"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronsUpDown,
  GraduationCap,
} from "lucide-react";

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

type MultiSelectComboboxProps = {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};
/* ---------- Mock course data (replace with real list or fetch) ---------- */
const COURSES = [
  "MTH101 — Calculus I",
  "PHY101 — Physics I",
  "CHM101 — Chemistry I",
  "ENG101 — English Composition",
  "CSE101 — Intro to Programming",
  "MTH201 — Calculus II",
  "CSE201 — Data Structures",
  "MEE201 — Materials Engineering",
  "MTH301 — Linear Algebra",
  "CSE301 — Algorithms",
  "EGR401 — Project Design",
];

const STEP_FIELDS: Record<number, Array<keyof FormValues>> = {
  1: ["lecturerId", "password", "confirmPassword", "level"],
  2: ["semester", "courses"],
  3: ["totalClasses"],
};
/* ------------------ Validation schema ------------------ */
const schema = z
  .object({
    lecturerId: z.string().min(3, "Enter a valid lecturer id"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
    level: z.enum(["100", "200", "300", "400", "500"]),
    semester: z.enum(["1st", "2nd"]),
    courses: z.array(z.string()).min(1, "Select at least one course"),
    totalClasses: z
      .number()
      .min(1, "Must be at least 1")
      .max(365, "Too many classes"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder = "Select courses...",
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value.length > 0
            ? `${value.length} course(s) selected`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Search courses..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => toggleValue(option)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------ RegisterAdmin component ------------------ */
type RegisterAdminProps = {
  setSteps: (step: "choose" | "register") => void;
  steps: "choose" | "register";
};

export default function RegisterAdmin({ setSteps }: RegisterAdminProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lecturerId: "",
      password: "",
      confirmPassword: "",
      level: "100",
      semester: "1st",
      courses: [],
      totalClasses: 28,
    },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
    trigger,
    setFocus,
  } = form;

  const watched = watch();

  /* Navigation helpers */
  async function nextStep() {
    // validate only relevant fields per step
    if (currentStep === 1) {
      const ok = await trigger([
        "lecturerId",
        "password",
        "confirmPassword",
        "level",
      ]);
      if (!ok) return;
    } else if (currentStep === 2) {
      const ok = await trigger(["semester", "courses"]);
      if (!ok) return;
    } else if (currentStep === 3) {
      const ok = await trigger(["totalClasses"]);
      if (!ok) return;
    }
    setCurrentStep((s) => Math.min(3, s + 1));
  }

  async function jumpTo(targetStep: number) {
    if (targetStep === currentStep) return;
    // Going backward: allow without validation
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Going forward: validate each step in sequence up to targetStep - 1
    for (let s = 1; s < targetStep; s++) {
      const fields = STEP_FIELDS[s] ?? [];
      if (fields.length === 0) continue;

      const ok = await trigger(...fields);
      if (!ok) {
        // focus first field for better UX
        const firstField = fields[0];
        if (firstField) {
          try {
            setFocus(firstField);
          } catch (err) {
            /* ignore if focus can't be set */
            console.error(err);
          }
        }
        // move user to the step that failed
        setCurrentStep(s);
        return;
      }
    }

    // all intermediate steps valid — go to target
    setCurrentStep(Math.min(3, Math.max(1, targetStep)));
  }

  function prevStep() {
    setCurrentStep((s) => Math.max(1, s - 1));
  }

  function onSubmit(values: FormValues) {
    // Final submit
    console.log("Admin registration payload:", values);
    // TODO: send to API
    alert("Admin account created — check console for payload.");
  }

  /* small helper for rendering error text */
  const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative space-y-10">
      <div className="absolute top-10 left-10">
        <Button size={"sm"} variant="ghost" onClick={() => setSteps("choose")}>
          <ChevronLeft size={16} className="mr-1" /> Back
        </Button>
      </div>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mb-4">
            <GraduationCap size={40} className="text-primary mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Create Admin Account
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign up as a Lecturer to get started
          </p>
        </div>

        <div className="flex justify-center space-x-10">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "mb-4 h-10 w-10 flex items-center justify-center rounded-full shadow-md cursor-pointer",
                currentStep === step
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-300"
              )}
              onClick={() => jumpTo(step)}
            >
              {" "}
              {step}{" "}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* CONTENT AREA */}
          <div className="min-h-[260px]">
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Lecturer ID
                  </label>
                  <Input
                    {...register("lecturerId")}
                    placeholder="e.g LEC/ENG/001"
                  />
                  <Err msg={errors.lecturerId?.message as string | undefined} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder="Enter password"
                  />
                  <Err msg={errors.password?.message as string | undefined} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Confirm password"
                  />
                  <Err
                    msg={errors.confirmPassword?.message as string | undefined}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Level
                  </label>
                  <Select
                    value={getValues().level}
                    onValueChange={(v) =>
                      setValue("level", v as FormValues["level"])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose level" />
                    </SelectTrigger>
                    <SelectContent>
                      {["100", "200", "300", "400", "500"].map((lv) => (
                        <SelectItem key={lv} value={lv}>
                          {lv} Level
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Err msg={errors.level?.message as string | undefined} />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Semester
                  </label>
                  <Select
                    value={getValues().semester}
                    onValueChange={(v) =>
                      setValue("semester", v as FormValues["semester"])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st Semester</SelectItem>
                      <SelectItem value="2nd">2nd Semester</SelectItem>
                    </SelectContent>
                  </Select>
                  <Err msg={errors.semester?.message as string | undefined} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Courses (search & add)
                  </label>
                  <MultiSelectCombobox
                    placeholder="Select courses..."
                    options={COURSES}
                    value={getValues().courses}
                    onChange={(v) => setValue("courses", v)}
                  />
                  <Err msg={errors.courses?.message as string | undefined} />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total number of classes this semester
                  </label>
                  <Input
                    type="number"
                    {...register("totalClasses", {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    min={1}
                    placeholder="e.g., 28"
                  />
                  <Err
                    msg={errors.totalClasses?.message as string | undefined}
                  />
                </div>

                <div className="mt-4 p-4 border rounded-md bg-gray-50">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Lecturer ID:</span>{" "}
                      <span>{watched.lecturerId || "—"}</span>
                    </div>
                    <div>
                      <span className="font-medium">Semester:</span>{" "}
                      <span>{watched.semester}</span>
                    </div>
                    <div>
                      <span className="font-medium">Courses:</span>{" "}
                      <span>{watched.courses?.length ?? 0} selected</span>
                    </div>
                    <div>
                      <span className="font-medium">Total classes:</span>{" "}
                      <span>{watched.totalClasses ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {currentStep === 1 ? (
            <Button size={"lg"} className="w-full" onClick={nextStep}>
              Continue
            </Button>
          ) : currentStep === 2 ? (
            <div className="flex items-center justify-between gap-4">
              <Button
                size={"lg"}
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                <ArrowLeft /> Prev
              </Button>
              <Button size={"lg"} className="flex-1" onClick={nextStep}>
                Next <ArrowRight />
              </Button>
            </div>
          ) : (
            currentStep === 3 && (
              <div className="flex items-center justify-between gap-4">
                <Button
                  size={"lg"}
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  <ArrowLeft /> Prev
                </Button>
                <Button size={"lg"} className="flex-1" type="submit">
                  Submit
                </Button>
              </div>
            )
          )}
        </form>
      </div>
      <div className="-mt-5 text-lg text-center">
        or {""}
        <Link href="/log-in" className="text-sm text-primary">
          Login
        </Link>
      </div>
    </div>
  );
}
