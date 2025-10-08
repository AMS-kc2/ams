import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CourseCardSkeleton = () => {
  return (
    <Card className="p-6 space-y-4 shadow-md">
      <Skeleton className="h-6 w-2/3 mx-auto" />
      <Skeleton className="h-4 w-1/3 mx-auto" />
      <div className="flex justify-around mt-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mt-4" />
      <Skeleton className="h-10 w-1/2 mx-auto mt-6" />
    </Card>
  );
};