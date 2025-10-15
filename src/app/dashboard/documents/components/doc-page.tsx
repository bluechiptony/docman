"use client";

import { useState } from "react";
import { Plus, FolderPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import { DocumentsGrid } from "./DocumentsGrid";
import UploadModal from "./UploadModal";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { useDocuments } from "../hooks/useDocuments";

export default function DocumentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { path, visibleItems, createFolder, openFolder, goBackTo, moveItem, handleUpload } = useDocuments();

  /** 🔴 Handle Delete */
  const handleDelete = (id: string) => {
    toast.warning("Item deleted");
  };

  /** 📁 New Folder */
  const handleNewFolder = () => {
    const folderName = prompt("Enter folder name");
    if (folderName) {
      createFolder(folderName);
      toast.success(`Folder "${folderName}" created`);
    }
  };

  /** 🔍 Filter documents by name */
  const filteredItems = visibleItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 h-full">
      <FolderBreadcrumb path={path} onNavigate={goBackTo} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <div className="flex gap-2">
          <Button onClick={handleNewFolder} variant="outline" size="sm">
            <FolderPlus className="mr-2 h-4 w-4" /> New Folder
          </Button>
          <Button onClick={() => setIsUploadOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search documents..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Documents Grid */}
      <div className="flex-1 overflow-y-auto">
        <DocumentsGrid
          items={filteredItems}
          onFolderOpen={openFolder}
          onMove={moveItem}
          onDelete={handleDelete}
          onRename={(id: string, newName: string) => {
            console.log("Rename", id, newName);
          }}
          onShare={(id: string) => {
            console.log("Share", id);
            return "";
          }}
        />
      </div>

      {/* Upload Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      <Toaster richColors position="top-right" />
    </div>
  );
}
