import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useUser from "@/hooks/use-user";
import Loading from "@/components/loading";
import { useEffect } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const router = useRouter();

  const { data: user, error, isLoading } = useUser();

  if (error) toast("Unable to fetch user" + error.message);
  if (isLoading) return <Loading />;

  useEffect(() => {
    if (user) router.push(`/${user?.user?.role!}/dashboard`);
  }, [user]);
  return <> {children} </>;
};

export default AuthLayout;
