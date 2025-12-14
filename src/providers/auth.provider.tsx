"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "@/api/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  authentication: {
    role: "ADMINISTRATOR" | "EDITOR" | "VIEWER";
    active: boolean;
  };
  organizations?: any[];
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

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const extractedUser = extractUserFromToken(storedToken);
      if (extractedUser) {
        setUser(extractedUser);
        setToken(storedToken);
      } else {
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
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

      // Update state
      setToken(accessToken);
      setUser(decodedUser);

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Logged out successfully");
    router.push("/login");
  };

  const refreshUser = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const extractedUser = extractUserFromToken(storedToken);
      if (extractedUser) {
        setUser(extractedUser);
        return;
      }
    }
    logout();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshUser,
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
