import { apiClient, apiRequest } from "./client";

export interface FolderRequiredDocuments {
  id: string;
  name: string;
  documentTypes: { id: string; name: string; description: string | null }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderRequiredDocumentsPayload {
  name: string;
  documentTypeIds: string[];
  organizationId: string;
}

export interface UpdateFolderRequiredDocumentsPayload {
  name?: string;
  documentTypeIds?: string[];
}

export const folderRequiredDocumentsApi = {
  /**
   * Get all folder required documents configurations for an organization
   */
  getByOrganization: (organizationId: string) =>
    apiRequest<FolderRequiredDocuments[]>(() =>
      apiClient.get(`/folder-required-documents`, { params: { organizationId } })
    ),

  /**
   * Get a single configuration by ID
   */
  getById: (id: string) => apiRequest<FolderRequiredDocuments>(() => apiClient.get(`/folder-required-documents/${id}`)),

  /**
   * Create a new configuration
   */
  create: (payload: CreateFolderRequiredDocumentsPayload) =>
    apiRequest<FolderRequiredDocuments>(() => apiClient.post(`/folder-required-documents`, payload)),

  /**
   * Update a configuration
   */
  update: (id: string, payload: UpdateFolderRequiredDocumentsPayload) =>
    apiRequest<FolderRequiredDocuments>(() => apiClient.put(`/folder-required-documents/${id}`, payload)),

  /**
   * Delete a configuration
   */
  delete: (id: string) => apiRequest<void>(() => apiClient.delete(`/folder-required-documents/${id}`)),
};
