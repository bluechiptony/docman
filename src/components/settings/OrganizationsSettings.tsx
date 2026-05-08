"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth.provider";
import { Building2, Shield } from "lucide-react";
import { toast } from "sonner";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";
import AllOrganizationsView from "./AllOrganizationsView";
import { organizationsApi } from "@/api/organizations";

export default function OrganizationsSettings() {
  const { user, refreshUser } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [organizationName, setOrganizationName] = useState("");
  const [savingOrganizationName, setSavingOrganizationName] = useState(false);

  const isSuperAdmin = user?.authentication?.role === "SUPER_ADMIN";
  const isAdmin = user?.authentication?.role === "ADMINISTRATOR" || isSuperAdmin;
  const selectedOrganizationId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id;

  // If super admin, show all organizations view
  if (isSuperAdmin) {
    return <AllOrganizationsView />;
  }

  useEffect(() => {
    if (user?.organizations) {
      setOrganizations(user.organizations);
    }
  }, [user]);

  useEffect(() => {
    const activeOrganization = organizations.find((org) => org.id === selectedOrganizationId);
    setOrganizationName(activeOrganization?.name ?? "");
  }, [organizations, selectedOrganizationId]);

  const handleSaveOrganizationName = async () => {
    if (!isAdmin || !selectedOrganizationId) {
      toast.error("Only administrators can update organization name");
      return;
    }

    const trimmedName = organizationName.trim();
    if (trimmedName.length < 3) {
      toast.error("Organization name must be at least 3 characters");
      return;
    }

    if (trimmedName.length > 70) {
      toast.error("Organization name must not exceed 70 characters");
      return;
    }

    const currentName = organizations.find((org) => org.id === selectedOrganizationId)?.name ?? "";
    if (trimmedName === currentName) {
      toast.info("No changes to save");
      return;
    }

    setSavingOrganizationName(true);
    try {
      await organizationsApi.updateOrganization(selectedOrganizationId, { name: trimmedName });

      setOrganizations((prev) =>
        prev.map((org) => (org.id === selectedOrganizationId ? { ...org, name: trimmedName } : org)),
      );
      refreshUser();
      toast.success("Organization name updated successfully");
    } catch (error) {
      toast.error("Failed to update organization name");
    } finally {
      setSavingOrganizationName(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMINISTRATOR":
        return "bg-red-100 text-red-800";
      case "MANAGER":
        return "bg-yellow-100 text-yellow-800";
      case "EDITOR":
        return "bg-blue-100 text-blue-800";
      case "VIEWER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Organizations</h2>
          <p className="text-gray-600">Manage your organizations and view your role in each one</p>
        </div>
        <CreateOrganizationModal
          onSuccess={() => {
            // Optionally refresh or update
            window.location.reload();
          }}
        />
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You are not a member of any organizations yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-[#0A3A5C]" />
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <CardDescription className="text-sm">Organization ID: {org.id}</CardDescription>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(org.role)}`}>
                    {getRoleDisplayName(org.role)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>
                      Role: <strong>{getRoleDisplayName(org.role)}</strong>
                    </span>
                  </div>
                  {user?.selectedOrganization?.id === org.id && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-900">
                        <strong>✓ Currently Active</strong> - This is your current organization
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAdmin && selectedOrganizationId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization Profile</CardTitle>
            <CardDescription>Update the name of your currently active organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization-name">Organization Name</Label>
              <Input
                id="organization-name"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                placeholder="Enter organization name"
                disabled={savingOrganizationName}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveOrganizationName} disabled={savingOrganizationName}>
                {savingOrganizationName ? "Saving..." : "Save Organization Name"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organization Rights Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Administrator</h4>
            <p className="text-sm text-gray-700">
              Full access to all features including user management, settings, and moderation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Manager</h4>
            <p className="text-sm text-gray-700">
              Can manage documents, folders, and invite users. Cannot modify system settings.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Editor</h4>
            <p className="text-sm text-gray-700">
              Can view, create, and edit documents. Cannot delete or modify settings.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Viewer</h4>
            <p className="text-sm text-gray-700">
              Read-only access. Can view documents but cannot create, edit, or delete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
