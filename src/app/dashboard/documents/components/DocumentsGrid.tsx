"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Folder,
  User,
  FolderPlus,
  MoreVertical,
  Pencil,
  Share2,
  Trash,
  UploadCloud,
  Eye,
  FileSpreadsheet,
  File,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DocumentItem } from "../hooks/useDocuments";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ShareDialog from "./ShareDialog";
import ExshareDialog from "./ExshareDialog";
import FolderExshareDialog from "@/components/documents/FolderExshareDialog";
import DocumentDrawer from "./DocumentDrawer";
import DocumentViewerModal from "./DocumentViewerModal";
// (merged into the import above)
import { getFolderRequirementStatus, type FolderRequirementStatus } from "@/lib/folders.service";
import { getDocumentPermissions, hasDocumentPermission } from "@/lib/documents.service";
import { useAuth } from "@/providers/auth.provider";

interface Props {
  items: DocumentItem[];
  organizationId: string;
  onFolderOpen: (id: string, name: string) => void;
  onMove: (itemId: string, targetFolderId: string | null) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onShare: (id: string) => string; // returns share link
  onUploadComplete?: () => void;
  onOpenCreateFolder: () => void;
  onOpenUpload: () => void;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return <FileText className="h-10 w-10 text-red-600" />;
    case "docx":
    case "doc":
      return <FileText className="h-10 w-10 text-blue-600" />;
    case "xlsx":
    case "xls":
      return <FileSpreadsheet className="h-10 w-10 text-green-600" />;
    case "txt":
      return <File className="h-10 w-10 text-gray-600" />;
    default:
      return <FileText className="h-10 w-10 text-blue-600" />;
  }
};

