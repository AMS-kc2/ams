"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LecturerHomePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/lecturer/dashboard");
  }, [router]);

  return null;
};

export default LecturerHomePage;
