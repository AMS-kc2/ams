"use client";

import Loading from "@/components/loading";
// import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  // const { data: user, isLoading, error } = useUser();
  // const router = useRouter();

  // if (isLoading) <Loading />;
  // if (error) {
  //   toast.warning(error.message);
  //   router.refresh();
  // }

  // useEffect(() => {
  //   // ✅ This code runs *after* RootLayout has rendered.
  //   if (!user?.isLoggedIn) {
  //     router.push("/auth/log-in");
  //   }
  //   // Add an appropriate dependency array. If 'user' changes, it re-runs.
  // }, [router, user?.isLoggedIn]);
  return <>{children}</>;
};

export default RootLayout;
