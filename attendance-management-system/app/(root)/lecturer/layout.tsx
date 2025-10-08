import React from "react";

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen max-w-4xl py-20 px-8 mx-auto">{children}</div>
  );
};

export default StudentLayout;
