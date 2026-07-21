"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Share2, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getDocumentById, getDocumentPreviewUrl, downloadDocument, type Document } from "@/lib/documents.service";
import { PdfCanvasViewer } from "@/components/documents/PdfCanvasViewer";

interface DocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  documentName?: string;
  onShare?: () => void;
}

export default function DocumentViewerModal({
  open,
  onClose,
  documentId,
  documentName,
  onShare,
}: DocumentViewerModalProps) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !documentId) return;

    const fetchDocument = async () => {
      setLoading(true);
      try {
        const document = await getDocumentById(documentId);
        setDoc(document);

        // Pull a short-lived URL from the backend and use it directly for preview (no extra fetch to avoid CORS issues)
        const preview = await getDocumentPreviewUrl(documentId);
        setPreviewUrl(preview.url);
      } catch (error: any) {
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [open, documentId]);

  const handleDownload = async () => {
    if (!documentId) {
      toast.error("Document ID not available");
      return;
    }

    try {
      const downloadUrl = await downloadDocument(documentId);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = doc?.name || "download";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

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
    const mimeType = doc?.mimeType?.toLowerCase() || "";

    // PDF files - Direct preview via Cloudinary URL; hide toolbar to discourage download
    if (mimeType.includes("pdf")) {
      return <PdfCanvasViewer url={fullUrl} title={doc?.name || "Document preview"} />;
    }

    // Image files - Direct display
    if (mimeType.includes("image")) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 p-4">
          <img src={fullUrl} alt={doc?.name || "Document"} className="max-w-full max-h-full object-contain" />
        </div>
      );
    }

    // Office documents (Word, Excel, PowerPoint)
    // Cloudinary can serve these as embeddable content
    if (
      mimeType.includes("word") ||
      mimeType.includes("excel") ||
      mimeType.includes("powerpoint") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation") ||
      mimeType.includes("document")
    ) {
      // Try to display via iframe first
      // If the URL supports direct preview, this will work
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 gap-4">
          <iframe src={fullUrl} className="w-full h-full border-0" title={doc?.name || "Document preview"} />
        </div>
      );
    }

    // Text files - Display as iframe
    if (mimeType.includes("text")) {
      return (
        <iframe src={fullUrl} className="w-full h-full border-0 bg-white" title={doc?.name || "Document preview"} />
      );
    }

    // Default: show download option
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <p>Preview not available for this file type</p>
        <Button onClick={handleDownload} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download to view
        </Button>
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
          <div className="flex items-center justify-between px-6 py-3 border-b bg-white ">
            {/* <div className="flex items-center justify-between px-6 py-3 border-b bg-white h-[15%]"> */}
            {/* <div className=""> */}
            <div className="flex-1 min-w-0">
              <DialogTitle className="truncate">{doc?.name || documentName || "Document Viewer"}</DialogTitle>
              {doc?.size && <p className="text-sm text-muted-foreground">{(doc.size / 1024).toFixed(2)} KB</p>}
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

              {!doc?.mimeType?.toLowerCase().includes("pdf") && (
                <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              )}

              {onShare && (
                <Button variant="ghost" size="icon" onClick={onShare} title="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
              )}

              {/* <Button variant="ghost" size="icon" onClick={onClose} title="Close">
                <X className="h-4 w-4" />
              </Button> */}
            </div>
          </div>
        </DialogHeader>

        {/* Viewer Content */}

        <div className="overflow-hidden bg-gray-100 h-[85%]">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  );
}
