"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getExshareInfo, sendExshareOtp, verifyExshareOtp, getExshareAccess } from "@/lib/exshare.service";
import { getDocumentPreviewUrl } from "@/lib/documents.service";

export default function ExsharePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<null | {
    email: string;
    documentName: string;
    sharedBy: string;
    permission: "VIEW" | "EDIT";
  }>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const [docAccess, setDocAccess] = useState<null | { id: string; name: string; permission: "VIEW" | "EDIT" }>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        const preview = await getDocumentPreviewUrl(access.id, 600);
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

  if (loading) {
    return <div className="max-w-xl mx-auto p-6">Loading...</div>;
  }

  if (!info) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Link not available</h1>
        <p className="text-muted-foreground mt-2">This exshare link is invalid or has expired.</p>
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
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border rounded"
                  title={docAccess?.name || "Document"}
                />
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
