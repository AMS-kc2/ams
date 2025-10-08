import { Button } from "@/components/ui/button";
import Link from "next/link";

const LecturerOnboardingPage = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="p-5 space-y-8">
        <p className="text-lg font-semibold">
          Welcome To KCS Attendance Management System
        </p>
        <Button asChild variant="link">
          <Link href="/lecturer/dashboard"> Continue to Your Dashboard </Link>
        </Button>
      </div>
    </div>
  );
};

export default LecturerOnboardingPage;
