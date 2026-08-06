"use client";

import { useEffect, useState } from "react";
import { useInvites } from "../hooks/useInvites";
import { InviteUserModal } from "./InviteUserModal";
import { BulkInviteModal } from "./BulkInviteModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/providers/auth.provider";

export function InvitesPage() {
  const { user } = useAuth();
  const { invites, loading, fetchPendingInvites, revokeInvite } = useInvites(user?.selectedOrganization?.id);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [bulkInviteModalOpen, setBulkInviteModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingInvites();
  }, [fetchPendingInvites]);

  const handleRevokeInvite = async (inviteId: string, email: string) => {
    if (confirm(`Revoke invitation for ${email}?`)) {
      try {
        await revokeInvite(inviteId);
      } catch {
        // Error already handled in hook
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50">
            Pending
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="outline" className="bg-green-50">
            Accepted
          </Badge>
        );
      case "REVOKED":
        return (
          <Badge variant="outline" className="bg-red-50">
            Revoked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Invitations</h1>
          <p className="text-muted-foreground mt-2">Manage pending and sent user invitations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setBulkInviteModalOpen(true)} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
          <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
            <Mail className="w-4 h-4" />
            Invite User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Invitations sent to users ({invites.length})</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invitations...</div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending invitations</div>
          ) : (
            <ScrollArea className="w-full">
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {invite.client?.name ?? "Not assigned"} · Invited{" "}
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(invite.status)}
                      {invite.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeInvite(invite.id, invite.email)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <InviteUserModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInviteSuccess={() => fetchPendingInvites()}
      />

      <BulkInviteModal
        open={bulkInviteModalOpen}
        onClose={() => setBulkInviteModalOpen(false)}
        onInviteSuccess={() => fetchPendingInvites()}
      />
    </div>
  );
}
