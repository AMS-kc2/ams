import axiosInstance from "@/lib/axios";

export const signUpStudent = async (data: FormData) => {
  const res = await axiosInstance.post("/auth/students/sign-up", data);

  console.log(res);
};
