"use client"

import { useRouter } from "next/navigation"

const StudentDashBoardPage = () => {
  const router = useRouter()

  return router.push("/student/dashboard")
}

export default StudentDashBoardPage