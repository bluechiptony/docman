"use client";
import React, { useState } from "react";
import DocumentTypesList from "./components/DocumentTypesList";
import CreateDocumentTypeModal from "./components/CreateDocumentTypeModal";

const DocumentTypesPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Document Types</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setIsCreateOpen(true)}
        >
          New Document Type
        </button>
      </div>

      <p className="text-gray-600 mb-6">Document types help organize and categorize documents in your system.</p>

      <DocumentTypesList reloadKey={reloadKey} />

      <CreateDocumentTypeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
};

export default DocumentTypesPage;
