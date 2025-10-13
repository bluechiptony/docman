"use client";

import { useState } from "react";
import { Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { DocumentsGrid } from "./DocumentsGrid";
import UploadModal from "./UploadModal";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { useDocuments } from "../hooks/useDocuments";

export default function DocumentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { path, visibleItems, createFolder, openFolder, goBackTo, moveItem, handleUpload } = useDocuments();

  /** 🔴 Handle Delete */
  const handleDelete = (id: string) => {
    // deleteItem(id);
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

  return (
    <div className="flex flex-col gap-6 h-full">
      <FolderBreadcrumb path={path} onNavigate={goBackTo} />

      <div className="flex justify-between items-center">
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

      <div className="flex-1 overflow-y-auto">
        <DocumentsGrid
          items={visibleItems}
          onFolderOpen={openFolder}
          onMove={moveItem}
          onDelete={handleDelete} // 🧩 new
        />
      </div>

      {/* <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen} onUpload={handleUpload} /> */}

      {/* Upload Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      <Toaster richColors position="top-right" />
    </div>
  );
}
