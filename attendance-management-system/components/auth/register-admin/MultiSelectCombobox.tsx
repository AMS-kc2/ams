"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { AddCourseDialog } from "./AddCourseDialog";
import { ChevronsUpDown, Check, Search, Plus, Users, X } from "lucide-react";
import { useMutate } from "@/hooks/use-api";

type Course = {
  id: string;
  code: string;
  title: string;
  level: string;
  no_of_students: number;
};

type MultiSelectComboboxProps = {
  courses: Course[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
};

export function MultiSelectCombobox({
  courses,
  selectedIds,
  onChange,
  placeholder = "Select courses...",
}: MultiSelectComboboxProps) {
  // const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  // const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { mutate } = useMutate<{ data: Course }, Omit<Course, "id">>("post");

  const toggleValue = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((v) => v !== id)
        : [...selectedIds, id]
    );
  };

  const removeValue = (id: string) => {
    onChange(selectedIds.filter((v) => v !== id));
  };

  const handleAddNewCourse = (newCourse: Omit<Course, "id">) => {
    mutate(
      { url: "/courses", ...newCourse },
      {
        onSuccess: (res) => {
          console.log(res);
          // `res` is already the course object returned by backend
          // setLocalCourses((prev) => [...prev, res]);
          onChange([...selectedIds, res.data.id]);
          toast.success("Course added successfully!");
          setOpen(false);
          setShowAddDialog(false);
        },
        onError: (err) => {
          toast.error("Failed to add course. Please try again.");
          console.warn(err.message);
        },
      }
    );
  };

  const filteredCourses = searchQuery
    ? courses.filter(
        (c) =>
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  const selectedCourses = useMemo(
    () => courses.filter((c) => selectedIds.includes(c.id)),
    [selectedIds, courses]
  );

  // useEffect(() => {
  //   setLocalCourses(courses);
  // }, [courses]);

  // useEffect(() => {
  //   setSelectedCourses(localCourses.filter((c) => selectedIds.includes(c.id)));
  // }, [selectedIds, localCourses]);

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              {selectedIds.length > 0
                ? `${selectedIds.length} course${
                    selectedIds.length > 1 ? "s" : ""
                  } selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search by code or title..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-6 text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    No courses found matching &quot;{searchQuery}&quot;
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowAddDialog(true);
                      setOpen(false);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Course
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup heading="Available Courses">
                {filteredCourses.map((course) => (
                  <CommandItem
                    key={course.id}
                    onSelect={() => toggleValue(course.id)}
                    className="cursor-pointer py-3"
                  >
                    <Check
                      className={cn(
                        "mr-3 h-4 w-4 shrink-0",
                        selectedIds.includes(course.id)
                          ? "opacity-100 text-primary"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {course.code}
                        </Badge>
                        <span className="font-medium text-sm truncate">
                          {course.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3 w-3" />
                        <span>{course.no_of_students} students</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCourses.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600">
            Selected Courses ({selectedCourses.length})
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
            {selectedCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {course.code}
                    </Badge>
                    <span className="font-medium text-sm">{course.title}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeValue(course.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddCourseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddNewCourse}
        query={searchQuery}
      />
    </div>
  );
}
