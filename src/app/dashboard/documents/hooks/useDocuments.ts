"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface DocumentItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  size?: number;
  mimeType?: string;
  createdAt?: string;
}

interface FolderPath {
  id: string | null;
  name: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: "1", name: "Invoices", type: "folder", parentId: null },
    { id: "2", name: "Contracts", type: "folder", parentId: null },
    { id: "3", name: "Report.pdf", type: "file", parentId: null },
  ]);

  // 🧭 Root path starts from "Root"
  const [path, setPath] = useState<FolderPath[]>([{ id: null, name: "Root" }]);

  // 🔍 Show only items in the current folder
  const visibleItems = documents.filter((doc) => doc.parentId === path[path.length - 1].id);

  /** 📁 Create Folder */
  const createFolder = useCallback(
    (name: string) => {
      const newFolder: DocumentItem = {
        id: crypto.randomUUID(),
        name,
        type: "folder",
        parentId: path[path.length - 1].id,
        createdAt: new Date().toISOString(),
      };

      setDocuments((prev) => [...prev, newFolder]);
    },
    [path]
  );

  /** 📂 Open Folder */
  const openFolder = useCallback(
    (id: string) => {
      const folder = documents.find((f) => f.id === id && f.type === "folder");
      if (!folder) return;

      setPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    },
    [documents]
  );

  /** 🔙 Go back to breadcrumb folder */
  const goBackTo = useCallback((id: string | null) => {
    // setPath((prev) => prev.slice(0, index + 1));
    const index = path.findIndex((p) => p.id === id);
    setPath(path.slice(0, index + 1));
  }, []);

  /** 🔁 Move Item (drag & drop simulation) */
  const moveItem = useCallback((itemId: string, newParentId: string | null) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === itemId ? { ...doc, parentId: newParentId } : doc)));
  }, []);

  /** 🗑️ Delete Item */
  const deleteItem = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  /** ✏️ Rename Item */
  const renameItem = useCallback((id: string, newName: string) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, name: newName } : doc)));
  }, []);

  /** 📤 Upload Files (parallel) */
  const handleUpload = useCallback(
    async (files: File[], onProgress?: (fileName: string, percent: number) => void) => {
      const currentFolderId = path[path.length - 1].id;

      await Promise.all(
        files.map(async (file) => {
          const id = crypto.randomUUID();

          // Simulate upload progress
          for (let percent = 0; percent <= 100; percent += 20) {
            await new Promise((res) => setTimeout(res, 120));
            onProgress?.(file.name, percent);
          }

          // ✅ Save the file under the current folder
          setDocuments((prev) => [
            ...prev,
            {
              id,
              name: file.name,
              type: "file",
              parentId: currentFolderId,
              size: file.size,
              mimeType: file.type,
              createdAt: new Date().toISOString(),
            },
          ]);

          toast.success(`${file.name} uploaded successfully`);
        })
      );
    },
    [path]
  );

  /** ⛔ Cancel Upload (mocked) */
  const cancelUpload = useCallback((fileName: string) => {
    toast.info(`Cancelled upload for ${fileName}`);
  }, []);

  return {
    documents,
    visibleItems,
    path,
    createFolder,
    openFolder,
    goBackTo,
    moveItem,
    deleteItem,
    renameItem,
    handleUpload,
    cancelUpload,
  };
}
