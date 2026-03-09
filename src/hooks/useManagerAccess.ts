import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";

export function useManagerAccess() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const isManagerOrAdmin =
      user?.authentication?.role === "ADMINISTRATOR" ||
      user?.authentication?.role === "SUPER_ADMIN" ||
      user?.authentication?.role === "MANAGER";

    if (!isManagerOrAdmin) {
      toast.error("You don't have permission to access this page");
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const hasAccess =
    user?.authentication?.role === "ADMINISTRATOR" ||
    user?.authentication?.role === "SUPER_ADMIN" ||
    user?.authentication?.role === "MANAGER";

  return { hasAccess, loading: isLoading || !user };
}
