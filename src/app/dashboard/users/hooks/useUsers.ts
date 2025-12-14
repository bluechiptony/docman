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
    role: "ADMINISTRATOR" | "EDITOR" | "VIEWER";
    active: boolean;
  };
  organizations?: any[];
}

const TEST_USERS: User[] = [
  {
    id: "1",
    emailAddress: "alice@finserve.com",
    firstName: "Alice",
    lastName: "Johnson",
    createdAt: new Date("2025-10-19T19:41:06.102Z"),
    updatedAt: new Date("2025-10-19T19:41:06.102Z"),
    authentication: { role: "ADMINISTRATOR", active: true },
  },
  {
    id: "2",
    emailAddress: "bob@finserve.com",
    firstName: "Bob",
    lastName: "Smith",
    createdAt: new Date("2025-10-19T19:41:06.102Z"),
    updatedAt: new Date("2025-10-19T19:41:06.102Z"),
    authentication: { role: "EDITOR", active: true },
  },
  {
    id: "3",
    emailAddress: "carol@finserve.com",
    firstName: "Carol",
    lastName: "Danvers",
    createdAt: new Date("2025-10-19T19:41:06.102Z"),
    updatedAt: new Date("2025-10-19T19:41:06.102Z"),
    authentication: { role: "VIEWER", active: true },
  },
];

export function useUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/user/get/all");
      setUsers(response.data);
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
        prev.map((u) => (u.id === id ? { ...u, authentication: { ...u.authentication, active: false } } : u))
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
        prev.map((u) => (u.id === userId ? { ...u, authentication: { ...u.authentication, role } } : u))
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
    canInvite,
    canManageRoles,
    currentUser: user,
  };
}
