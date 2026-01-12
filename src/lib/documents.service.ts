import { apiClient, apiRequest } from "@/api/client";

export type Document = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  documentType?: {
    id: string;
    name: string;
  } | null;
  folder?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentPreview = {
  url: string;
  expiresAt?: string;
};

export type DocumentActivity = {
  id: string;
  action: string;
  performedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
};

export type DocumentPermission = {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: string;
  grantedAt: string;
};

// Sharing types
export type SharedUser = {
  id: string;
  name: string;
  email: string;
  permission: "view" | "edit";
};

export type PublicShareInfo = {
  isPublic: boolean;
  permission: "view" | "edit";
  link?: string;
};

/**
 * Fetch a document by ID
 */
export async function getDocumentById(documentId: string): Promise<Document> {
  return apiRequest<Document>(() => apiClient.get(`/documents/${documentId}`));
}

/**
 * Get a preview/download URL for a document (Cloudinary)
 * @param documentId - The document ID
 * @param expiresInSeconds - URL expiration time in seconds (default: 300 = 5 minutes)
 */
export async function getDocumentPreviewUrl(
  documentId: string,
  expiresInSeconds: number = 300
): Promise<DocumentPreview> {
  return apiRequest<DocumentPreview>(() =>
    apiClient.get(`/documents/${documentId}/url`, {
      params: { expires: expiresInSeconds },
    })
  );
}

/**
 * Get document activities (view, download, share, etc.)
 */
export async function getDocumentActivities(documentId: string): Promise<DocumentActivity[]> {
  return apiRequest<DocumentActivity[]>(() => apiClient.get(`/documents/${documentId}/activities`));
}

/**
 * Get document permissions (who has access)
 */
export async function getDocumentPermissions(documentId: string): Promise<DocumentPermission[]> {
  return apiRequest<DocumentPermission[]>(() => apiClient.get(`/documents/${documentId}/permissions`));
}

/**
 * Download a document
 * Note: This returns the Cloudinary URL which can be used directly
 */
export async function downloadDocument(documentId: string): Promise<string> {
  const preview = await getDocumentPreviewUrl(documentId, 3600); // 1 hour expiry for downloads
  return preview.url;
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  await apiRequest<void>(() => apiClient.delete(`/documents/${documentId}`));
}

/**
 * Rename a document
 */
export async function renameDocument(documentId: string, newName: string): Promise<Document> {
  return apiRequest<Document>(() =>
    apiClient.patch(`/documents/${documentId}`, {
      name: newName,
    })
  );
}

/**
 * Move a document to a different folder
 */
export async function moveDocument(documentId: string, targetFolderId: string | null): Promise<Document> {
  return apiRequest<Document>(() =>
    apiClient.patch(`/documents/${documentId}`, {
      folderId: targetFolderId,
    })
  );
}

/**
 * Share a document and get a shareable link
 */
export async function shareDocument(documentId: string): Promise<string> {
  const response = await apiRequest<{ shareUrl: string }>(() => apiClient.post(`/documents/${documentId}/share`));
  return response.shareUrl;
}

/**
 * Sharing APIs
 */
export async function getDocumentShares(documentId: string): Promise<SharedUser[]> {
  return apiRequest<SharedUser[]>(() => apiClient.get(`/documents/${documentId}/shares`));
}

export async function addDocumentShare(
  documentId: string,
  payload: { userId: string; permission: "VIEW" | "EDIT" }
): Promise<SharedUser> {
  return apiRequest<SharedUser>(() => apiClient.post(`/documents/${documentId}/share`, payload));
}

export async function updateDocumentShare(
  documentId: string,
  userId: string,
  permission: "view" | "edit"
): Promise<SharedUser> {
  return apiRequest<SharedUser>(() => apiClient.patch(`/documents/${documentId}/share/${userId}`, { permission }));
}

export async function revokeDocumentShare(documentId: string, userId: string): Promise<void> {
  await apiRequest<void>(() => apiClient.delete(`/documents/${documentId}/share/${userId}`));
}

export async function getDocumentPublicShare(documentId: string): Promise<PublicShareInfo> {
  return apiRequest<PublicShareInfo>(() => apiClient.get(`/documents/${documentId}/public`));
}

export async function updateDocumentPublicShare(
  documentId: string,
  payload: { isPublic: boolean; permission: "view" | "edit" }
): Promise<PublicShareInfo> {
  return apiRequest<PublicShareInfo>(() => apiClient.patch(`/documents/${documentId}/public`, payload));
}
/**
 * Check if the current user has permission to access a document
 * @param userId - Current user ID
 * @param userRole - Current user's role (e.g., "ADMINISTRATOR", "EDITOR", "VIEWER")
 * @param permissions - Document permissions list
 * @returns true if user is admin or has explicit permission
 */
export function hasDocumentPermission(userId: string, userRole: string, permissions: DocumentPermission[]): boolean {
  // Admins have access to all documents
  if (userRole === "ADMINISTRATOR") {
    return true;
  }

  // Check if user is in the permissions list
  return permissions.some((p) => p.user.id === userId);
}
