import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";

export function useAdminAccess() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const isAdmin = user?.authentication?.role === "ADMINISTRATOR" || user?.authentication?.role === "SUPER_ADMIN";

    if (!isAdmin) {
      toast.error("You don't have permission to access this page");
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const hasAccess = user?.authentication?.role === "ADMINISTRATOR" || user?.authentication?.role === "SUPER_ADMIN";

  return { hasAccess, loading: isLoading || !user };
}
