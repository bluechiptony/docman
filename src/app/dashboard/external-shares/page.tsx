"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TablePaginationControls from "@/components/common/TablePaginationControls";
import { Clock, Mail, FileText, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ExternalShare = {
  id: string;
  token: string;
  recipientEmail: string;
  status: string;
  permission: "VIEW" | "EDIT";
  tokenExpiresAt: string;
  refreshRequestedAt?: string;
  refreshRequestNote?: string;
  createdAt: string;
  document: {
    id: string;
    name: string;
    organizationId: string;
  };
  sharedBy: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
};

type Stats = {
  total: number;
  expired: number;
  active: number;
  refreshRequests: number;
};

export default function ExternalSharesAdminPage() {
  const [shares, setShares] = useState<ExternalShare[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "refresh" | "expired">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [extendDialog, setExtendDialog] = useState<{ open: boolean; share: ExternalShare | null; days: string }>({
    open: false,
    share: null,
    days: "7",
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; share: ExternalShare | null }>({
    open: false,
    share: null,
  });

  const fetchShares = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (filter === "refresh") params.set("hasRefreshRequest", "true");
      if (filter === "expired") params.set("isExpired", "true");

      const response = await apiClient.get(`/admin/external-shares?${params.toString()}`);
      setShares(response.data.shares);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load external shares");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/admin/external-shares/stats");
      setStats(response.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchShares();
    fetchStats();
  }, [filter, page]);

  const handleExtend = async () => {
    if (!extendDialog.share) return;
    const days = parseInt(extendDialog.days, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      toast.error("Days must be between 1 and 365");
      return;
    }

    try {
      await apiClient.post(`/admin/external-shares/${extendDialog.share.token}/extend`, { days });
      toast.success(`Share extended by ${days} days`);
      setExtendDialog({ open: false, share: null, days: "7" });
      fetchShares();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to extend share");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.share) return;

    try {
      await apiClient.delete(`/admin/external-shares/${deleteDialog.share.token}`);
      toast.success("Share deleted successfully");
      setDeleteDialog({ open: false, share: null });
      fetchShares();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete share");
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">External Shares Management</h1>
        <p className="text-muted-foreground mt-1">Manage all external document shares and refresh requests</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Shares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.expired}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Refresh Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.refreshRequests}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
        >
          All Shares
        </Button>
        <Button
          variant={filter === "refresh" ? "default" : "outline"}
          onClick={() => {
            setFilter("refresh");
            setPage(1);
          }}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh Requests
        </Button>
        <Button
          variant={filter === "expired" ? "default" : "outline"}
          onClick={() => {
            setFilter("expired");
            setPage(1);
          }}
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          Expired
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : shares.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No external shares found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Shared By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shares.map((share) => (
                    <TableRow key={share.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{share.document.name}</p>
                            <p className="text-xs text-muted-foreground">{share.permission}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{share.recipientEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {share.sharedBy.firstName} {share.sharedBy.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{share.sharedBy.emailAddress}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={isExpired(share.tokenExpiresAt) ? "destructive" : "default"}>
                            {share.status}
                          </Badge>
                          {share.refreshRequestedAt && (
                            <Badge variant="outline" className="ml-1">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Refresh Req
                            </Badge>
                          )}
                        </div>
                        {share.refreshRequestNote && (
                          <p
                            className="text-xs text-muted-foreground mt-1 max-w-xs truncate"
                            title={share.refreshRequestNote}
                          >
                            Note: {share.refreshRequestNote}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className={isExpired(share.tokenExpiresAt) ? "text-red-600" : ""}>
                            {new Date(share.tokenExpiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExtendDialog({ open: true, share, days: "7" })}
                            title="Extend expiry"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: true, share })}
                            title="Delete share"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <TablePaginationControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        size="default"
        showWhenSinglePage
      />

      {/* Extend Dialog */}
      <Dialog
        open={extendDialog.open}
        onOpenChange={(open) => !open && setExtendDialog({ open: false, share: null, days: "7" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Share Expiry</DialogTitle>
            <DialogDescription>
              Extend the expiry for {extendDialog.share?.document.name} shared with {extendDialog.share?.recipientEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Extend by (days)</label>
            <Input
              type="number"
              min="1"
              max="365"
              value={extendDialog.days}
              onChange={(e) => setExtendDialog({ ...extendDialog, days: e.target.value })}
              placeholder="7"
            />
            <p className="text-xs text-muted-foreground mt-2">
              New expiry:{" "}
              {extendDialog.days && !isNaN(parseInt(extendDialog.days, 10))
                ? new Date(Date.now() + parseInt(extendDialog.days, 10) * 24 * 60 * 60 * 1000).toLocaleDateString()
                : "Invalid"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialog({ open: false, share: null, days: "7" })}>
              Cancel
            </Button>
            <Button onClick={handleExtend}>Extend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, share: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete External Share</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the share for {deleteDialog.share?.document.name} with{" "}
              {deleteDialog.share?.recipientEmail}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, share: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
