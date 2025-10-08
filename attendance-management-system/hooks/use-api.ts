// "use client";
// import { useState, useEffect } from "react";
// import axiosInstance from "@/lib/axios";
// import { AxiosRequestConfig } from "axios";

// interface UseFetchResult<T> {
//   data: T | null;
//   loading: boolean;
//   error: string | null;
//   refetch: () => void;
// }

// export function useFetch<T>(
//   url: string,
//   options?: AxiosRequestConfig
// ): UseFetchResult<T> {
//   const [data, setData] = useState<T | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await axiosInstance({
//         url,
//         method: options?.method || "GET",
//         ...options,
//       });
//       // Response is already unwrapped by the interceptor
//       console.log(response);
//       setData(response as T);
//     } catch (err) {
//       // Error is already formatted by the interceptor
//       setError(typeof err === "string" ? err : "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [url]);

//   return { data, loading, error, refetch: fetchData };
// }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { AxiosRequestConfig } from "axios";

// Generic GET hook
export function useFetch<T>(
  key: string[],
  url: string,
  config?: AxiosRequestConfig
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const response = await axiosInstance.get<T>(url, {
        ...config,
        withCredentials: true,
      });
      return response as T;
    },
  });
}

export function useMutate<TData, TVariables>(
  method: "post" | "put" | "delete" | "patch"
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables & { url: string }>({
    mutationFn: async ({ url, ...data }) => {
      const response = await axiosInstance[method](url, data, {
        withCredentials: true,
      });
      return response as TData;
    },
    onSuccess: () => {
      // Invalidate and refetch queries after mutation
      queryClient.invalidateQueries();
    },
  });
}
