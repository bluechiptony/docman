// components/users/UserTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "../hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TablePaginationControls from "@/components/common/TablePaginationControls";
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
  onRoleChange: (userId: string, role: "ADMINISTRATOR" | "EDITOR" | "VIEWER") => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function UserTable({
  users,
  isLoading,
  onRoleChange,
  currentPage,
  totalPages,
  onPageChange,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const router = useRouter();

  if (isLoading) {
    return <div className="flex justify-center items-center h-40 text-gray-500">Loading users...</div>;
  }

  if (!users.length) {
    return <div className="flex justify-center items-center h-40 text-gray-400">No users found</div>;
  }

  const handleRoleChange = async (userId: string, role: string) => {
    setSelectedUser(userId);
    await onRoleChange(userId, role as "ADMINISTRATOR" | "EDITOR" | "VIEWER");
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

  const getStatusBadge = (status?: boolean) => {
    switch (status) {
      case true:
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      // case "invited":
      // return <Badge className="bg-yellow-100 text-yellow-800">Invited</Badge>;
      case false:
        return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>;
      default:
        return null;
    }
  };

  const handleRowClick = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
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
            <tr
              key={user.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleRowClick(user.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRowClick(user.id);
                }
              }}
            >
              <td className="px-4 py-3 font-medium text-gray-800">
                {user.firstName || "—"} {user.lastName || "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">{user.emailAddress}</td>
              <td className="px-4 py-3">
                <Badge className={clsx("capitalize", getRoleBadgeColor(user.authentication.role))}>
                  {user.authentication.role}
                </Badge>
              </td>
              <td className="px-4 py-3">{getStatusBadge(user.authentication.active)}</td>
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      disabled={selectedUser === user.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, "viewer");
                      }}
                    >
                      👁 Viewer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={selectedUser === user.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, "editor");
                      }}
                    >
                      ✏️ Editor
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={selectedUser === user.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, "admin");
                      }}
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

      <div className="p-4 border-t">
        <TablePaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          showWhenSinglePage
        />
      </div>
    </div>
  );
}
