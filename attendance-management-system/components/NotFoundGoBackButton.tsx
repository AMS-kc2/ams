"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // keep this import if you have shadcn button

export default function NotFoundGoBackButton() {
  const router = useRouter();

  const goBack = React.useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  return (
    <Button
      onClick={goBack}
      aria-label="Go back to previous page"
      className="px-4"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      <span className="text-sm font-medium">Go back</span>
    </Button>
  );
}
