"use client";

import { useEffect, useMemo, useState } from "react";
import { getDocumentById, getDocumentPreviewUrl, type Document } from "@/lib/documents.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DocumentViewerProps {
  documentId: string;
  expiresInSeconds?: number;
}

export function DocumentViewer({ documentId, expiresInSeconds = 300 }: DocumentViewerProps) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docResp, previewResp] = await Promise.all([
          getDocumentById(documentId),
          getDocumentPreviewUrl(documentId, expiresInSeconds),
        ]);
        if (!mounted) return;
        setDoc(docResp);
        setPreviewUrl(previewResp.url);
        setExpiresAt(previewResp.expiresAt);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Unable to load document");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [documentId, expiresInSeconds]);

  const kind = useMemo(() => {
    const mime = doc?.mimeType?.toLowerCase() || "";
    const ext = doc?.name?.toLowerCase().split(".").pop();
    if (mime.includes("pdf")) return "pdf";
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime === "text/plain") return "text";
    if (mime.includes("word") || mime.includes("officedocument") || ext === "docx") return "docx";
    return "other";
  }, [doc?.mimeType, doc?.name]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !doc || !previewUrl) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load</AlertTitle>
        <AlertDescription>{error || "Document preview is unavailable."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{doc.mimeType}</p>
          <h1 className="text-xl font-semibold leading-tight">{doc.name}</h1>
          {expiresAt && (
            <p className="text-xs text-muted-foreground">Preview expires at {new Date(expiresAt).toLocaleString()}</p>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        {kind === "pdf" && (
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-[80vh]"
            title="PDF preview"
          />
        )}
        {kind === "image" && (
          <div className="flex items-center justify-center bg-neutral-50">
            <img src={previewUrl} alt={doc.name} className="max-h-[80vh] object-contain" />
          </div>
        )}
        {kind === "video" && <video className="w-full h-[80vh]" controls src={previewUrl} />}
        {kind === "docx" && (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl!)}`}
            className="w-full h-96 border rounded"
            title={doc?.name}
          />
        )}
        {kind === "text" && <iframe src={previewUrl} className="w-full h-[80vh]" title="Text preview" />}
        {kind === "other" && (
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
          </div>
        )}
      </div>
    </div>
  );
}
