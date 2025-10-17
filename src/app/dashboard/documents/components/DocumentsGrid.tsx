"use client";

import { motion } from "framer-motion";
import { FileText, Folder, MoreVertical, Pencil, Share2, Trash, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentItem } from "../hooks/useDocuments";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ShareDialog from "./ShareDialog";
import DocumentDrawer from "./DocumentDrawer";

interface Props {
  items: DocumentItem[];
  onFolderOpen: (id: string, name: string) => void;
  onMove: (itemId: string, targetFolderId: string | null) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onShare: (id: string) => string; // returns share link
}

export function DocumentsGrid({ items, onFolderOpen, onMove, onDelete, onRename, onShare }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const [renameTarget, setRenameTarget] = useState<DocumentItem | null>(null);
  const [shareTarget, setShareTarget] = useState<DocumentItem | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDocDetails = (docId: string) => {
    setSelectedDoc(docId);
    console.log("open resource in func");
    setDrawerOpen(true);
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
  if (items.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border border-dashed rounded-xl">
        <Folder className="h-10 w-10 mb-2 opacity-60" />
        <p>No documents here yet</p>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => item.type === "folder" && handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => item.type === "folder" && handleDrop(item.id)}
                className={`relative cursor-pointer p-4 rounded-xl border bg-white shadow-sm transition group ${
                  hoveredFolder === item.id ? "border-amber-500 ring-2 ring-amber-200" : "hover:shadow-md"
                }`}
                onDoubleClick={() =>
                  item.type === "folder" ? onFolderOpen(item.id, item.name) : handleOpenDocDetails(item.id)
                }
                onClick={() => {
                  item.type === "folder" ? null : handleOpenDocDetails(item.id);
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  {item.type === "folder" ? (
                    <Folder className={`h-10 w-10 ${hoveredFolder === item.id ? "text-amber-600" : "text-gray-700"}`} />
                  ) : (
                    <FileText className="h-10 w-10 text-blue-600" />
                  )}
                  <p className="text-sm text-center truncate w-full">{item.name}</p>
                </div>

                <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-gray-800">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </motion.div>
            </ContextMenuTrigger>

            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setRenameTarget(item);
                  setNewName(item.name);
                  setRenameDialogOpen(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Rename
              </ContextMenuItem>

              <ContextMenuItem
                onClick={() => {
                  setSelectedDocument(item.id);
                  setShareOpen(true);
                }}
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
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
        ))}
      </div>

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

      <DocumentDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} documentId={selectedDoc} />
    </>
  );
}
