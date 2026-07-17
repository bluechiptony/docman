"use client";

import { apiClient, uploadClient } from "@/api/client";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth, useAuthUser } from "@/providers/auth.provider";
import { organizationsApi } from "@/api/organizations";
import { getEffectiveUploadPolicy, validateFileAgainstPolicy } from "@/lib/upload-policy";

export interface DocumentItem {
  id: string;
  name: string;
  slug?: string;
  type: "folder" | "file";
  parentId: string | null;
  // When item is a folder, this indicates DB-level folder type (e.g., STAFF)
  folderType?: string;
  folderRequiredDocumentsId?: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  url?: string;
  reviews?: Array<{ id: string; status: string }>;
  documentType?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
    } | null;
  };
  staff?: {
    id: string;
    staffId?: string | null;
    otherName?: string | null;
    firstName?: string;
    lastName?: string;
  };
}

interface FolderPath {
  id: string | null;
  name: string;
  slug: string | null;
  folderType?: string;
  staff?: {
    id: string;
    staffId?: string | null;
    otherName?: string | null;
    firstName?: string;
    lastName?: string;
  };
}

const ROOT_PATH: FolderPath = { id: null, name: "Root", slug: null };

export function useDocuments() {
  const { user, isLoading: authLoading } = useAuthUser();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧭 Root path starts from "Root"
  const [path, setPath] = useState<FolderPath[]>([ROOT_PATH]);

  const currentPath = path[path.length - 1] ?? ROOT_PATH;

  // 🔍 Show only items in the current folder
  const visibleItems = documents.filter((doc) => doc.parentId === currentPath.id);

  const currentFolderId = currentPath.id;

  /** 📂 Fetch documents and folders */
  const fetchDocuments = useCallback(
    async (parentId: string | null = null) => {
      // Don't fetch if auth is still loading
      if (authLoading || !user) {
        return;
      }

      setLoading(true);
      try {
        const isSuperAdmin = user?.authentication?.role === "SUPER_ADMIN";
        const selectedOrgId = user?.selectedOrganization?.id;

        let endpoint = `/folders/get/all/root`;

        if (parentId) {
          endpoint = `/folders/get/all/parent?parent=${parentId}`;
        } else if (!isSuperAdmin && selectedOrgId) {
          // Non-super admins must provide their selected organization
          endpoint = `/folders/get/all/root?orgId=${selectedOrgId}`;
        }
        // Super admins without parentId get all organizations' folders

        const response = await apiClient.get(endpoint);
        // Filter items by parentId if provided
        const items = response.data || [];

        const filtered = parentId
          ? items.filter((item: DocumentItem) => item.parentId === parentId)
          : items.filter((item: DocumentItem) => item.parentId === null);

        setDocuments(items); // Store all items for internal filtering
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    },
    [authLoading, user?.authentication?.role, user?.selectedOrganization?.id, user?.id],
  );

  // Fetch documents when path changes
  useEffect(() => {
    // Skip fetch if auth is still loading
    if (authLoading) {
      return;
    }

    const currentParentId = currentPath.id;
    fetchDocuments(currentParentId);
  }, [currentPath.id, authLoading, fetchDocuments]);

  /** 📁 Create Folder */
  const createFolder = useCallback(
    async (name: string, parentFolderId?: string, type?: string, folderRequiredDocumentsId?: string) => {
      const targetFolderId = parentFolderId ?? currentFolderId;

      try {
        if (!user?.id) {
          toast.error("User information not available. Please log in again.");
          return;
        }

        const selectedOrgId = user?.selectedOrganization?.id;
        if (!selectedOrgId) {
          toast.error("Please select an organization first.");
          return;
        }

        const payload: any = {
          name,
          organizationId: selectedOrgId,
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
          // Ensure newly created folders carry backend metadata for requirements UI
          folderType: response.data.type,
          folderRequiredDocumentsId: response.data.folderRequiredDocumentsId,
        };

        setDocuments((prev) => [...prev, newFolder]);
        toast.success(`Folder "${name}" created successfully`);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to create folder");
        throw error;
      }
    },
    [currentFolderId, path, user],
  );

  /** 📂 Open Folder */
  const openFolder = useCallback(
    (id: string) => {
      const folder = documents.find((f) => f.id === id && f.type === "folder");
      if (!folder) return;

      setPath((prev) => [
        ...prev,
        {
          id: folder.id,
          name: folder.name,
          slug: folder.slug ?? null,
          folderType: folder.folderType,
          staff: folder.staff,
        },
      ]);
    },
    [documents],
  );

  /** 🎯 Navigate directly to a folder by id */
  const navigateToFolder = useCallback(
    (folderId: string) => {
      const target = documents.find((item) => item.id === folderId && item.type === "folder");
      if (!target) return;

      const pathById = new Map<string, FolderPath>();
      const itemById = new Map<string, DocumentItem>();

      documents.forEach((item) => {
        if (item.type === "folder") {
          itemById.set(item.id, item);
          pathById.set(item.id, {
            id: item.id,
            name: item.name,
            slug: item.slug ?? null,
            folderType: item.folderType,
            staff: item.staff,
          });
        }
      });

      const chain: FolderPath[] = [];
      let currentId: string | null = target.id;

      while (currentId) {
        const pathNode = pathById.get(currentId);
        if (!pathNode) break;

        chain.unshift(pathNode);
        const currentItem = itemById.get(currentId);
        currentId = currentItem?.parentId ?? null;
      }

      const nextPath = [ROOT_PATH, ...chain];

      setPath((prev) => {
        const prevIds = prev.map((item) => item.id).join("|");
        const nextIds = nextPath.map((item) => item.id).join("|");
        return prevIds === nextIds ? prev : nextPath;
      });
    },
    [documents],
  );

  /** 🔙 Go back to breadcrumb folder */
  const goBackTo = useCallback((id: string | null) => {
    setPath((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      if (index < 0) {
        return [ROOT_PATH];
      }

      const nextPath = prev.slice(0, index + 1);
      return nextPath.length ? nextPath : [ROOT_PATH];
    });
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
      extra?: { documentTypeId?: string; targetFolderId?: string | null },
    ) => {
      const targetFolderId = extra?.targetFolderId ?? currentFolderId;

      // Get current organization and folder IDs
      const currentOrganizationId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id;

      if (!currentOrganizationId) {
        toast.error("Organization context is required for upload");
        return;
      }

      const organization = await organizationsApi.getOrganizationById(currentOrganizationId);
      const policy = getEffectiveUploadPolicy({
        maxUploadSizeBytes: organization.maxUploadSizeBytes,
        allowedUploadExtensions: organization.allowedUploadExtensions,
      });

      const invalidFile = files.find((file) => !validateFileAgainstPolicy(file, policy).valid);
      if (invalidFile) {
        toast.error("One or more files are blocked by upload policy");
        return;
      }

      await Promise.all(
        files.map(async (file) => {
          const id = crypto.randomUUID();

          // 1️⃣ Get presigned URL with folder path and metadata
          const presigned = await getPresignedUrl(file, currentOrganizationId, targetFolderId ?? undefined);

          // 2️⃣ Upload to bucket
          const cloudinaryResponse = await uploadToCloudinaryBucket(file, presigned, (percent) => {
            onProgress?.(file.name, percent);
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
        }),
      );
    },
    [currentFolderId, path, user],
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
      toast.error(`Upload failed for ${file.name}`);
      throw err;
    }
  };

  /** 🚀 STEP 2: Upload directly to storage */
  const uploadToCloudinaryBucket = async (
    file: File,
    presigned: { uploadUrl: string; fields?: Record<string, string>; publicUrl?: string },
    onProgress?: (progress: number) => void,
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

        // Return the Cloudinary response which includes secure_url, public_id, resource_type, etc.
        return response.data;
      }
    } catch (err: any) {
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
    navigateToFolder,
    goBackTo,
    moveItem,
    deleteItem,
    renameItem,
    handleUpload,
    cancelUpload,
    addDocument,
  };
}
