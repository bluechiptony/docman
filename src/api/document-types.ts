import { apiClient, apiRequest } from "./client";

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
  create: (payload: CreateDocumentTypePayload) =>
    apiRequest<DocumentType>(() => apiClient.post(`/document-types`, payload)),

  /**
   * Update a document type
   */
  update: (id: string, organizationId: string, payload: UpdateDocumentTypePayload) =>
    apiRequest<DocumentType>(() => apiClient.put(`/document-types/${id}`, payload, { params: { organizationId } })),

  /**
   * Delete a document type
   */
  delete: (id: string) => apiRequest<void>(() => apiClient.delete(`/document-types/${id}`)),
};
