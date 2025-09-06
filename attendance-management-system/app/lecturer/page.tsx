"use client"

import { useRouter } from "next/navigation";

const LecturerDashBoardPage = () => {
  const router = useRouter()
     router.push("/lecturer/dashboard");
  return <></>
}

export default LecturerDashBoardPage