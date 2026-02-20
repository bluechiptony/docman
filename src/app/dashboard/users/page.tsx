"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Mail, Loader, Plus, Building2 } from "lucide-react";
import UserTable from "./components/UserTable";
import { InvitesTabContent } from "./components/InvitesTabContent";
import { ClientListTab } from "./components/ClientListTab";
import { CreateUserModal } from "./components/CreateUserModal";
import { useUsers } from "./hooks/useUsers";
import { Input } from "@/components/ui/input";
import { useAuth, useAuthUser } from "@/providers/auth.provider";
import { useAdminAccess } from "@/hooks/useAdminAccess";

export default function UsersPage() {
  const { users, loading, updateRole, deactivateUser, currentUser, canManageRoles } = useUsers();
  const { user } = useAuth();
  const { user: authUser } = useAuthUser();
  const { hasAccess, loading: checkingAccess } = useAdminAccess();
  const [search, setSearch] = useState("");
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-[#0A3A5C]" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const isSuperAdmin = authUser?.authentication?.role === "SUPER_ADMIN";

  const filtered = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.emailAddress.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage user roles and invitations</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="invites" className="gap-2">
            <Mail className="w-4 h-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2">
            <Building2 className="w-4 h-4" />
            Client Assignments
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex items-center gap-4">
              {isSuperAdmin && (
                <Button onClick={() => setCreateUserOpen(true)} className="gap-2" size="sm">
                  <Plus className="w-4 h-4" />
                  Create User
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                Logged in as <span className="font-medium">{user?.firstName}</span> ({user?.authentication?.role})
              </p>
            </div>
          </div>
          <UserTable users={filtered} isLoading={loading} />
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites">
          <InvitesTabContent />
        </TabsContent>

        {/* Client Assignments Tab */}
        <TabsContent value="clients">
          <ClientListTab />
        </TabsContent>
      </Tabs>

      {/* Create User Modal */}
      <CreateUserModal
        open={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
        onUserCreated={() => {
          // Refresh users list
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
