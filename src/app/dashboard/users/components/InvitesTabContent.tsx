"use client";

import { useEffect, useMemo, useState } from "react";
import { useInvites } from "../hooks/useInvites";
import { InviteUserModal } from "./InviteUserModal";
import { BulkInviteModal } from "./BulkInviteModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import TablePaginationControls from "@/components/common/TablePaginationControls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Trash2, Copy, ExternalLink, Upload } from "lucide-react";
import Link from "next/link";

export function InvitesTabContent() {
  const { invites, loading, fetchPendingInvites, revokeInvite } = useInvites();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [bulkInviteModalOpen, setBulkInviteModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedInviteId, setSelectedInviteId] = useState<string | null>(null);
  const [selectedInviteEmail, setSelectedInviteEmail] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchPendingInvites();
  }, [fetchPendingInvites]);

  const totalPages = Math.max(1, Math.ceil(invites.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedInvites = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return invites.slice(startIndex, startIndex + pageSize);
  }, [invites, currentPage]);

  const handleRevokeClick = (inviteId: string, email: string) => {
    setSelectedInviteId(inviteId);
    setSelectedInviteEmail(email);
    setConfirmModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!selectedInviteId) return;
    setIsRevoking(true);
    try {
      await revokeInvite(selectedInviteId);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsRevoking(false);
    }
  };

  const getInviteLink = (token: string): string => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/accept-invite?token=${token}`;
  };

  const handleCopyLink = (token: string) => {
    const link = getInviteLink(token);
    navigator.clipboard.writeText(link);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
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
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button onClick={() => setBulkInviteModalOpen(true)} variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Bulk Import
        </Button>
        <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
          <Mail className="w-4 h-4" />
          Invite Staff
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Invitations sent to users ({invites.length})</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invitations...</div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending invitations</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Invited</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedInvites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{invite.email}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(invite.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{getStatusBadge(invite.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {invite.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(invite.token)}
                                className="gap-1"
                              >
                                <Copy className="w-4 h-4" />
                                {copiedId === invite.token ? "Copied!" : "Copy Link"}
                              </Button>
                              <Link href={getInviteLink(invite.token)}>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <ExternalLink className="w-4 h-4" />
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeClick(invite.id, invite.email)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && invites.length > 0 && (
            <div className="p-4 border-t">
              <TablePaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                showWhenSinglePage
              />
            </div>
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

      <ConfirmationModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Revoke Invitation"
        description="Are you sure you want to revoke this invitation?"
        message={`This will permanently revoke the invitation sent to ${selectedInviteEmail}. They will no longer be able to accept it.`}
        confirmText="Revoke"
        cancelText="Keep"
        isDestructive={true}
        isLoading={isRevoking}
        onConfirm={handleConfirmRevoke}
      />
    </div>
  );
}
