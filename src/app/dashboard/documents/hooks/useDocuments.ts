"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

export type DocumentItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId?: string | null;
  progress?: number;
};

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: "1", name: "Invoices", type: "folder" },
    { id: "2", name: "CompanyProfile.pdf", type: "file" },
  ]);

  const [path, setPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: "Root" }]);

  // store ongoing upload controllers
  const uploadControllers = useRef<Record<string, AbortController>>({});

  const addFile = (file: File) => {
    const newFile: DocumentItem = {
      id: crypto.randomUUID(),
      name: file.name,
      type: "file",
      parentId: path[path.length - 1].id,
    };
    setDocuments((prev) => [...prev, newFile]);
  };

  const createFolder = (name: string) => {
    const newFolder: DocumentItem = {
      id: crypto.randomUUID(),
      name,
      type: "folder",
      parentId: path[path.length - 1].id,
    };
    setDocuments((prev) => [...prev, newFolder]);
    toast.success(`Folder "${name}" created`);
  };

  const openFolder = (id: string, name: string) => {
    setPath((prev) => [...prev, { id, name }]);
  };

  const goBackTo = (id: string | null) => {
    const index = path.findIndex((p) => p.id === id);
    setPath(path.slice(0, index + 1));
  };

  const visibleItems = documents.filter((doc) => doc.parentId === path[path.length - 1].id);

  const moveItem = (itemId: string, targetFolderId: string | null) => {
    setDocuments((prev) => prev.map((d) => (d.id === itemId ? { ...d, parentId: targetFolderId } : d)));
    toast.success("Item moved successfully");
  };

  // 🔥 New: parallel uploads with progress reporting
  //   const handleUpload = async (
  //     files: FileList,
  //     onProgress: (name: string, progress: number) => void
  //   ) => {
  //     const uploadPromises = Array.from(files).map(async (file) => {
  //       let progress = 0;
  //       const uploadInterval = setInterval(() => {
  //         progress += Math.random() * 10;
  //         if (progress >= 100) progress = 100;
  //         onProgress(file.name, progress);
  //       }, 200);

  //       // Simulate upload duration
  //       await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));
  //       clearInterval(uploadInterval);

  //       addFile(file);
  //       onProgress(file.name, 100);
  //     });

  //     await Promise.all(uploadPromises);
  //     toast.success(`${files.length} file(s) uploaded successfully`);
  //   };

  // Multiple files upload in parallel with per-file progress callbacks
  const handleUpload = async (files: File[], onProgress: (fileName: string, percent: number) => void) => {
    await Promise.all(
      files.map(async (file) => {
        const totalSteps = 10;

        for (let i = 1; i <= totalSteps; i++) {
          await new Promise((r) => setTimeout(r, 150)); // simulate upload latency
          onProgress(file.name, Math.round((i / totalSteps) * 100));
        }

        addFile(file);
      })
    );
  };

  const cancelUpload = (fileName: string) => {
    const controller = uploadControllers.current[fileName];
    if (controller) controller.abort();
  };

  return {
    path,
    visibleItems,
    createFolder,
    openFolder,
    goBackTo,
    moveItem,
    handleUpload,
    cancelUpload
  };
}
