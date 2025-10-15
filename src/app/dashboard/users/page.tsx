"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import UserTable from "./components/UserTable";
import { useUsers } from "./hooks/useUsers";
import { useRoles } from "./hooks/useRoles";
import InviteUserDialog from "./components/InviteUserDialog";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const { users, loading, updateRole, deactivateUser , currentUser, inviteUser, canInvite, canManageRoles} = useUsers();
  const [isInviteOpen, setInviteOpen] = useState(false);

  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    const email = prompt("Enter email to invite:");
    if (!email) return;
    // await inviteUser(email);
  };

  return (
   <div className="flex flex-col gap-6 h-full p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage user roles and invitations
          </p>
        </div>

        {canInvite && (
          <Button onClick={handleInvite}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite User
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <p className="text-sm text-muted-foreground">
          Logged in as <span className="font-medium">{currentUser.name}</span> (
          {currentUser.role})
        </p>
      </div>

      <UserTable users={filtered} isLoading={loading} />

      <InviteUserDialog isOpen={isInviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
