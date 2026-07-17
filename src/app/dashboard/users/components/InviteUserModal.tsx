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
import { clientsApi } from "@/api/clients";
import { useAuth, useAuthUser } from "@/providers/auth.provider";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void;
}

interface Client {
  id: string;
  name: string;
}

export function InviteUserModal({ open, onClose, onInviteSuccess }: InviteUserModalProps) {
  const { user } = useAuth();
  const { user: authUser } = useAuthUser();
  const [email, setEmail] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // Get organizationId from user's selected organization
  const organizationId = user?.selectedOrganization?.id || "";

  // Log every render to confirm component is alive
  useEffect(() => {});

  useEffect(() => {
    if (open && organizationId) {
      fetchClients(organizationId);
    }
  }, [open, organizationId]);

  const fetchClients = async (orgId: string) => {
    setLoadingClients(true);
    try {
      let clients: Client[] = [];

      if (authUser?.authentication?.role === "MANAGER") {
        // For managers, fetch only assigned clients

        const assignedResponse = await apiClient.get(`/user/${authUser.id}/clients`);
        clients = assignedResponse.data || [];
      } else {
        // For admins/super admins, fetch all clients in organization

        const response = await clientsApi.getByOrganization(orgId);
        clients = response?.data || [];
      }

      setClients(clients);
      setSelectedClientId(undefined); // Reset client selection when org changes
    } catch (error: any) {
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

    if (!organizationId) {
      toast.error("Please select an organization");
      return;
    }

    setLoading(true);

    try {
      const payload: any = { email, organizationId };
      if (selectedClientId) {
        payload.clientId = selectedClientId;
      }
      await apiClient.post("/auth/invite", payload);
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setSelectedClientId(undefined);
      onClose();
      onInviteSuccess?.();
    } catch (error: any) {
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
            <div className="text-sm font-medium p-2 border rounded-md bg-muted">
              {user?.selectedOrganization?.name || "No organization selected"}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">
              Assign to Client <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            {loadingClients ? (
              <div className="text-sm text-muted-foreground">Loading clients...</div>
            ) : (
              <Select
                value={selectedClientId || ""}
                onValueChange={(value) => setSelectedClientId(value || undefined)}
                disabled={loading}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="No client selected" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No clients available
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
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
