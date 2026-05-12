"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Mail, Loader, Plus, Building2, HelpCircle } from "lucide-react";
import UserTable from "./components/UserTable";
import { InvitesTabContent } from "./components/InvitesTabContent";
// import { ClientListTab } from "./components/ClientListTab";
import { CreateUserModal } from "./components/CreateUserModal";
import { useUsers } from "./hooks/useUsers";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, useAuthUser } from "@/providers/auth.provider";
import { useManagerAccess } from "@/hooks/useManagerAccess";
import { ClientListTab } from "./components/ClientListTab";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const { users, loading, updateRole, page, setPage, size, setSize, totalPages } = useUsers(search);
  const { user } = useAuth();
  const { user: authUser } = useAuthUser();
  const { hasAccess, loading: checkingAccess } = useManagerAccess();
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

  const isSuperAdmin =
    authUser?.authentication?.role === "SUPER_ADMIN" ||
    authUser?.authentication?.role === "ADMINISTRATOR" ||
    authUser?.authentication?.role === "MANAGER";

  const isManager = authUser?.authentication?.role === "MANAGER";

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage user roles and staff invitations</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/help/admin/users" className="inline-flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={isManager ? "invites" : "users"} className="w-full">
        <TabsList className={`grid w-full max-w-2xl ${isManager ? "grid-cols-1" : "grid-cols-3"}`}>
          {!isManager && (
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          )}
          <TabsTrigger value="invites" className="gap-2">
            <Mail className="w-4 h-4" />
            Staff Invitations
          </TabsTrigger>
          {!isManager && (
            <TabsTrigger value="clients" className="gap-2">
              <Building2 className="w-4 h-4" />
              Client Assignments
            </TabsTrigger>
          )}
        </TabsList>

        {/* Users Tab */}
        {!isManager && (
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows</span>
                  <Select
                    value={String(size)}
                    onValueChange={(value) => {
                      setSize(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isSuperAdmin && (
                  <Button onClick={() => setCreateUserOpen(true)} className="gap-2" size="sm">
                    <Plus className="w-4 h-4" />
                    Create User
                  </Button>
                )}
                {/* <p className="text-sm text-muted-foreground">
                  Logged in as <span className="font-medium">{user?.firstName}</span> ({user?.authentication?.role})
                </p> */}
              </div>
            </div>
            <UserTable
              users={users}
              isLoading={loading}
              onRoleChange={updateRole}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </TabsContent>
        )}

        {/* Invites Tab */}
        <TabsContent value="invites">
          <InvitesTabContent />
        </TabsContent>

        {/* Client Assignments Tab */}
        {!isManager && (
          <TabsContent value="clients">
            <ClientListTab />
          </TabsContent>
        )}
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
