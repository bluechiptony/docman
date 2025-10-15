// components/users/UserTable.tsx
"use client";

import { useState } from "react";
import { User, useUsers } from "../hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Shield } from "lucide-react";
import clsx from "clsx";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
}

export default function UserTable({ users, isLoading }: UserTableProps) {
  const { updateRole } = useUsers();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading users...
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-400">
        No users found
      </div>
    );
  }

  const handleRoleChange = async (userId: string, role: string) => {
    setSelectedUser(userId);
    await updateRole(userId, role);
    setSelectedUser(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "invited":
        return <Badge className="bg-yellow-100 text-yellow-800">Invited</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Role</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
            <th className="text-right px-4 py-2 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{user.name || "—"}</td>
              <td className="px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3">
                <Badge className={clsx("capitalize", getRoleBadgeColor(user.role))}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      disabled={selectedUser === user.id}
                      onClick={() => handleRoleChange(user.id, "viewer")}
                    >
                      👁 Viewer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={selectedUser === user.id}
                      onClick={() => handleRoleChange(user.id, "editor")}
                    >
                      ✏️ Editor
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={selectedUser === user.id}
                      onClick={() => handleRoleChange(user.id, "admin")}
                    >
                      🛡 Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
