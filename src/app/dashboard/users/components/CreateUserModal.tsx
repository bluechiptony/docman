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
import { useAuth, useAuthUser } from "@/providers/auth.provider";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
}

export function CreateUserModal({ open, onClose, onUserCreated }: CreateUserModalProps) {
  const { user } = useAuth();
  const { user: authUser } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "ADMINISTRATOR", // Default to ADMINISTRATOR
  });

  // Check if current user is super admin
  useEffect(() => {
    if (!open) return;

    const isSuperAdmin = authUser?.authentication?.role === "SUPER_ADMIN";
    setIsSuperAdmin(isSuperAdmin);
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

    // For ADMINISTRATOR and MANAGER roles, ensure organization is selected
    if ((formData.role === "ADMINISTRATOR" || formData.role === "MANAGER") && !user?.selectedOrganization) {
      toast.error("Organization is required for this role");
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

      // Automatically assign selected organization
      if ((formData.role === "ADMINISTRATOR" || formData.role === "MANAGER") && user?.selectedOrganization) {
        payload.organizationIds = [user.selectedOrganization.id];
      }

      await apiClient.post("/auth/create-user", payload);
      toast.success(`User created successfully! Activation email sent to ${formData.email}`);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "ADMINISTRATOR",
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
              : formData.role === "ADMINISTRATOR"
                ? "Create a new admin account and assign to organizations"
                : "Create a new manager account and assign to clients"}
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
                  <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
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
