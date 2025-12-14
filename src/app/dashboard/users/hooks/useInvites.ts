"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export interface Invite {
  id: string;
  email: string;
  token: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  createdAt: string;
  expiresAt: string;
  invitedBy?: string;
  acceptedAt?: string;
  revokedAt?: string;
}

export function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingInvites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/auth/invites");
      setInvites(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch invites:", error);
      toast.error("Failed to load pending invites");
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteUser = useCallback(
    async (email: string) => {
      try {
        const response = await apiClient.post("/auth/invite", { email });
        toast.success(`Invitation sent to ${email}`);
        // Refresh invites list
        await fetchPendingInvites();
        return response.data;
      } catch (error: any) {
        console.error("Failed to invite user:", error);
        const message = error.response?.data?.message || "Failed to send invitation";
        toast.error(message);
        throw error;
      }
    },
    [fetchPendingInvites]
  );

  const revokeInvite = useCallback(
    async (inviteId: string) => {
      try {
        await apiClient.post(`/auth/invites/${inviteId}/revoke`);
        toast.success("Invitation revoked");
        await fetchPendingInvites();
      } catch (error: any) {
        console.error("Failed to revoke invite:", error);
        toast.error("Failed to revoke invitation");
        throw error;
      }
    },
    [fetchPendingInvites]
  );

  return {
    invites,
    loading,
    fetchPendingInvites,
    inviteUser,
    revokeInvite,
  };
}
