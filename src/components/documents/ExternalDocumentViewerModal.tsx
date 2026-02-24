"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getDocumentPreviewUrl } from "@/lib/documents.service";

interface ExternalDocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  documentName?: string;
  documentMimeType?: string;
  documentSize?: number;
}

export default function ExternalDocumentViewerModal({
  open,
  onClose,
  documentId,
  documentName,
  documentMimeType,
  documentSize,
}: ExternalDocumentViewerModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !documentId) {
      setPreviewUrl(null);
      return;
    }

    const fetchPreviewUrl = async () => {
      setLoading(true);
      try {
        // Get preview URL with longer expiry for external shares
        const preview = await getDocumentPreviewUrl(documentId, 600);
        setPreviewUrl(preview.url);
      } catch (error: any) {
        console.error("Failed to fetch preview URL:", error);
        toast.error("Failed to load document preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewUrl();
  }, [open, documentId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No preview available</p>
        </div>
      );
    }

    const fullUrl = previewUrl;
    const mimeType = documentMimeType?.toLowerCase() || "";

    // PDF files - Direct preview via Cloudinary URL; hide toolbar
    if (mimeType.includes("pdf")) {
      const pdfUrl = `${fullUrl}#toolbar=0&navpanes=0&scrollbar=0`;
      return <iframe src={pdfUrl} className="w-full h-full border-0" title={documentName || "Document preview"} />;
    }

    // Image files - Direct display
    if (mimeType.includes("image")) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 p-4">
          <img src={fullUrl} alt={documentName || "Document"} className="max-w-full max-h-full object-contain" />
        </div>
      );
    }

    // Office documents (Word, Excel, PowerPoint)
    if (
      mimeType.includes("word") ||
      mimeType.includes("excel") ||
      mimeType.includes("powerpoint") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation") ||
      mimeType.includes("document")
    ) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 gap-4">
          <iframe src={fullUrl} className="w-full h-full border-0" title={documentName || "Document preview"} />
        </div>
      );
    }

    // Text files - Display as iframe
    if (mimeType.includes("text")) {
      return (
        <iframe src={fullUrl} className="w-full h-full border-0 bg-white" title={documentName || "Document preview"} />
      );
    }

    // Default: show message
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <p>Preview not available for this file type</p>
        <p className="text-sm">You can download this file using the link above</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isFullscreen
            ? "w-screen h-screen max-w-none max-h-none p-0 m-0 rounded-none"
            : "w-[95vw] h-[90vh] max-w-7xl p-0"
        } overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
            <div className="flex-1 min-w-0">
              <DialogTitle className="truncate">{documentName || "Document Viewer"}</DialogTitle>
              {documentSize && <p className="text-sm text-muted-foreground">{(documentSize / 1024).toFixed(2)} KB</p>}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Viewer Content */}
        <div className="overflow-hidden bg-gray-100 h-[85%]">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  );
}
