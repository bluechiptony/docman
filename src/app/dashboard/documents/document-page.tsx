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
import ShareModal from "@/components/documents/ShareModal";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

// --------- Types ----------
type Folder = {
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
const mockFolders: Folder[] = [
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

export default function DocumentViewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [shareTarget, setShareTarget] = useState<Document | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const [draggingDocId, setDraggingDocId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Filter based on folder and search
  const visibleFolders = folders.filter(
    (f) => f.parentId === currentFolderId && f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const visibleDocuments = documents.filter(
    (d) => d.folderId === currentFolderId && d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumb = (() => {
    const path: Folder[] = [];
    let folder = folders.find((f) => f.id === currentFolderId);
    while (folder) {
      path.unshift(folder);
      folder = folder.parentId ? folders.find((f) => f.id === folder?.parentId) : undefined;
    }
    return path;
  })();

  // ----- Actions -----
  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: folderName.trim(),
      updatedAt: new Date().toISOString(),
      parentId: currentFolderId,
    };
    setFolders((prev) => [...prev, newFolder]);
    setFolderName("");
    setShowNewFolder(false);
  };

  const handleRename = (item: Folder | Document, isFolder: boolean) => {
    const newName = prompt("Enter new name:", item.name);
    if (!newName) return;
    if (isFolder) {
      setFolders((prev) => prev.map((f) => (f.id === item.id ? { ...f, name: newName } : f)));
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === item.id ? { ...d, name: newName } : d)));
    }
  };

  const handleDelete = (item: Folder | Document, isFolder: boolean) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    if (isFolder) {
      setFolders((prev) => prev.filter((f) => f.id !== item.id));
      setDocuments((prev) => prev.filter((d) => d.folderId !== item.id));
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== item.id));
    }
  };

  const handleShare = (file: Document) => {
    setShareTarget(file);
    setShowShareModal(true);
  };

  const handleDropOnFolder = (folderId: string) => {
    if (!draggingDocId) return;
    setDocuments((prev) => prev.map((d) => (d.id === draggingDocId ? { ...d, folderId } : d)));
    setDraggingDocId(null);
    setDragOverFolderId(null);
  };

  // --- UI ---
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
            <span>Upload</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowNewFolder(true)}>
            <FolderPlus size={18} />
            <span>New Folder</span>
          </Button>
        </div>
      </div>

      {/* Search + Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <Input
            placeholder="Search documents or folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 sm:mt-0">
          {currentFolderId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const current = folders.find((f) => f.id === currentFolderId);
                setCurrentFolderId(current?.parentId || null);
              }}
            >
              <ArrowLeft size={16} />
            </Button>
          )}
          <button className="hover:text-amber-600 font-medium" onClick={() => setCurrentFolderId(null)}>
            Root
          </button>
          {breadcrumb.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-1">
              <ChevronRight size={14} />
              <button
                onClick={() => setCurrentFolderId(f.id)}
                className={`hover:text-amber-600 ${idx === breadcrumb.length - 1 ? "font-medium text-gray-700" : ""}`}
              >
                {f.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visibleFolders.length > 0 || visibleDocuments.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Folders */}
          {visibleFolders.map((folder) => (
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setCurrentFolderId(folder.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverFolderId(folder.id);
                  }}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={() => handleDropOnFolder(folder.id)}
                  className={`cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md border p-4 transition-all flex flex-col items-center justify-center ${
                    dragOverFolderId === folder.id ? "border-amber-500 ring-2 ring-amber-200" : "border-gray-100"
                  }`}
                >
                  <Folder size={48} className="text-amber-600 mb-3" />
                  <p className="text-sm font-medium text-gray-800 truncate">{folder.name}</p>
                  <p className="text-xs text-gray-400">Updated {folder.updatedAt}</p>
                </motion.div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={() => handleRename(folder, true)}>Rename</ContextMenuItem>
                <ContextMenuItem onClick={() => handleDelete(folder, true)}>Delete</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleShare(folder as unknown as Document)}>Share</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}

          {/* Documents */}
          {visibleDocuments.map((doc) => (
            <ContextMenu key={doc.id}>
              <ContextMenuTrigger>
                <motion.div
                  draggable
                  onDragStart={() => setDraggingDocId(doc.id)}
                  onDragEnd={() => setDraggingDocId(null)}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-4 transition-all"
                  onClick={() => {
                    setSelectedDocument(doc);
                    setDrawerOpen(true);
                  }}
                >
                  <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                    {doc.thumbnail ? (
                      <img src={doc.thumbnail} alt={doc.name} className="max-h-24 object-contain" />
                    ) : (
                      <FileText className="text-gray-400" size={40} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.size}</p>
                    <p className="text-xs text-gray-400">Updated {doc.updatedAt}</p>
                  </div>
                </motion.div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={() => handleRename(doc, false)}>Rename</ContextMenuItem>
                <ContextMenuItem onClick={() => handleDelete(doc, false)}>Delete</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleShare(doc)}>Share</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center rounded-xl bg-white shadow-inner border border-gray-100"
        >
          <Folder size={40} className="mb-4 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-700 mb-1">This folder is empty</h2>
          <p className="text-sm text-gray-500 mb-4">Try uploading documents or creating a new folder.</p>
          <Button onClick={() => setShowUploadModal(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Upload size={16} className="mr-2" />
            Upload Documents
          </Button>
        </motion.div>
      )}

      {/* Modals */}
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

      <UploadDocumentsModal
        parentFolderId={currentFolderId}
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      <DocumentDetailsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} document={selectedDocument} />

      {shareTarget && (
        <ShareModal open={showShareModal} onClose={() => setShowShareModal(false)} documentName={shareTarget.name} />
      )}
    </div>
  );
}
