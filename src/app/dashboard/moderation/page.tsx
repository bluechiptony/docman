"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, AlertCircle, FileText, HelpCircle } from "lucide-react";
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

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReviews(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
      const response = await apiClient.get("/documents/review/statistics");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch review statistics:", error);
    }
  };

  const fetchReviews = async (status: string = "PENDING") => {
    try {
      setLoading(true);
      const endpoint = status === "PENDING" ? "/documents/review/pending" : `/documents/review/status/${status}`;
      const response = await apiClient.get(endpoint, {
        params: { page: 1, size: 20 },
      });
      setReviews(response.data || []);
    } catch (error: unknown) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReview) return;

    console.log("Approving review by user:", user.id);

    try {
      setLoading(true);
      await apiClient.patch(`/documents/review/${selectedReview.id}/approve`, {
        reviewedById: user.id, // Replace with actual user ID
        notes: approvalNotes,
      });
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
      await apiClient.patch(`/documents/review/${selectedReview.id}/reject`, {
        reviewedById: user.id, // Replace with actual user ID
        reason: rejectionReason,
        notes: rejectionNotes,
      });
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
          <CardTitle>Reviews</CardTitle>
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
                <div className="text-center py-8 text-gray-500">No reviews found</div>
              ) : (
                <div className="space-y-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(review.status)}
                            <h3 className="font-medium truncate">{review.document.name}</h3>
                            <Badge className={getStatusColor(review.status)}>{review.status.replace(/_/g, " ")}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Uploaded by: {review.document.uploadedBy.firstName} {review.document.uploadedBy.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()} at{" "}
                            {new Date(review.createdAt).toLocaleTimeString()}
                          </p>
                          {review.reason && <p className="text-sm text-red-600 mt-2">Reason: {review.reason}</p>}
                          {review.notes && <p className="text-sm text-gray-600 mt-2">Notes: {review.notes}</p>}
                        </div>
                        <Button size="sm" onClick={() => setSelectedReview(review)}>
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
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
