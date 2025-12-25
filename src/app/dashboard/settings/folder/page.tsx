"use client";
import React, { useState } from "react";
import FolderRequiredDocumentsList from "./components/FolderRequiredDocumentsList";
import CreateFolderRequiredDocumentsModal from "./components/CreateFolderRequiredDocumentsModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const FolderSettingsPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Folder Required Documents</h1>

        <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="bg-black text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Folder Config
        </Button>
      </div>

      <FolderRequiredDocumentsList reloadKey={reloadKey} />

      <CreateFolderRequiredDocumentsModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
};

export default FolderSettingsPage;
