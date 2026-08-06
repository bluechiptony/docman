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
  client: {
    id: string;
    name: string;
  } | null;
}

function getErrorMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback;
}

export function useInvites(organizationId?: string) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingInvites = useCallback(async () => {
    if (!organizationId) {
      setInvites([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get("/auth/invites", {
        params: { organizationId },
      });
      setInvites(response.data || []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load pending invites"));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const revokeInvite = useCallback(
    async (inviteId: string) => {
      try {
        await apiClient.post(`/auth/invites/${inviteId}/revoke`, undefined, {
          params: { organizationId },
        });
        toast.success("Invitation revoked");
        await fetchPendingInvites();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to revoke invitation"));
        throw error;
      }
    },
    [fetchPendingInvites, organizationId],
  );

  return {
    invites,
    loading,
    fetchPendingInvites,
    revokeInvite,
  };
}
