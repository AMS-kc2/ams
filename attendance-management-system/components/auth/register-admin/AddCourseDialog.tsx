"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Course = {
  id: string;
  code: string;
  title: string;
  level: string;
  semester: string;
  no_of_students: number;
};

export function AddCourseDialog({
  open,
  onOpenChange,
  onAdd,
  query,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (course: Omit<Course, "id">) => void;
  query: string;
}) {
  const initialState = {
    code: query.trim().toUpperCase() ?? "",
    title: "",
    no_of_students: 1,
    level: "100",
    semester: "1st",
  };
  const [courseData, setCourseData] =
    useState<Omit<Course, "id">>(initialState);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!courseData.code.trim() || !courseData.title.trim()) {
      setError("All fields are required");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onAdd({
      code: courseData.code.toUpperCase().trim(),
      title: courseData.title.trim(),
      no_of_students: courseData.no_of_students,
      level: courseData.level,
      semester: courseData.semester,
    });
    setCourseData(initialState);
    setError("");
    setShowConfirmation(false);
    onOpenChange(false);
  };

  const handleRecheck = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Create a new course that's not in the system yet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Course Code <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., CSC301"
                value={courseData.code}
                onChange={(e) => {
                  setCourseData({ ...courseData, code: e.target.value });
                  setError("");
                }}
                className="h-11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Course Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., Data Structures"
                value={courseData.title}
                onChange={(e) => {
                  setCourseData({ ...courseData, title: e.target.value });
                  setError("");
                }}
                className="h-11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Students <span className="text-destructive">*</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={courseData.no_of_students}
                onChange={(e) => {
                  setCourseData({
                    ...courseData,
                    no_of_students: parseInt(e.target.value),
                  });
                  setError("");
                }}
                className="h-11 w-24 "
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Level
              </label>
              <Select
                onValueChange={(v: "100" | "200" | "300" | "400" | "500") =>
                  setCourseData({ ...courseData, level: v })
                }
                defaultValue={"100"}
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
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Semester
              </label>
              <Select
                onValueChange={(v) =>
                  setCourseData({ ...courseData, semester: v })
                }
                defaultValue={courseData.semester}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Semester</SelectItem>
                  <SelectItem value="2nd">2nd Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CourseSubmissionConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        courseData={courseData}
        onContinue={handleConfirm}
        onRecheck={handleRecheck}
      />
    </>
  );
}

export function CourseSubmissionConfirmationDialog({
  open,
  onOpenChange,
  courseData,
  onContinue,
  onRecheck,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseData: Omit<Course, "id">;
  onContinue: () => void;
  onRecheck: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Course Information</DialogTitle>
          <DialogDescription>
            Please verify the details below before creating the result
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 rounded-lg p-4 space-y-3 my-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">
              Course Code:
            </span>
            <span className="text-sm text-slate-900">{courseData.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">
              Course Title:
            </span>
            <span className="text-sm text-slate-900">{courseData.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">Level:</span>
            <span className="text-sm text-slate-900">{courseData.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">
              Semester:
            </span>
            <span className="text-sm text-slate-900">
              {courseData.semester}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">
              Students:
            </span>
            <span className="text-sm text-slate-900">
              {courseData.no_of_students}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onRecheck}>
            Recheck Info
          </Button>
          <Button onClick={onContinue}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
