"use client";

import { apiClient, uploadClient } from "@/api/client";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth, useAuthUser } from "@/providers/auth.provider";

export interface DocumentItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  url?: string;
  reviews?: Array<{ id: string; status: string }>;
}

interface FolderPath {
  id: string | null;
  name: string;
}

export function useDocuments() {
  const { user } = useAuthUser();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧭 Root path starts from "Root"
  const [path, setPath] = useState<FolderPath[]>([{ id: null, name: "Root" }]);

  // 🔍 Show only items in the current folder
  const visibleItems = documents.filter((doc) => doc.parentId === path[path.length - 1].id);

  const currentFolderId = path[path.length - 1]?.id ?? null;

  /** 📂 Fetch documents and folders */
  const fetchDocuments = useCallback(async (parentId: string | null = null) => {
    setLoading(true);
    try {
      // Currently backend only supports root-level fetching
      // TODO: Implement /folders/:id/documents endpoint when documents module is created
      let endpoint = `/folders/get/all/root`;

      if (parentId) {
        console.log(`parent id ${parentId}`);
        endpoint = `/folders/get/all/parent?parent=${parentId}`;
      }

      const response = await apiClient.get(endpoint);
      // Filter items by parentId if provided
      const items = response.data || [];
      console.log(response.data);

      const filtered = parentId
        ? items.filter((item: DocumentItem) => item.parentId === parentId)
        : items.filter((item: DocumentItem) => item.parentId === null);

      setDocuments(items); // Store all items for internal filtering
    } catch (error: any) {
      console.error("Failed to fetch documents:", error);
      toast.error(error.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch documents when path changes
  useEffect(() => {
    const currentParentId = path[path.length - 1].id;
    fetchDocuments(currentParentId);
  }, [path, fetchDocuments]);

  /** 📁 Create Folder */
  const createFolder = useCallback(
    async (name: string, parentFolderId?: string, type?: string, folderRequiredDocumentsId?: string) => {
      const targetFolderId = parentFolderId ?? currentFolderId;

      try {
        if (!user?.organizations || !user?.id) {
          toast.error("User information not available. Please log in again.");
          return;
        }

        const payload: any = {
          name,
          organizationId: user.organizations[0]?.id,
          parentFolderId: targetFolderId,
          createdById: user.id,
        };

        if (type) {
          payload.type = type;
        }

        if (folderRequiredDocumentsId) {
          payload.folderRequiredDocumentsId = folderRequiredDocumentsId;
        }

        const response = await apiClient.post("/folders/create", payload);

        const newFolder: DocumentItem = {
          id: response.data.id,
          name: response.data.name,
          type: "folder",
          parentId: targetFolderId,
          createdAt: response.data.createdAt || new Date().toISOString(),
        };

        setDocuments((prev) => [...prev, newFolder]);
        toast.success(`Folder "${name}" created successfully`);
      } catch (error: any) {
        console.error("Failed to create folder:", error);
        toast.error(error.response?.data?.message || "Failed to create folder");
        throw error;
      }
    },
    [currentFolderId, path, user]
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
    async (
      files: File[],
      onProgress?: (fileName: string, percent: number) => void,
      extra?: { documentTypeId?: string; targetFolderId?: string | null }
    ) => {
      const targetFolderId = extra?.targetFolderId ?? currentFolderId;

      // Get current organization and folder IDs
      const currentOrganizationId = user?.organizations?.[0]?.id;

      await Promise.all(
        files.map(async (file) => {
          const id = crypto.randomUUID();
          const toastId = toast.loading(`Preparing ${file.name}...`);

          try {
            // 1️⃣ Get presigned URL with folder path and metadata
            const presigned = await getPresignedUrl(file, currentOrganizationId, targetFolderId ?? undefined);

            // 2️⃣ Upload to bucket
            const cloudinaryResponse = await uploadToCloudinaryBucket(file, presigned, (percent) => {
              onProgress?.(file.name, percent);
              toast.message(`${file.name}: ${percent.toFixed(0)}%`, { id: toastId });
            });

            // 3️⃣ Complete upload with Cloudinary response
            await completeUpload(cloudinaryResponse, {
              file,
              name: file.name,
              folderId: targetFolderId,
              type: "file",
              size: file.size,
              documentTypeId: extra?.documentTypeId,
              organizationId: currentOrganizationId,
              uploadedById: user?.id,
              mimeType: file.type,
            });

            // ✅ Save the file under the current folder
            setDocuments((prev) => [
              ...prev,
              {
                id,
                name: file.name,
                type: "file",
                parentId: targetFolderId,
                size: file.size,
                mimeType: file.type,
                createdAt: new Date().toISOString(),
              },
            ]);
            toast.dismiss(toastId);
          } catch (error) {
            console.error("Upload error:", error);
            toast.error(`Upload failed`, { id: toastId });
            toast.dismiss(toastId);
          }

          toast.success(`${file.name} uploaded successfully`);
        })
      );
    },
    [currentFolderId, path, user]
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
  const getPresignedUrl = async (file: File, organizationId?: string, folderId?: string) => {
    try {
      // Build folder path (org_id/folder_id or just org_id)
      const folderPath = folderId ? `${organizationId}/${folderId}` : organizationId || "documents";

      // Build metadata to track in Cloudinary context
      const metadata: Record<string, string> = {
        uploaded_by: user?.id || "unknown",
        org_id: organizationId || "unknown",
      };

      if (folderId) {
        metadata.folder_id = folderId;
      }

      const res = await apiClient.post("/storage/upload-url", {
        fileName: file.name,
        contentType: file.type,
        folderPath,
        metadata,
      });
      return res.data; // { uploadUrl, publicUrl, fields }
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

        // Return the Cloudinary response which includes secure_url, public_id, resource_type, etc.
        return response.data;
      }
    } catch (err: any) {
      console.error("❌ Upload failed:", err.message);
      toast.error(`Upload failed for ${file.name}`);
      throw err;
    }
  };

  /** ✅ STEP 3: Notify backend upload is complete */
  const completeUpload = async (cloudinaryResponse: any, metadata: Record<string, any>) => {
    try {
      delete metadata.file;

      // Extract extension from filename
      const extension = metadata.name.substring(metadata.name.lastIndexOf(".") + 1).toLowerCase();

      // Determine resource type from Cloudinary response or file type
      const resourceType =
        cloudinaryResponse.resource_type || (metadata.mimeType?.startsWith("image/") ? "image" : "raw");

      await apiClient.post(`/storage/upload/complete`, {
        fileUrl: cloudinaryResponse.secure_url,
        cloudPublicId: cloudinaryResponse.public_id,
        resourceType,
        extension,
        previewUrl: cloudinaryResponse.thumbnail_url || cloudinaryResponse.eager?.[0]?.secure_url,
        pageCount: cloudinaryResponse.pages,
        visibility: "PRIVATE", // default visibility
        type: metadata.type,
        size: metadata.size,
        name: metadata.name,
        documentTypeId: metadata.documentTypeId,
        organizationId: metadata.organizationId,
        uploadedById: metadata.uploadedById,
        folderId: metadata.folderId,
        mimeType: metadata.mimeType,
      });
    } catch (err: any) {
      console.error("❌ Complete upload failed:", err.message);

      // Show specific error message from backend
      const errorMessage = err.response?.data?.message || "Failed to finalize upload";
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    documents,
    visibleItems,
    path,
    currentFolderId,
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
