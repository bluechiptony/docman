"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Folder, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getFolderExshareAccess,
  getFolderExshareFolderContents,
  type FolderExshareAccess,
  type FolderExshareItem,
} from "@/lib/exshare.service";
import ExternalDocumentViewerModal from "@/components/documents/ExternalDocumentViewerModal";

export default function FolderExshareDocumentsPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token as string;
  const searchParams = useSearchParams();
  const router = useRouter();

  const folderId = searchParams.get("folderId");

  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<FolderExshareAccess | null>(null);
  const [items, setItems] = useState<FolderExshareItem[]>([]);
  const [currentFolderName, setCurrentFolderName] = useState<string>("Folder");

  // Modal state for document viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocName, setSelectedDocName] = useState<string>("");
  const [selectedDocMimeType, setSelectedDocMimeType] = useState<string>("");
  const [selectedDocSize, setSelectedDocSize] = useState<number>(0);

  useEffect(() => {
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const shareAccess = await getFolderExshareAccess(token);
        setAccess(shareAccess);

        const effectiveFolderId = folderId || shareAccess.folders?.[0]?.id;
        if (!effectiveFolderId) {
          setItems([]);
          return;
        }

        if (!folderId) {
          router.replace(`/folder-exshare/${token}/documents?folderId=${effectiveFolderId}`);
          return;
        }

        const folderItems = await getFolderExshareFolderContents(token, effectiveFolderId);
        setItems(folderItems || []);

        const nameFromAccess = shareAccess.folders.find((f) => f.id === effectiveFolderId)?.name;
        setCurrentFolderName(nameFromAccess || "Folder");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Unable to load shared folder documents");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, folderId, router]);

  const folders = useMemo(() => items.filter((item) => item.type === "folder"), [items]);
  const documents = useMemo(() => items.filter((item) => item.type === "file"), [items]);

  const handleOpenDocument = (doc: FolderExshareItem) => {
    setSelectedDocId(doc.id);
    setSelectedDocName(doc.name);
    setSelectedDocMimeType(doc.mimeType || "");
    setSelectedDocSize(doc.size || 0);
    setViewerOpen(true);
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto p-6">Loading shared documents...</div>;
  }

  if (!access) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Share not available</h1>
        <p className="text-muted-foreground mt-2">This shared folder link is invalid or not verified.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Shared Folder Documents</h1>
          <p className="text-muted-foreground mt-1">{currentFolderName}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/folder-exshare/${token}`}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Share
          </Link>
        </Button>
      </div>

      {access.folders.length > 1 && (
        <div className="rounded-lg border p-3 bg-white">
          <p className="text-sm text-muted-foreground mb-2">Shared Root Folders</p>
          <div className="flex flex-wrap gap-2">
            {access.folders.map((folder) => (
              <Button
                key={folder.id}
                variant={folder.id === folderId ? "default" : "outline"}
                size="sm"
                onClick={() => router.push(`/folder-exshare/${token}/documents?folderId=${folder.id}`)}
              >
                {folder.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4 bg-white">
          <h2 className="font-semibold mb-3">Folders</h2>
          {folders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subfolders.</p>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  className="w-full border rounded-md p-3 text-left hover:bg-muted/50 transition"
                  onClick={() => router.push(`/folder-exshare/${token}/documents?folderId=${folder.id}`)}
                >
                  <span className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{folder.name}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4 bg-white">
          <h2 className="font-semibold mb-3">Documents</h2>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents in this folder.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  className="w-full border rounded-md p-3 text-left hover:bg-muted/50 transition"
                  onClick={() => handleOpenDocument(doc)}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{doc.name}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* External Document Viewer Modal */}
      <ExternalDocumentViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        shareToken={token}
        documentId={selectedDocId}
        documentName={selectedDocName}
        documentMimeType={selectedDocMimeType}
        documentSize={selectedDocSize}
      />
    </div>
  );
}
