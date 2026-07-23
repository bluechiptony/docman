import { apiClient, apiRequest } from "./client";
import { invalidateDocumentTypesCache } from "@/lib/document-types.service";

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentTypePayload {
  name: string;
  description?: string;
  organizationId: string;
  createdById: string;
}

export interface UpdateDocumentTypePayload {
  name?: string;
  description?: string;
}

export const documentTypesApi = {
  /**
   * Get all document types for an organization
   */
  getByOrganization: (organizationId: string) =>
    apiRequest<DocumentType[]>(() => apiClient.get(`/document-types`, { params: { organizationId } })),

  /**
   * Search document types by name
   */
  searchByName: (organizationId: string, searchTerm: string) =>
    apiRequest<DocumentType[]>(() =>
      apiClient.get(`/document-types/search`, { params: { organizationId, name: searchTerm } })
    ),

  /**
   * Get a single document type by ID
   */
  getById: (id: string) => apiRequest<DocumentType>(() => apiClient.get(`/document-types/${id}`)),

  /**
   * Create a new document type
   */
  create: async (payload: CreateDocumentTypePayload) => {
    const created = await apiRequest<DocumentType>(() => apiClient.post(`/document-types`, payload));
    invalidateDocumentTypesCache(payload.organizationId);
    return created;
  },

  /**
   * Update a document type
   */
  update: async (id: string, organizationId: string, payload: UpdateDocumentTypePayload) => {
    const updated = await apiRequest<DocumentType>(() =>
      apiClient.put(`/document-types/${id}`, payload, { params: { organizationId } }),
    );
    invalidateDocumentTypesCache(organizationId);
    return updated;
  },

  /**
   * Delete a document type
   */
  delete: async (id: string) => {
    await apiRequest<void>(() => apiClient.delete(`/document-types/${id}`));
    invalidateDocumentTypesCache();
  },
};
