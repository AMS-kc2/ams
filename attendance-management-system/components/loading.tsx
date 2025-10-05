import React from "react";
import { Spinner } from "./ui/spinner";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Spinner fontSize={40} />
    </div>
  );
};

export default Loading;
