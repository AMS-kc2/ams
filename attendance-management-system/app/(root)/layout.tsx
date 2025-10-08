"use client";

// import { useUser } from "@/hooks/use-user";
import React from "react";

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
