"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { useAuthUser } from "@/providers/auth.provider";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
}

interface Organization {
  id: string;
  name: string;
}

export function CreateUserModal({ open, onClose, onUserCreated }: CreateUserModalProps) {
  const { user: authUser } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "ADMINISTRATOR", // Default to ADMINISTRATOR
    organizationIds: [] as string[],
  });

  // Check if current user is super admin and fetch organizations
  useEffect(() => {
    if (!open) return;

    const isSuperAdmin = authUser?.authentication?.role === "SUPER_ADMIN";
    setIsSuperAdmin(isSuperAdmin);

    // Fetch organizations for selection
    const fetchOrganizations = async () => {
      setLoadingOrgs(true);
      try {
        const response = await apiClient.get("/organizations");
        setOrganizations(response.data || []);
      } catch (error: any) {
        console.error("Failed to fetch organizations:", error);
        toast.error("Failed to load organizations");
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, [open, authUser]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    // For ADMINISTRATOR role, at least one organization must be selected
    if (formData.role === "ADMINISTRATOR" && formData.organizationIds.length === 0) {
      toast.error("Please select at least one organization for the admin");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        role: formData.role,
      };

      if (formData.role === "ADMINISTRATOR") {
        payload.organizationIds = formData.organizationIds;
      }

      await apiClient.post("/auth/create-user", payload);
      toast.success(`User created successfully! Activation email sent to ${formData.email}`);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "ADMINISTRATOR",
        organizationIds: [],
      });

      onClose();
      onUserCreated?.();
    } catch (error: any) {
      console.error("Failed to create user:", error);
      const message = error.response?.data?.message || "Failed to create user. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrganization = (orgId: string) => {
    setFormData((prev) => ({
      ...prev,
      organizationIds: prev.organizationIds.includes(orgId)
        ? prev.organizationIds.filter((id) => id !== orgId)
        : [...prev.organizationIds, orgId],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            {formData.role === "SUPER_ADMIN"
              ? "Create a new super admin account"
              : "Create a new admin account and assign to organizations"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={loading}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={loading}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="john@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Role Selection (only for super admins) */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role" disabled={loading}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMINISTRATOR">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Organization Selection (for ADMINISTRATOR role) */}
          {formData.role === "ADMINISTRATOR" && (
            <div className="space-y-2">
              <Label>Organizations</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {loadingOrgs ? (
                  <p className="text-sm text-muted-foreground">Loading organizations...</p>
                ) : organizations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No organizations available</p>
                ) : (
                  organizations.map((org) => (
                    <label key={org.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.organizationIds.includes(org.id)}
                        onChange={() => toggleOrganization(org.id)}
                        disabled={loading}
                        className="rounded"
                      />
                      <span className="text-sm">{org.name}</span>
                    </label>
                  ))
                )}
              </div>
              {formData.organizationIds.length === 0 && (
                <p className="text-xs text-amber-600">Please select at least one organization</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
