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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { clientsApi } from "@/api/clients";
import { useAuth } from "@/providers/auth.provider";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void;
}

interface Client {
  id: string;
  name: string;
}

export function InviteUserModal({
  open,
  onClose,
  onInviteSuccess,
}: InviteUserModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    undefined,
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // Get organizationId from user's selected organization
  const organizationId = user?.selectedOrganization?.id || "";
  const isManager = user?.authentication?.role === "MANAGER";

  useEffect(() => {
    if (open && organizationId) {
      fetchClients(organizationId);
    }
  }, [open, organizationId]);

  const fetchClients = async (orgId: string) => {
    setLoadingClients(true);
    try {
      const response = await clientsApi.getByOrganization(orgId, 1, 100);
      setClients(response?.data || []);
      setSelectedClientId(undefined); // Reset client selection when org changes
    } catch {
      // Don't show error toast for clients - it's optional
      setClients([]);
    } finally {
      setLoadingClients(false);
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

    if (!firstName.trim()) {
      toast.error("Please enter a first name");
      return;
    }

    if (!lastName.trim()) {
      toast.error("Please enter a last name");
      return;
    }

    if (!organizationId) {
      toast.error("Please select an organization");
      return;
    }

    if (isManager && !selectedClientId) {
      toast.error("Please select one of your assigned clients");
      return;
    }

    setLoading(true);

    try {
      const payload: {
        email: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        staffId?: string;
        organizationId: string;
        clientId?: string;
      } = {
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        organizationId,
      };
      if (middleName.trim()) payload.middleName = middleName.trim();
      if (staffId.trim()) payload.staffId = staffId.trim();
      if (selectedClientId) {
        payload.clientId = selectedClientId;
      }
      await apiClient.post("/auth/invite", payload);
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setStaffId("");
      setSelectedClientId(undefined);
      onClose();
      onInviteSuccess?.();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to send invitation. Please try again.";
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invite-first-name">First Name</Label>
              <Input
                id="invite-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={70}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-middle-name">
                Middle Name{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="invite-middle-name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                maxLength={100}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-last-name">Last Name</Label>
              <Input
                id="invite-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={70}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-staff-id">
                Staff ID{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="invite-staff-id"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                maxLength={100}
                disabled={loading}
              />
            </div>
          </div>

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
            <div className="text-sm font-medium p-2 border rounded-md bg-muted">
              {user?.selectedOrganization?.name || "No organization selected"}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">
              Assign to Client{" "}
              <span className="text-xs text-muted-foreground">
                {isManager ? "(required)" : "(optional)"}
              </span>
            </Label>
            {loadingClients ? (
              <div className="text-sm text-muted-foreground">
                Loading clients...
              </div>
            ) : (
              <>
                <Select
                  value={selectedClientId || ""}
                  onValueChange={(value) =>
                    setSelectedClientId(value || undefined)
                  }
                  disabled={loading || clients.length === 0}
                >
                  <SelectTrigger id="client">
                    <SelectValue
                      placeholder={
                        isManager
                          ? "Select an assigned client"
                          : "No client selected"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isManager && clients.length === 0 ? (
                  <p className="mt-2 text-sm text-amber-700">
                    No clients are assigned to you. Ask an administrator to
                    assign a client before inviting staff.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading || !organizationId || (isManager && !selectedClientId)
            }
          >
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
