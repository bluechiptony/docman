"use client";

import { apiClient, uploadClient } from "@/api/client";
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
  url?: string;
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
          const toastId = toast.loading(`Preparing ${file.name}...`);

          // Simulate upload progress
          // for (let percent = 0; percent <= 100; percent += 20) {
          //   await new Promise((res) => setTimeout(res, 120));
          //   onProgress?.(file.name, percent);
          // }

          try {
            // 1️⃣ Get presigned URL
            const presigned = await getPresignedUrl(file);

            // 2️⃣ Upload to bucket
            const secUrl = await uploadToCloudinaryBucket(file, presigned, (percent) => {
              onProgress?.(file.name, percent);
              toast.message(`${file.name}: ${percent.toFixed(0)}%`, { id: toastId });
            });

            // 3️⃣ Complete upload
            // await completeUpload(fileId, file, storageKey);
            await completeUpload(secUrl, {
              file,
              name: file.name,
              parentId: currentFolderId,
              type: "file",
              size: file.size,
            });

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
          } catch (error) {
            toast.message(`Upload failed`, { id: toastId });
            toast.dismiss(toastId);
          }

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

  // Inside useDocuments.ts
  const addDocument = (fileName: string, fileUrl: string) => {
    const currentFolderId = path[path.length - 1].id;
    const newDoc: DocumentItem = {
      id: Date.now().toString(),
      name: fileName,
      type: "file",
      parentId: currentFolderId,
      url: fileUrl,
    };

    setDocuments((prev) => [...prev, newDoc]);
  };

  /** 📤 STEP 1: Request a presigned URL from backend */
  const getPresignedUrl = async (file: File) => {
    try {
      const res = await apiClient.post("/storage/upload-url", {
        filename: file.name,
        contentType: file.type,
      });
      return res.data; // { uploadUrl, fileId, storageKey }
    } catch (err: any) {
      console.error("❌ Presign failed:", err.message);
      toast.error(`Failed to prepare upload for ${file.name}`);
      throw err;
    }
  };

  /** 🚀 STEP 2: Upload directly to storage */
  const uploadToBucket = async (file: File, uploadUrl: string, onProgress?: (progress: number) => void) => {
    try {
      await uploadClient.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onProgress?.(percent);
        },
      });
    } catch (err: any) {
      console.error("❌ Upload failed:", err.message);
      toast.error(`Upload failed for ${file.name}`);
      throw err;
    }
  };

  /** 🚀 STEP 2: Upload directly to storage */
  const uploadToCloudinaryBucket = async (
    file: File,
    presigned: { uploadUrl: string; fields?: Record<string, string>; publicUrl?: string },
    onProgress?: (progress: number) => void
  ) => {
    try {
      if (presigned.fields && Object.keys(presigned.fields).length > 0) {
        const formData = new FormData();

        // Add Cloudinary / form fields
        Object.entries(presigned.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });

        formData.append("file", file);

        const response = await uploadClient.post(presigned.uploadUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / (event.total ?? 1));
            onProgress?.(percent);
          },
        });
        console.log("✅ Cloudinary upload response:", response.data);

        return response.data.secure_url;
      }
    } catch (err: any) {
      console.error("❌ Upload failed:", err.message);
      toast.error(`Upload failed for ${file.name}`);
      throw err;
    }
  };

  /** ✅ STEP 3: Notify backend upload is complete */
  const completeUpload = async (fileId: string, metadata: Record<string, any>) => {
    try {
      metadata.fileNameUrl = fileId;
      delete metadata.file;
      console.log("🔵 Completing upload with metadata:", metadata);

      await apiClient.post(`/storage/upload/complete`, {
        fileUrl: fileId,
        type: metadata.type,
        size: metadata.size,
        name: metadata.name,
      });
    } catch (err: any) {
      console.error("❌ Complete upload failed:", err.message);
      toast.warning(`Failed to finalize upload`);
    }
  };

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
    addDocument,
  };
}
