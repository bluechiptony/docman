"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TablePaginationControls from "@/components/common/TablePaginationControls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, AlertCircle, HelpCircle } from "lucide-react";
import { useAuthUser } from "@/providers/auth.provider";
import { getDocumentPreviewUrl } from "@/lib/documents.service";

interface DocumentReview {
  id: string;
  documentId: string;
  status: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  document: {
    id: string;
    name: string;
    mimeType: string;
    folderId?: string;
    documentTypeId?: string;
    folder?: {
      id: string;
      name: string;
    };
    documentType?: {
      id: string;
      name: string;
    };
    uploadedBy: {
      id: string;
      firstName: string;
      lastName: string;
      emailAddress: string;
    };
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ReviewStats {
  PENDING?: number;
  APPROVED?: number;
  REJECTED?: number;
  FLAGGED_FOR_REVIEW?: number;
  UNDER_REVIEW?: number;
}

export default function ModerationDashboard() {
  const { user } = useAuthUser();
  const [reviews, setReviews] = useState<DocumentReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({});
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<DocumentReview | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [activeTab, setActiveTab] = useState("PENDING");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (user && (user.authentication.role === "SUPER_ADMIN" || user.selectedOrganization?.id)) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.authentication?.role, user?.selectedOrganization?.id]);

  useEffect(() => {
    if (user && (user.authentication.role === "SUPER_ADMIN" || user.selectedOrganization?.id)) {
      fetchReviews(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, perPage, user?.authentication?.role, user?.selectedOrganization?.id]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, perPage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (selectedReview) {
      setPreviewLoading(true);
      setPreviewUrl(null);
      getDocumentPreviewUrl(selectedReview.documentId, 600)
        .then((res) => setPreviewUrl(res.url))
        .catch(() => toast.error("Failed to load document preview"))
        .finally(() => setPreviewLoading(false));
    } else {
      setPreviewUrl(null);
    }
  }, [selectedReview]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/documents/review/statistics", {
        params: user?.selectedOrganization?.id ? { organizationId: user.selectedOrganization.id } : {},
      });

