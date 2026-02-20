import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";

export function useClientPageAccess() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const role = user?.authentication?.role;
    const isAllowed = role === "ADMINISTRATOR" || role === "SUPER_ADMIN" || role === "MANAGER";

    if (!isAllowed) {
      toast.error("You don't have permission to access this page");
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const role = user?.authentication?.role;
  const hasAccess = role === "ADMINISTRATOR" || role === "SUPER_ADMIN" || role === "MANAGER";
  const isManager = role === "MANAGER";

  return { hasAccess, loading: isLoading || !user, isManager };
}