export function DocumentsGrid({
  items,
  organizationId,
  onFolderOpen,
  onMove,
  onDelete,
  onRename,
  onShare,
  onUploadComplete,
  onOpenCreateFolder,
  onOpenUpload,
}: Props) {
  const { user } = useAuth();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const [renameTarget, setRenameTarget] = useState<DocumentItem | null>(null);
  const [shareTarget, setShareTarget] = useState<DocumentItem | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [exshareOpen, setExshareOpen] = useState(false);
  const [exshareDocId, setExshareDocId] = useState<string | null>(null);
  const [folderExshareOpen, setFolderExshareOpen] = useState(false);
  const [folderExshareTarget, setFolderExshareTarget] = useState<{ folderId: string; folderName: string } | null>(null);

  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocId, setViewerDocId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Requirement status cache per folder
  const [reqStatus, setReqStatus] = useState<Record<string, FolderRequirementStatus>>({});

  // Permission cache for documents
  const [docPermissions, setDocPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const staffFolders = items.filter(
      (i) => i.type === "folder" && i.folderType === "STAFF" && i.folderRequiredDocumentsId,
    );
    const missing = staffFolders.filter((f) => !reqStatus[f.id]);
    if (missing.length === 0) return;

    (async () => {
      try {
        const results = await Promise.all(
          missing.map((f) => getFolderRequirementStatus(f.id).then((res) => ({ id: f.id, status: res }))),
        );
        setReqStatus((prev) => {
          const next = { ...prev };
          for (const r of results) {
            next[r.id] = r.status;
          }
          return next;
        });
      } catch (e) {
        // silent fail; indicator will not render
      }
    })();
  }, [items]);

  const handleOpenDocDetails = (docId: string) => {
    setSelectedDoc(docId);
    setDrawerOpen(true);
  };

  const handleOpenDocDetailsWithPermissionCheck = async (docId: string) => {
    // Check if permission is already cached
    if (docPermissions[docId] !== undefined) {
      if (!docPermissions[docId]) {
        toast.error("You don't have permission to access this document");
        return;
      }
      handleOpenDocDetails(docId);
      return;
    }

    // Fetch permissions if not cached
    try {
      const permissions = await getDocumentPermissions(docId);
      const hasPermission = hasDocumentPermission(user?.id || "", user?.authentication?.role || "VIEWER", permissions);

      // Cache the permission result
      setDocPermissions((prev) => ({ ...prev, [docId]: hasPermission }));

      if (!hasPermission) {
        toast.error("You don't have permission to access this document");
        return;
      }

      handleOpenDocDetails(docId);
    } catch (error) {
      toast.error("Failed to verify permissions");
    }
  };

  const handleOpenViewer = (docId: string) => {
    setViewerDocId(docId);
    setViewerOpen(true);
  };

  // --- Rename logic ---
  const handleRenameSubmit = () => {
    if (!renameTarget) return;

    if (!newName.trim()) {
      toast.error("Please enter a valid name");
      return;
    }

    onRename(renameTarget.id, newName.trim());
    toast.success(`Renamed to "${newName.trim()}"`);
    setRenameDialogOpen(false);
    setRenameTarget(null);
    setNewName("");
  };

  // --- Share logic ---
  const handleShareOpen = (item: DocumentItem) => {
    setShareTarget(item);
    const link = onShare(item.id); // retrieve link from callback
    setShareLink(link);
    setShareDialogOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // --- Drag & Drop logic ---
  const handleDragStart = (id: string) => setDraggingId(id);

  const handleDrop = (targetId: string | null) => {
    if (draggingId && targetId !== draggingId) {
      onMove(draggingId, targetId);
      toast.success("Item moved successfully");
    }
    setDraggingId(null);
    setHoveredFolder(null);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setHoveredFolder(id);
  };

  const handleDragLeave = () => setHoveredFolder(null);

  // --- Empty state ---
  const role = user?.authentication?.role;
  const canManage = role === "SUPER_ADMIN" || role === "ADMINISTRATOR" || role === "MANAGER";

  const renderGridActionsMenu = () => (
    <ContextMenuContent>
      {canManage && (
        <ContextMenuItem onClick={onOpenCreateFolder}>
          <FolderPlus className="w-4 h-4 mr-2" /> New Folder
        </ContextMenuItem>
      )}
      {canManage && (
        <ContextMenuItem onClick={onOpenUpload}>
          <UploadCloud className="w-4 h-4 mr-2" /> Upload Document
        </ContextMenuItem>
      )}
    </ContextMenuContent>
  );

  if (items.length === 0)
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="min-h-2/3 flex flex-col items-center justify-center h-64 text-muted-foreground border border-dashed rounded-xl bg-blue-100">
            <Folder className="h-10 w-10 mb-2 opacity-60" />
            <p>No documents here yet</p>
          </div>
        </ContextMenuTrigger>
        {renderGridActionsMenu()}
      </ContextMenu>
    );

  const statusClass = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-300";
      case "FLAGGED_FOR_REVIEW":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "UNDER_REVIEW":
        return "bg-indigo-100 text-indigo-700 border-indigo-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            id="documents-grid"
            className="min-h-[50vh] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-blue-100"
          >
            {items.map((item) => {
              const reviewStatus = item.type === "file" ? item.reviews?.[0]?.status : undefined;
              const isApproved = reviewStatus === "APPROVED";
              const showBadge = item.type === "file" && reviewStatus && !isApproved;

              const card = (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => item.type === "folder" && handleDragOver(e, item.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => item.type === "folder" && handleDrop(item.id)}
                  className={`relative p-4 rounded-xl border bg-white shadow-sm transition group ${
                    hoveredFolder === item.id ? "border-amber-500 ring-2 ring-amber-200" : "hover:shadow-md"
                  } ${item.type === "file" && !isApproved ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  onDoubleClick={() =>
                    item.type === "folder"
                      ? onFolderOpen(item.id, item.name)
                      : isApproved && handleOpenDocDetailsWithPermissionCheck(item.id)
                  }
                  onClick={() => {
                    if (item.type !== "folder" && isApproved) {
                      handleOpenDocDetailsWithPermissionCheck(item.id);
                    }
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    {item.type === "folder" ? (
                      <div className="relative">
                        <Folder
                          className={`h-10 w-10 ${hoveredFolder === item.id ? "text-amber-600" : "text-gray-700"}`}
                        />
                        {item.folderType === "STAFF" && (
                          <span className="absolute -top-1 -right-1 bg-amber-100 border border-amber-300 rounded-full p-0.5">
                            <User className="h-3 w-3 text-amber-700" />
                          </span>
                        )}
                        {item.folderType === "STAFF" && reqStatus[item.id]?.applicable && (
                          <div className="absolute -bottom-1 right-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1 py-0 ${
                                reqStatus[item.id].remainingCount === 0
                                  ? "bg-green-50 border-green-300 text-green-700"
                                  : "bg-white border-amber-300 text-amber-700"
                              }`}
                              title={`Remaining: ${reqStatus[item.id].remainingCount} / ${
                                reqStatus[item.id].totalRequired
                              }`}
                            >
                              {reqStatus[item.id].remainingCount === 0
                                ? "Complete"
                                : `${reqStatus[item.id].remainingCount} left`}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      getFileIcon(item.name)
                    )}
                    <p className="text-sm text-center truncate w-full">{item.name}</p>
                    {item.type === "folder" && item.folderType === "STAFF" && (
                      <div className="w-full space-y-1">
                        {item.staff?.staffId && (
                          <p className="text-[11px] text-center text-muted-foreground truncate w-full">
                            Staff ID: {item.staff.staffId}
                          </p>
                        )}
                        {item.staff?.otherName && (
                          <p className="text-[11px] text-center text-muted-foreground truncate w-full">
                            Other Name: {item.staff.otherName}
                          </p>
                        )}
                      </div>
                    )}
                    {item.type === "file" && item.documentType && (
                      <p className="text-xs text-center text-muted-foreground truncate w-full">
                        {item.documentType.name}
                      </p>
                    )}
                  </div>

                  {(item.type === "folder" || isApproved) && (
                    <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-gray-800">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}

                  {showBadge && (
                    <div className="mt-3 w-full">
                      <Badge variant="outline" className={`w-full justify-center text-xs ${statusClass(reviewStatus)}`}>
                        {reviewStatus}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              );

              // Only enable item-level context menu if file is approved or item is a folder
              if (item.type === "file" && !isApproved) {
                return <div key={item.id}>{card}</div>;
              }

              return (
                <ContextMenu key={item.id}>
                  <ContextMenuTrigger>{card}</ContextMenuTrigger>

                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        if (item.type === "file") {
                          handleOpenDocDetailsWithPermissionCheck(item.id);
                        } else {
                          onFolderOpen(item.id, item.name);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" /> View
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setRenameTarget(item);
                        setNewName(item.name);
                        setRenameDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Rename
                    </ContextMenuItem>

                    {/* <ContextMenuItem
                      onClick={() => {
                        if (item.type === "file") {
                          setSelectedDocument(item.id);
                          setShareOpen(true);
                          return;
                        }

                        setFolderExshareTarget({ folderId: item.id, folderName: item.name });
                        setFolderExshareOpen(true);
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </ContextMenuItem> */}

                    <ContextMenuItem
                      onClick={() => {
                        if (item.type === "file") {
                          setExshareDocId(item.id);
                          setExshareOpen(true);
                        } else {
                          setFolderExshareTarget({ folderId: item.id, folderName: item.name });
                          setFolderExshareOpen(true);
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share via Email (Exshare)
                    </ContextMenuItem>

                    <ContextMenuItem
                      onClick={() => {
                        onDelete(item.id);
                        toast.success(`${item.name} deleted`);
                      }}
                      className="text-red-600 focus:text-red-700"
                    >
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
            <br />
          </div>
        </ContextMenuTrigger>
        {renderGridActionsMenu()}
      </ContextMenu>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              placeholder="Enter new name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} documentId={selectedDocument ?? ""} />

      <ExshareDialog open={exshareOpen} onClose={() => setExshareOpen(false)} documentId={exshareDocId} />

      <FolderExshareDialog
        open={folderExshareOpen}
        onClose={() => {
          setFolderExshareOpen(false);
          setFolderExshareTarget(null);
        }}
        organizationId={organizationId}
        target={
          folderExshareTarget
            ? {
                type: "folder",
                folderId: folderExshareTarget.folderId,
                folderName: folderExshareTarget.folderName,
              }
            : null
        }
      />

      <DocumentDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} documentId={selectedDoc} />

      <DocumentViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentId={viewerDocId}
        documentName={items.find((item) => item.id === viewerDocId)?.name}
        onShare={() => {
          if (viewerDocId) {
            setSelectedDocument(viewerDocId);
            setShareOpen(true);
          }
        }}
      />
    </>
  );
}
