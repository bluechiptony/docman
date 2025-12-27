"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@radix-ui/react-context-menu";
import ShareModal from "@/components/documents/ShareModal";

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

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId?: string;
  size?: string;
}

const initialData: FileItem[] = [
  { id: "1", name: "Invoices", type: "folder" },
  { id: "2", name: "Contracts", type: "folder" },
  { id: "3", name: "Employee Handbook.pdf", type: "file", size: "2.3 MB" },
  { id: "4", name: "Leave Policy.docx", type: "file", size: "1.1 MB" },
];

// --------- Component ----------
export default function DocumentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<FileItem[]>(initialData);

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState<FileItem | null>(null);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [shareTarget, setShareTarget] = useState<Document | null>(null); // <-- selected file/folder for sharing
  const [showShareModal, setShowShareModal] = useState(false);

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setDrawerOpen(true);
  };

  // Filter based on folder and search
  const visibleFolders = folders.filter(
    (f) => f.parentId === currentFolderId && f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const visibleDocuments = documents.filter(
    (d) => d.folderId === currentFolderId && d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Breadcrumb path
  const buildBreadcrumb = () => {
    const path: Folder[] = [];
    let folder = folders.find((f) => f.id === currentFolderId);
    while (folder) {
      path.unshift(folder);
      folder = folder.parentId ? folders.find((f) => f.id === folder?.parentId) : undefined;
    }
    return path;
  };

  const breadcrumb = buildBreadcrumb();

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: folderName.trim(),
      type: "folder",
      parentId: currentFolder?.id,
    };
    setFiles((prev) => [...prev, newFolder]);
    setFolderName("");
    setShowNewFolder(false);
  };

  const handleOpenFolder = (folder: FileItem) => {
    setCurrentFolder(folder);
  };

  const handleGoBack = () => {
    if (!currentFolder) return;
    const parent = files.find((f) => f.id === currentFolder.parentId);
    setCurrentFolder(parent || null);
  };

  const handleDelete = (file: Document) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  const handleRename = (file: Document) => {
    const newName = prompt("Enter new name:", file.name);
    if (newName) {
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, name: newName } : f)));
    }
  };

  const handleShare = (file: Document) => {
    setShareTarget(file);
    setShowShareModal(true);
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
            <span>Upload</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowNewFolder(true)}>
            <FolderPlus size={18} />
            <span>New Folder</span>
          </Button>
        </div>
      </div>

      {/* Search & Breadcrumb */}
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

        {/* Breadcrumb */}
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
                  key={folder.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-4 transition-all flex flex-col items-center justify-center"
                >
                  <Folder size={48} className="text-amber-600 mb-3" />
                  <p className="text-sm font-medium text-gray-800 truncate">{folder.name}</p>
                  <p className="text-xs text-gray-400">Updated {folder.updatedAt}</p>
                </motion.div>
              </ContextMenuTrigger>
              <ContextMenuContent className="min-w-[150px] bg-white rounded-md shadow-lg border border-gray-200 p-5 z-50">
                <ContextMenuItem className="py-2 cursor-pointer outline-none">Rename</ContextMenuItem>
                <ContextMenuItem className="py-2 cursor-pointer outline-none">Delete</ContextMenuItem>
                <ContextMenuItem className="py-2 cursor-pointer outline-none">Archive</ContextMenuItem>
                <ContextMenuItem className="py-2 cursor-pointer outline-none">Share</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}

          {/* Documents */}
          {visibleDocuments.map((doc) => (
            <ContextMenu key={doc.id}>
              <ContextMenuTrigger>
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-4 transition-all"
                  onClick={() => handleDocumentClick(doc)}
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
                  <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:text-amber-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/documents/${doc.id}/view`);
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-amber-600">
                        <Download size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </ContextMenuTrigger>
              <ContextMenuContent className="min-w-[150px] bg-white rounded-md shadow-lg border border-gray-200 p-5 z-50">
                <ContextMenuItem
                  className="py-2 cursor-pointer outline-none"
                  onClick={() => router.push(`/dashboard/documents/${doc.id}/view`)}
                >
                  View
                </ContextMenuItem>
                <ContextMenuItem className="py-2 cursor-pointer outline-none">Rename</ContextMenuItem>
                <ContextMenuItem className="py-2 cursor-pointer outline-none">Delete</ContextMenuItem>
                <ContextMenuItem className="py-2 cursor-pointer outline-none">Archive</ContextMenuItem>
                <ContextMenuItem className="py-2 cursor-pointer outline-none" onClick={() => handleShare(doc)}>
                  Share
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      ) : (
        // Empty State
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

      {/* Upload Modal */}
      <UploadDocumentsModal
        parentFolderId={currentFolder?.id} // Pass current folder
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      {/* <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={(uploaded) => setFiles((prev) => [...prev, ...uploaded])}
        parentFolderId={currentFolder?.id}
      /> */}

      {/* //TODO: Lets add the feature to give access to the document to more users */}
      <DocumentDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        document={selectedDocument}
        onDelete={(id) => console.log("Delete", id)}
        onDownload={(id) => console.log("Download", id)}
      />

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          documentName={shareTarget.name}
          documentId={shareTarget.id}
        />
      )}
    </div>
  );
}
