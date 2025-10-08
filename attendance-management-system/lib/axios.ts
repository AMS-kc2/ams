import axios, { AxiosError, AxiosResponse } from "axios";

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

  (error: AxiosError) => {
    if (error.response) {
      // Server responded with non-2xx status
      // @ts-ignore eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errData: any = error.response.data;
      console.error("[API RESPONSE ERROR]:", errData?.message || error.message);
      console.warn("[API RESPONSE ERROR]:", errData?.message || error.message);
      return Promise.reject(errData?.message || "Server error");
    } else if (error.request) {
      // No response
      console.error("[API NETWORK ERROR]", error.message);
      console.warn("[API NETWORK ERROR]", error.message);
      return Promise.reject("Network error, please check your connection");
    } else {
      // Axios internal error      // Axios internal error
      console.error("[API CONFIG ERROR]", error.message);
      console.warn("[API CONFIG ERROR]", error.message);
      return Promise.reject(error.message);
    }
  }
);

export default axiosInstance;
