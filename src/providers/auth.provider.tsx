"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "@/api/client";
import { organizationsApi, type OrganizationOption } from "@/api/organizations";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  authentication: {
    role: "SUPER_ADMIN" | "ADMINISTRATOR" | "MANAGER" | "EDITOR" | "VIEWER";
    active: boolean;
  };
  organizations: OrganizationOption[];
  selectedOrganization?: OrganizationOption | null;
}

type DecodedToken = {
  payload?: User;
  [key: string]: any;
};

const extractUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const candidate = decoded?.payload ?? decoded;
    if (!candidate || typeof candidate !== "object") return null;
    return candidate as User;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

const resolveSelectedOrganization = (
  organizations: OrganizationOption[],
  storedOrgId: string | null,
): OrganizationOption | null => {
  if (!organizations.length) {
    localStorage.removeItem("selectedOrganizationId");
    return null;
  }

  const selected = storedOrgId ? organizations.find((org) => org.id === storedOrgId) : undefined;
  const active = selected ?? organizations[0];
  localStorage.setItem("selectedOrganizationId", active.id);
  return active;
};

const buildOrganizationsForUser = async (userData: User): Promise<OrganizationOption[]> => {
  if (userData.authentication?.role === "SUPER_ADMIN") {
    const organizations = await organizationsApi.getAllOrganizationsForAdmin();
    console.log("Getting organization for super admin", JSON.stringify(organizations));

    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      role: "SUPER_ADMIN",
    }));
  }

  return organizationsApi.getUserOrganizations();
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
  selectOrganization: (organizationId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedOrgId = localStorage.getItem("selectedOrganizationId");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      const extractedUser = extractUserFromToken(storedToken);
      if (!extractedUser) {
        localStorage.removeItem("token");
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const organizations = await buildOrganizationsForUser(extractedUser);
        const selectedOrganization = resolveSelectedOrganization(organizations, storedOrgId);
        setUser({
          ...extractedUser,
          organizations,
          selectedOrganization,
        });
      } catch (error) {
        console.error("Failed to load organizations:", error);
        const fallbackOrganizations = extractedUser.organizations ?? [];
        const selectedOrganization = resolveSelectedOrganization(fallbackOrganizations, storedOrgId);
        setUser({
          ...extractedUser,
          organizations: fallbackOrganizations,
          selectedOrganization,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", {
        emailAddress: email,
        password,
      });

      const { token: accessToken } = response.data;

      if (!accessToken) {
        throw new Error("No token received from server");
      }

      // Decode JWT to get user info
      const decodedUser = extractUserFromToken(accessToken);
      if (!decodedUser) {
        throw new Error("Failed to decode user from token");
      }

      // Save token to localStorage
      localStorage.setItem("token", accessToken);

      const storedOrgId = localStorage.getItem("selectedOrganizationId");
      let organizations: OrganizationOption[] = decodedUser.organizations ?? [];

      try {
        organizations = await buildOrganizationsForUser(decodedUser);
        // console.log("Orgsn:  ", organizations);
        if (decodedUser.authentication?.role === "SUPER_ADMIN") {
          // console.log("SUPER ADMIN ORGS: ", organizations);
          decodedUser.organizations = organizations;
        }
      } catch (error) {
        console.error("Failed to load organizations after login:", error);
      }

      const selectedOrganization = resolveSelectedOrganization(organizations, storedOrgId);

      // Update state
      setToken(accessToken);
      setUser({
        ...decodedUser,
        organizations,
        selectedOrganization,
      });

      toast.success("Login successful!");

      // Check for redirect path
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectPath);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem("token");
    sessionStorage.removeItem("redirectAfterLogin");
    setToken(null);
    setUser(null);
    toast.info("Logged out successfully");
    router.push("/");
    setTimeout(() => setIsLoggingOut(false), 0);
  };

  const refreshUser = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const extractedUser = extractUserFromToken(storedToken);
      if (extractedUser) {
        const storedOrgId = localStorage.getItem("selectedOrganizationId");

        buildOrganizationsForUser(extractedUser)
          .then((organizations) => {
            const selectedOrganization = resolveSelectedOrganization(organizations, storedOrgId);
            setUser({
              ...extractedUser,
              organizations,
              selectedOrganization,
            });
          })
          .catch((error) => {
            console.error("Failed to refresh organizations:", error);
            const fallbackOrganizations = extractedUser.organizations ?? [];
            const selectedOrganization = resolveSelectedOrganization(fallbackOrganizations, storedOrgId);
            setUser({
              ...extractedUser,
              organizations: fallbackOrganizations,
              selectedOrganization,
            });
          });
        return;
      }
    }
    logout();
  };

  const selectOrganization = (organizationId: string) => {
    if (user) {
      const selected = user.organizations.find((org) => org.id === organizationId);
      if (selected) {
        const updatedUser = { ...user, selectedOrganization: selected };
        setUser(updatedUser);
        localStorage.setItem("selectedOrganizationId", organizationId);
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    isLoggingOut,
    login,
    logout,
    refreshUser,
    selectOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook that guarantees user is authenticated (non-null user)
export function useAuthUser() {
  const context = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  if (context === undefined) {
    throw new Error("useAuthUser must be used within an AuthProvider");
  }

  useEffect(() => {
    if (!context.user && !context.isLoading) {
      if (context.isLoggingOut) {
        return;
      }

      if (pathname === "/" || pathname === "/login") {
        return;
      }

      // Save current path for redirect after login
      if (pathname && pathname !== "/login") {
        sessionStorage.setItem("redirectAfterLogin", pathname);
      }
      toast.error("Please login again to continue");
      router.push("/login");
    }
  }, [context.user, context.isLoading, pathname, router]);

  if (!context.user) {
    // Return a loading state while redirecting
    return {
      ...context,
      user: null as any, // Temporary until redirect completes
    };
  }

  return {
    ...context,
    user: context.user, // TypeScript now knows user is non-null
  };
}
