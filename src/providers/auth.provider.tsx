"use client";

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient, AUTH_SESSION_EXPIRED_EVENT } from "@/api/client";
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
    role: "SUPER_ADMIN" | "ADMINISTRATOR" | "MANAGER" | "EDITOR" | "VIEWER" | "USER" | "STAFF";
    active: boolean;
  };
  organizations: OrganizationOption[];
  selectedOrganization?: OrganizationOption | null;
}

type DecodedToken = {
  payload?: User;
  exp?: number;
  id?: string;
};

const SESSION_EXPIRED_TOAST_ID = "auth-session-expired";

const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const expiresAt = getTokenExpiration(token);
  return expiresAt !== null && expiresAt <= Date.now();
};

const extractUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const candidate = decoded?.payload ?? decoded;
    if (!candidate || typeof candidate !== "object") return null;
    return candidate as User;
  } catch {
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

  const clearAuthSession = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("redirectAfterLogin");
    setToken(null);
    setUser(null);
  }, []);

  const expireSession = useCallback(() => {
    setIsLoggingOut(true);
    clearAuthSession();
    toast.error("Your session has expired. Please log in again.", {
      id: SESSION_EXPIRED_TOAST_ID,
    });
    router.replace("/login");
    setTimeout(() => setIsLoggingOut(false), 0);
  }, [clearAuthSession, router]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedOrgId = localStorage.getItem("selectedOrganizationId");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(storedToken)) {
        expireSession();
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
        if (localStorage.getItem("token") !== storedToken) return;
        const selectedOrganization = resolveSelectedOrganization(organizations, storedOrgId);
        setUser({
          ...extractedUser,
          organizations,
          selectedOrganization,
        });
      } catch {
        // A 401 response may have expired and cleared this session while the
        // organization request was in flight. Do not restore stale user data.
        if (localStorage.getItem("token") !== storedToken) return;
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
  }, [expireSession]);

  useEffect(() => {
    const handleExpiredSession = () => expireSession();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession);
  }, [expireSession]);

  useEffect(() => {
    if (!token) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleExpirationCheck = () => {
      const expiresAt = getTokenExpiration(token);
      if (expiresAt === null) return;

      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= 0) {
        expireSession();
        return;
      }

      timeoutId = setTimeout(scheduleExpirationCheck, Math.min(remainingMs, 2_147_000_000));
    };

    scheduleExpirationCheck();
    return () => clearTimeout(timeoutId);
  }, [expireSession, token]);

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

        if (decodedUser.authentication?.role === "SUPER_ADMIN") {
          decodedUser.organizations = organizations;
        }
      } catch {}

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
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Login failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    clearAuthSession();
    toast.info("Logged out successfully");
    router.push("/");
    setTimeout(() => setIsLoggingOut(false), 0);
  };

  const refreshUser = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        expireSession();
        return;
      }

      const extractedUser = extractUserFromToken(storedToken);
      if (extractedUser) {
        const storedOrgId = localStorage.getItem("selectedOrganizationId");

        buildOrganizationsForUser(extractedUser)
          .then((organizations) => {
            if (localStorage.getItem("token") !== storedToken) return;
            const selectedOrganization = resolveSelectedOrganization(organizations, storedOrgId);
            setUser({
              ...extractedUser,
              organizations,
              selectedOrganization,
            });
          })
          .catch(() => {
            if (localStorage.getItem("token") !== storedToken) return;
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
  }, [context.user, context.isLoading, context.isLoggingOut, pathname, router]);

  if (!context.user) {
    // Return a loading state while redirecting
    return {
      ...context,
      user: null as unknown as User, // Temporary until redirect completes
    };
  }

  return {
    ...context,
    user: context.user, // TypeScript now knows user is non-null
  };
}
