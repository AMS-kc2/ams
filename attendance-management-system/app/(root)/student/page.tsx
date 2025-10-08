"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const StudentDashBoardPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/student/dashboard");
  }, [router]);

  return null;
};

export default StudentDashBoardPage;