      setStats(response.data);
    } catch {}
  };

  const fetchReviews = async (status: string = "PENDING") => {
    try {
      setLoading(true);
      const endpoint = status === "PENDING" ? "/documents/review/pending" : `/documents/review/status/${status}`;
      const response = await apiClient.get(endpoint, {
        params: {
          page,
          size: perPage,
          ...(user?.selectedOrganization?.id ? { organizationId: user.selectedOrganization.id } : {}),
        },
      });

      setReviews(response.data?.data || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReview) return;

    try {
      setLoading(true);
      await apiClient.patch(
        `/documents/review/${selectedReview.id}/approve`,
        { notes: approvalNotes },
        { params: user?.selectedOrganization?.id ? { organizationId: user.selectedOrganization.id } : {} },
      );
      toast.success("Document approved");
      setSelectedReview(null);
      setApprovalNotes("");
      fetchStats();
      fetchReviews(activeTab);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to approve document");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReview || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setLoading(true);
      await apiClient.patch(
        `/documents/review/${selectedReview.id}/reject`,
        { reason: rejectionReason, notes: rejectionNotes },
        { params: user?.selectedOrganization?.id ? { organizationId: user.selectedOrganization.id } : {} },
      );
      toast.success("Document rejected");
      setSelectedReview(null);
      setRejectionReason("");
      setRejectionNotes("");
      fetchStats();
      fetchReviews(activeTab);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to reject document");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "FLAGGED_FOR_REVIEW":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FLAGGED_FOR_REVIEW":
        return "bg-orange-100 text-orange-800";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExtension = (name: string) => {
    return (name || "").split(".").pop()?.toLowerCase() || "";
  };

  const renderPreview = () => {
    if (previewLoading) {
      return (
        <div className="p-4 border rounded text-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 inline-block"></div>
          <p className="text-gray-600 mt-2">Loading preview...</p>
        </div>
      );
    }

    const src = previewUrl ?? null;
    const docName = selectedReview?.document?.name ?? "";
    const ext = getExtension(docName);

    if (!src) {
      return (
        <div className="p-4 border rounded text-sm">
          <p>No preview available.</p>
        </div>
      );
    }

    // Images
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext)) {
      return (
        <div className="flex items-center justify-center bg-gray-50 border rounded overflow-hidden max-h-[70vh]">
          <img src={src} alt={docName} className="w-full h-auto object-contain" loading="lazy" />
        </div>
      );
    }

    // PDF
    if (ext === "pdf") {
      return <iframe src={src} className="w-full h-[60vh] border rounded" title={docName} />;
    }

    // Office files (docx, xlsx, pptx) - use Office Web Viewer
    if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
      const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`;
      return <iframe src={officeViewer} className="w-full h-[70vh] border rounded" title={docName} />;
    }

    // Fallback
    return (
      <div className="p-4 border rounded text-sm">
        <p>Preview not available for this file type.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Moderation</h1>
          <p className="text-gray-600 mt-1">Review and approve/reject uploaded documents</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/help/admin/moderation" className="inline-flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.PENDING || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.APPROVED || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.REJECTED || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.FLAGGED_FOR_REVIEW || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.UNDER_REVIEW || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Reviews</CardTitle>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-sm text-muted-foreground">Rows</span>
              <select
                value={perPage}
                onChange={(event) => setPerPage(Number(event.target.value))}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="UNDER_REVIEW">Under Review</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              <TabsTrigger value="FLAGGED_FOR_REVIEW">Flagged</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {user?.authentication?.role === "MANAGER"
                    ? "No reviews found for your assigned clients"
                    : "No reviews found"}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4">Document</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="px-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="px-4">
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate max-w-[280px]">
                                {review.document.name}
                              </div>
                              <div className="text-xs text-muted-foreground">{review.document.mimeType}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(review.status)}
                              <Badge className={getStatusColor(review.status)}>
                                {review.status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <div className="truncate max-w-[220px]">
                                {review.document.uploadedBy.firstName} {review.document.uploadedBy.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                                {review.document.uploadedBy.emailAddress}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <div className="truncate max-w-[180px]">{review.document.folder?.name || "-"}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {review.document.documentType?.name || "No type"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}{" "}
                            {new Date(review.createdAt).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0 max-w-[260px] text-sm text-muted-foreground">
                              {review.reason ? (
                                <div className="truncate text-red-600">Reason: {review.reason}</div>
                              ) : null}
                              {review.notes ? <div className="truncate">Notes: {review.notes}</div> : <span>-</span>}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-right">
                            <Button size="sm" onClick={() => setSelectedReview(review)}>
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="border-t p-4">
                    <TablePaginationControls
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      showWhenSinglePage
                    />
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Details Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="max-w-7xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="flex gap-4 h-[calc(90vh-120px)]">
              {/* Left Side: Document Preview */}
              <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100">{renderPreview()}</div>

              {/* Right Side: Review Controls */}
              <div className="w-96 flex flex-col space-y-4 overflow-y-auto">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-medium">Document Details</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <strong>Name:</strong> {selectedReview.document.name}
                    </p>
                    {selectedReview.document.folder && (
                      <p className="text-gray-600">
                        <strong>Folder:</strong> {selectedReview.document.folder.name}
                      </p>
                    )}
                    {selectedReview.document.documentType && (
                      <p className="text-gray-600">
                        <strong>Document Type:</strong> {selectedReview.document.documentType.name}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <strong>Type:</strong> {selectedReview.document.mimeType}
                    </p>
                    <p className="text-gray-600">
                      <strong>Uploaded by:</strong> {selectedReview.document.uploadedBy.firstName}{" "}
                      {selectedReview.document.uploadedBy.lastName}
                    </p>
                    <p className="text-gray-600 text-xs">{selectedReview.document.uploadedBy.emailAddress}</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <strong>Status:</strong>
                      <Badge className={getStatusColor(selectedReview.status)}>
                        {selectedReview.status.replace(/_/g, " ")}
                      </Badge>
                    </p>
                  </div>
                </div>

                {selectedReview.status === "PENDING" || selectedReview.status === "UNDER_REVIEW" ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Approval Notes (optional)</label>
                      <Input
                        placeholder="Add any notes about approving this document..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Rejection Reason (optional)</label>
                      <Input
                        placeholder="Explain why this document is being rejected..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Additional Notes (optional)</label>
                      <Input
                        placeholder="Any additional notes..."
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                      <Button onClick={handleApprove} disabled={loading} className="w-full">
                        {loading ? "Approving..." : "Approve Document"}
                      </Button>
                      <Button variant="destructive" onClick={handleReject} disabled={loading} className="w-full">
                        {loading ? "Rejecting..." : "Reject Document"}
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedReview(null)} className="w-full">
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="pt-4">
                    <Button variant="outline" onClick={() => setSelectedReview(null)} className="w-full">
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
