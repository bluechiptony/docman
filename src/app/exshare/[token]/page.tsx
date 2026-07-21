"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Clock } from "lucide-react";
import {
  getExshareInfo,
  sendExshareOtp,
  verifyExshareOtp,
  getExshareAccess,
  getExsharePreviewUrl,
  requestExshareRefresh,
} from "@/lib/exshare.service";
import { PdfCanvasViewer } from "@/components/documents/PdfCanvasViewer";

export default function ExsharePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<null | {
    email: string;
    documentName: string;
    sharedBy: string;
    permission: "VIEW" | "EDIT";
    expiresAt: string;
    isExpired: boolean;
    hasRefreshRequest: boolean;
  }>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const [docAccess, setDocAccess] = useState<null | { id: string; name: string; permission: "VIEW" | "EDIT" }>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showRefreshForm, setShowRefreshForm] = useState(false);
  const [refreshNote, setRefreshNote] = useState("");
  const [requestingRefresh, setRequestingRefresh] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const share = await getExshareInfo(token);
        setInfo(share);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Invalid or expired link");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSendOtp = async () => {
    try {
      await sendExshareOtp(token);
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setVerifying(true);
    try {
      await verifyExshareOtp(token, otp.trim());
      setVerified(true);
      toast.success("OTP verified");

      // Fetch access + preview URL
      const access = await getExshareAccess(token);
      setDocAccess(access);
      try {
        const preview = await getExsharePreviewUrl(token);
        setPreviewUrl(preview.url);
      } catch (e) {
        setPreviewUrl(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestRefresh = async () => {
    setRequestingRefresh(true);
    try {
      await requestExshareRefresh(token, refreshNote.trim() || undefined);
      toast.success("Refresh request submitted. You will be notified when the link is extended.");
      setInfo({ ...info!, hasRefreshRequest: true });
      setShowRefreshForm(false);
      setRefreshNote("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to request refresh");
    } finally {
      setRequestingRefresh(false);
    }
  };

  if (loading) {
    return <div className="max-w-xl mx-auto p-6">Loading...</div>;
  }

  if (!info) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Link not available</h1>
        <p className="text-muted-foreground mt-2">This exshare link is invalid or has been removed.</p>
      </div>
    );
  }

  // Show expired state
  if (info.isExpired) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Document Share Expired</h1>
          <p className="text-muted-foreground mt-1">This share link has expired.</p>
        </div>

        <div className="rounded-lg border p-6 bg-white">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">Link Expired</p>
              <p className="text-sm text-muted-foreground mt-1">
                The share link for <span className="font-medium">{info.documentName}</span> expired on{" "}
                {new Date(info.expiresAt).toLocaleString()}.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Shared By</p>
                <p className="font-medium">{info.sharedBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Email</p>
                <p className="font-medium">{info.email}</p>
              </div>
            </div>
          </div>

          {info.hasRefreshRequest ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Refresh Request Pending</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your refresh request has been submitted. You'll receive an email when the administrator extends this
                    link.
                  </p>
                </div>
              </div>
            </div>
          ) : !showRefreshForm ? (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                If you still need access to this document, request the administrator to extend the link.
              </p>
              <Button onClick={() => setShowRefreshForm(true)} variant="default">
                Request Link Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Optional Note <span className="text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  placeholder="Add a note explaining why you need continued access..."
                  value={refreshNote}
                  onChange={(e) => setRefreshNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{refreshNote.length}/500</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRequestRefresh} disabled={requestingRefresh}>
                  {requestingRefresh ? "Submitting..." : "Submit Request"}
                </Button>
                <Button onClick={() => setShowRefreshForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Document Share</h1>
        <p className="text-muted-foreground mt-1">You have been shared a document via email.</p>
      </div>

      <div className="rounded-lg border p-4 bg-white">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Document</p>
          <p className="text-lg font-semibold">{info.documentName}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Shared By</p>
            <p className="font-medium">{info.sharedBy}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Permission</p>
            <p className="font-medium">{info.permission}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expires</p>
            <p className="font-medium">{new Date(info.expiresAt).toLocaleString()}</p>
          </div>
        </div>

        {!verified ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm">
              We will send a one-time code to: <span className="font-medium">{info.email}</span>
            </p>
            {!otpSent ? (
              <Button onClick={handleSendOtp}>Send OTP</Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={handleVerifyOtp} disabled={verifying}>
                  {verifying ? "Verifying..." : "Verify"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            {previewUrl ? (
              <div>
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">Preview</p>
                </div>
                {docAccess?.name.toLowerCase().endsWith(".pdf") ? (
                  <PdfCanvasViewer
                    url={previewUrl}
                    title={docAccess.name}
                    className="h-[70vh] rounded border"
                  />
                ) : (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] border rounded"
                    title={docAccess?.name || "Document"}
                  />
                )}
              </div>
            ) : (
              <div className="p-4 border rounded text-sm">
                <p>Preview not available. Try downloading instead.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
