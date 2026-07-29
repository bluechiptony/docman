"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AssignableUserRole = "USER" | "MANAGER" | "ADMINISTRATOR";

const ROLE_OPTIONS: Array<{
  value: AssignableUserRole;
  label: string;
  description: string;
}> = [
  {
    value: "USER",
    label: "User",
    description: "Can access and upload documents in their assigned folder.",
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "Can manage documents for clients assigned to them.",
  },
  {
    value: "ADMINISTRATOR",
    label: "Administrator",
    description: "Can administer users, clients, folders, and documents.",
  },
];

interface UserRoleSectionProps {
  userId: string;
  currentRole: AssignableUserRole;
  canManage: boolean;
  onRoleUpdated: (role: AssignableUserRole) => void;
}

function getErrorMessage(error: unknown) {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
    "Unable to update this user's role"
  );
}

export function UserRoleSection({
  userId,
  currentRole,
  canManage,
  onRoleUpdated,
}: UserRoleSectionProps) {
  const [selectedRole, setSelectedRole] = useState<AssignableUserRole>(currentRole);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  const selectedOption = ROLE_OPTIONS.find((option) => option.value === selectedRole);
  const hasChanged = selectedRole !== currentRole;

  const updateRole = async () => {
    if (!hasChanged) return;

    setSaving(true);
    try {
      await apiClient.patch(`/user/${userId}/role`, { role: selectedRole });
      onRoleUpdated(selectedRole);
      toast.success(`User role updated to ${selectedOption?.label ?? selectedRole}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>User role</CardTitle>
            <CardDescription className="mt-1">
              Set what this user can access within DocMan.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="user-role" className="text-sm font-medium">
              Role
            </label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as AssignableUserRole)}
              disabled={!canManage || saving}
            >
              <SelectTrigger id="user-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canManage ? (
            <Button onClick={updateRole} disabled={!hasChanged || saving} className="sm:min-w-32">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update role
            </Button>
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground">{selectedOption?.description}</p>

        {!canManage ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            Only an administrator can update user roles and client assignments.
          </p>
        ) : currentRole === "MANAGER" && selectedRole !== "MANAGER" ? (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Changing this manager&apos;s role will remove their existing client assignments.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
