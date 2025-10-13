"use client";

import { useState } from "react";
import {
  Search,
  Upload,
  FolderPlus,
  Folder,
  ChevronRight,
  ArrowLeft,
  Eye,
  Trash2,
  Download,
  FileText,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UploadDocumentsModal from "@/components/documents/UploadDocumentModal";
import DocumentDetailsDrawer from "@/components/documents/DocumentDetailsDrawer";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import ShareModal from "@/components/documents/ShareModal";
import { cn } from "@/lib/utils";

// --------- Types ----------
type FolderType = {
  id: string;
  name: string;
  parentId?: string | null;
  updatedAt: string;
};

type Document = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  updatedAt: string;
  folderId?: string | null;
  thumbnail?: string;
};

// --------- Mock Data ----------
const mockFolders: FolderType[] = [
  { id: "1", name: "HR", updatedAt: "2025-10-05", parentId: null },
  { id: "2", name: "Finance", updatedAt: "2025-09-28", parentId: null },
  { id: "3", name: "Policies", updatedAt: "2025-10-03", parentId: "1" },
];

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Employee Handbook.pdf",
    type: "PDF",
    size: "1.2 MB",
    uploadedBy: "Admin",
    updatedAt: "2025-10-01",
    folderId: "3",
    thumbnail: "/images/pdf-doc.svg",
  },
  {
    id: "2",
    name: "Payroll_October.xlsx",
    type: "Excel",
    size: "500 KB",
    uploadedBy: "Jane Doe",
    updatedAt: "2025-10-06",
    folderId: "2",
    thumbnail: "/images/ms-excel.svg",
  },
  {
    id: "3",
    name: "Company Overview.docx",
    type: "Word",
    size: "2.4 MB",
    uploadedBy: "John Smith",
    updatedAt: "2025-10-04",
    folderId: null,
    thumbnail: "/images/ms-word.svg",
  },
];

export default function DocumentsGrid() {
  const [folders, setFolders] = useState<FolderType[]>(mockFolders);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [draggedDoc, setDraggedDoc] = useState<Document | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [shareTarget, setShareTarget] = useState<Document | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (doc: Document) => {
    setDraggedDoc(doc);
  };

  const handleDragEnd = () => {
    setDraggedDoc(null);
    setDragOverFolder(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, folderId: string) => {
    e.preventDefault();
    if (draggedDoc) setDragOverFolder(folderId);
  };

  const handleDrop = (folderId: string) => {
    if (draggedDoc) {
      setDocuments((prev) => prev.map((doc) => (doc.id === draggedDoc.id ? { ...doc, folderId } : doc)));
    }
    setDragOverFolder(null);
    setDraggedDoc(null);
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setDrawerOpen(true);
  };

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    const newFolder: FolderType = {
      id: Date.now().toString(),
      name: folderName.trim(),
      updatedAt: new Date().toISOString(),
      parentId: null,
    };
    setFolders((prev) => [...prev, newFolder]);
    setFolderName("");
    setShowNewFolder(false);
  };

  const handleShare = (file: Document) => {
    setShareTarget(file);
    setShowShareModal(true);
  };

  const renderTree = (parentId: string | null = null, depth = 0) => {
    const filteredFolders = folders.filter((f) => f.parentId === parentId);
    const filteredDocs = documents.filter((d) => d.folderId === parentId);

    return (
      <div className="space-y-2">
        {filteredFolders.map((folder) => {
          const isOpen = !!openFolders[folder.id];
          const children = renderTree(folder.id, depth + 1);

          return (
            <div key={folder.id}>
              <div
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDrop={() => handleDrop(folder.id)}
                onClick={() => toggleFolder(folder.id)}
                className={cn(
                  "cursor-pointer flex items-center gap-2 p-2 rounded-md transition-all",
                  dragOverFolder === folder.id && "bg-amber-100 ring-1 ring-amber-400"
                )}
                style={{ marginLeft: depth * 16 }}
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform text-gray-500", isOpen && "rotate-90")} />
                <Folder className="text-amber-600 h-5 w-5" />
                <span className="font-medium text-gray-700 truncate">{folder.name}</span>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 space-y-2"
                  >
                    {children}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Documents under this folder */}
        {filteredDocs
          .filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((doc) => (
            <motion.div
              key={doc.id}
              draggable
              onDragStart={() => handleDragStart(doc)}
              onDragEnd={handleDragEnd}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleDocumentClick(doc)}
              className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md"
              style={{ marginLeft: depth * 24 }}
            >
              {doc.thumbnail ? (
                <img src={doc.thumbnail} alt={doc.name} className="h-8 w-8 object-contain" />
              ) : (
                <FileText className="text-gray-400" size={20} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.size}</p>
              </div>
            </motion.div>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">Documents</h1>
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={18} />
            Upload
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowNewFolder(true)}>
            <FolderPlus size={18} />
            New Folder
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-1/2">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <Input
          placeholder="Search documents or folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Folder + File Tree */}
      <div className="rounded-xl bg-white p-4 border border-gray-100 shadow-sm">{renderTree(null)}</div>

      {/* Upload Modal */}
      <UploadDocumentsModal parentFolderId={null} open={showUploadModal} onClose={() => setShowUploadModal(false)} />

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-80 space-y-4">
              <h3 className="text-lg font-semibold">New Folder</h3>
              <Input
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowNewFolder(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder}>Create</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Drawer */}
      <DocumentDetailsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} document={selectedDocument} />

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal open={showShareModal} onClose={() => setShowShareModal(false)} documentName={shareTarget.name} />
      )}
    </div>
  );
}
