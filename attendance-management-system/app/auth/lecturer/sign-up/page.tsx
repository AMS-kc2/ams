import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import RegisterAdminForm from "@/components/auth/register-admin/RegisterAdminForm";

async function getCourses() {
  const res = await axiosInstance.get("/courses");
  return res.data.courses;
}

export default async function SignUpPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RegisterAdminForm />
    </HydrationBoundary>
  );
}
