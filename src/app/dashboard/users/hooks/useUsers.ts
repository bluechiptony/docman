"use client";

import { useState, useCallback, useEffect } from "react";

import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: "active" | "invited" | "pending";
}

const TEST_USERS: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@company.com", role: "admin", status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@company.com", role: "editor", status: "active" },
  { id: "3", name: "Carol Danvers", email: "carol@company.com", role: "viewer", status: "active" },
  { id: "4", name: "David Kim", email: "david@company.com", role: "viewer", status: "invited" },
  { id: "5", name: "Evelyn Cruz", email: "evelyn@company.com", role: "viewer", status: "pending" },
];
export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  // Simulate the current logged-in user (admin)
  const currentUser: User = TEST_USERS[0]; // Alice Johnson (Admin)

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers(TEST_USERS);
      setLoading(false);
    }, 500);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  const updateUserRole = async (id: string, role: string) => {
    const res = await fetch(`/api/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      return true;
    }
    return false;
  };

  const deactivateUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}/deactivate`, { method: "POST" });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: false } : u)));
      return true;
    }
    return false;
  };

  const inviteUser = async (email: string, role: string) => {
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) throw new Error("Invite failed");

      const invited = await res.json();
      setUsers((prev) => [...prev, invited]);
      toast.success(`Invitation sent to ${email}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invitation");
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Role update failed");

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      toast.success("Role updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  const canInvite = currentUser.role === "admin";
  const canManageRoles = currentUser.role === "admin";

  return { users, fetchUsers, updateUserRole, deactivateUser, updateRole, inviteUser, loading, canInvite, canManageRoles , currentUser};
}
