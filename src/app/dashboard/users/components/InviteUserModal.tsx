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
import { useAuth } from "@/providers/auth.provider";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export function InviteUserModal({ open, onClose, onInviteSuccess }: InviteUserModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const isSuperAdmin = user?.authentication?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (open) {
      fetchOrganizations();
    }
  }, [open]);

  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      if (isSuperAdmin) {
        // Super admins get all organizations
        const response = await apiClient.get("/organizations/admin/all");
        setOrganizations(response.data);
      } else {
        // Regular admins get their organizations
        const response = await apiClient.get("/organizations");
        setOrganizations(response.data);
        // Auto-select first organization for non-super-admins
        if (response.data.length > 0) {
          setOrganizationId(response.data[0].id);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch organizations:", error);
      toast.error("Failed to load organizations");
    } finally {
      setLoadingOrgs(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validate email
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!organizationId) {
      toast.error("Please select an organization");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/auth/invite", { email, organizationId });
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setOrganizationId("");
      onClose();
      onInviteSuccess?.();
    } catch (error: any) {
      console.error("Failed to send invite:", error);
      const message = error.response?.data?.message || "Failed to send invitation. Please try again.";
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
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>Send an invitation to a new user via email</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="user@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            {loadingOrgs ? (
              <div className="text-sm text-muted-foreground">Loading organizations...</div>
            ) : isSuperAdmin ? (
              <Select value={organizationId} onValueChange={setOrganizationId} disabled={loading}>
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={organizationId} onValueChange={setOrganizationId} disabled={loading}>
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !organizationId}>
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
