"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";

export interface User {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  authentication: {
    role: "ADMINISTRATOR" | "MANAGER" | "EDITOR" | "VIEWER";
    active: boolean;
  };
  organizations?: any[];
}

interface UsersListResponse {
  data: User[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}

export function useUsers(searchQuery: string = "") {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / size));

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [page, size, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<UsersListResponse>("/user/get/all", {
        params: {
          page,
          size,
          ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
        },
      });

      setUsers(response.data?.data || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (id: string, role: "ADMINISTRATOR" | "EDITOR" | "VIEWER") => {
    try {
      await apiClient.patch(`/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, authentication: { ...u.authentication, role } } : u)));
      toast.success("Role updated successfully");
      return true;
    } catch (err: any) {
      console.error("Failed to update role:", err);
      toast.error(err.response?.data?.message || "Failed to update role");
      return false;
    }
  };

  const deactivateUser = async (id: string) => {
    try {
      await apiClient.post(`/users/${id}/deactivate`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, authentication: { ...u.authentication, active: false } } : u)),
      );
      toast.success("User deactivated");
      return true;
    } catch (err: any) {
      console.error("Failed to deactivate user:", err);
      toast.error(err.response?.data?.message || "Failed to deactivate user");
      return false;
    }
  };

  const inviteUser = async (email: string, role: "ADMINISTRATOR" | "EDITOR" | "VIEWER") => {
    try {
      const response = await apiClient.post("/users/invite", { emailAddress: email, role });
      setUsers((prev) => [...prev, response.data]);
      toast.success(`Invitation sent to ${email}`);
    } catch (err: any) {
      console.error("Failed to send invitation:", err);
      toast.error(err.response?.data?.message || "Failed to send invitation");
    }
  };

  const updateRole = async (userId: string, role: "ADMINISTRATOR" | "EDITOR" | "VIEWER") => {
    try {
      await apiClient.patch(`/users/${userId}/role`, { role });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, authentication: { ...u.authentication, role } } : u)),
      );
      toast.success("Role updated");
    } catch (err: any) {
      console.error("Failed to update role:", err);
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const canInvite = user?.authentication?.role === "ADMINISTRATOR";
  const canManageRoles = user?.authentication?.role === "ADMINISTRATOR";

  return {
    users,
    fetchUsers,
    updateUserRole,
    deactivateUser,
    updateRole,
    inviteUser,
    loading,
    page,
    size,
    total,
    totalPages,
    setPage,
    setSize,
    canInvite,
    canManageRoles,
    currentUser: user,
  };
}
