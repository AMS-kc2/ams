import React from 'react';

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen max-w-4xl py-20 px-5 mx-auto">
      {children}
    </div>
  );
};

export default StudentLayout