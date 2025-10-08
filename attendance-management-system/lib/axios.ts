import axios, { AxiosError, AxiosResponse } from "axios";

export interface ApiError {
  code: string | null;
  details: string | null;
}

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data: T | null;
  error?: ApiError | null;
}

// Create the instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Handle all responses in one place
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const resData = response.data;

    // If your API always returns { success, data, message }
    if (resData?.status === "error") {
      console.warn("[API ERROR]", resData.message);
      return Promise.reject(resData.message || "Request failed");
    }

    return resData?.data ?? resData; // unwrap .data if exists
  },

  (error: AxiosError<ApiResponse<null>>) => {
    if (error.response) {
      const resError = error.response.data;
      const msg = resError?.message || "Server error";

      console.error("[API RESPONSE ERROR]:", msg);
      console.warn("[API RESPONSE ERROR]:", msg);

      return Promise.reject(msg);
    } else if (error.request) {
      console.error("[API NETWORK ERROR]", error.message);
      console.warn("[API NETWORK ERROR]", error.message);
      return Promise.reject("Network error, please check your connection");
    } else {
      console.error("[API CONFIG ERROR]", error.message);
      console.warn("[API CONFIG ERROR]", error.message);
      return Promise.reject(error.message);
    }
  }
);

export default axiosInstance;
